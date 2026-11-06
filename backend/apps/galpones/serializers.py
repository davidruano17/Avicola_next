import re
from rest_framework import serializers
from .models import Galpon

def extraer_peso_numerico(valor):
    if valor is None:
        return 0.0
    if isinstance(valor, (int, float)):
        return float(valor)
    texto = str(valor).strip().lower().replace(' ', '')
    es_kg = texto.endswith('kg')
    limpio = re.sub(r'[^\d.,]', '', texto)
    if not limpio:
        return 0.0
    limpio = limpio.replace(',', '.')
    try:
        num = float(limpio)
        return num if not es_kg else num * 1000.0
    except ValueError:
        return 0.0

class GalponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Galpon
        fields = [
            'galpon_id',
            'galp_fecha_ingreso',
            'galp_hora_ingreso',
            'galp_peso_promedio',
            'galp_numero_aves',
            'galp_numero_aves_inicial',
            'galp_semana_de_vida',
            'galp_linea_de_aves',
            'galp_responsable',
            'galp_certificados',
            'galp_observaciones',
        ]
        read_only_fields = ['galpon_id']

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)

        # Mapeo de alias de frontend
        if 'fecha' in data and 'galp_fecha_ingreso' not in data:
            data['galp_fecha_ingreso'] = data['fecha']
        if 'hora' in data and 'galp_hora_ingreso' not in data:
            hora_val = str(data['hora']).strip()
            if len(hora_val) == 5:  # HH:MM -> HH:MM:00
                hora_val += ':00'
            data['galp_hora_ingreso'] = hora_val

        # Peso promedio
        peso_raw = data.get('pesopromedio') or data.get('pesoPromedio') or data.get('galp_peso_promedio')
        if peso_raw is not None:
            data['galp_peso_promedio'] = round(extraer_peso_numerico(peso_raw), 2)

        # Número de aves
        aves_raw = data.get('numerodeaves') or data.get('numeroAves') or data.get('galp_numero_aves')
        if aves_raw is not None:
            try:
                data['galp_numero_aves'] = int(aves_raw)
            except (ValueError, TypeError):
                data['galp_numero_aves'] = 0

        # Semanas de vida
        semana_raw = data.get('semanadevida') or data.get('semanaDeVida') or data.get('galp_semana_de_vida')
        if semana_raw is not None:
            try:
                data['galp_semana_de_vida'] = round(float(semana_raw))
            except (ValueError, TypeError):
                data['galp_semana_de_vida'] = 1

        # Línea de aves
        linea_raw = data.get('linea') or data.get('lineaGenetica') or data.get('galp_linea_de_aves')
        if linea_raw:
            data['galp_linea_de_aves'] = str(linea_raw).strip()

        # Certificados
        cert_raw = data.get('certificados')
        if cert_raw is not None:
            if isinstance(cert_raw, dict):
                data['galp_certificados'] = cert_raw.get('name') or cert_raw.get('data') or ''
            else:
                data['galp_certificados'] = str(cert_raw)

        # Responsable
        resp = str(data.get('responsable') or data.get('galp_responsable') or '').strip()
        data['galp_responsable'] = resp or None

        # Número inicial de aves
        aves_ini = data.get('numeroAvesInicial') or data.get('galp_numero_aves_inicial') or data.get('galp_numero_aves')
        if aves_ini is not None:
            try:
                data['galp_numero_aves_inicial'] = int(aves_ini)
            except (ValueError, TypeError):
                data['galp_numero_aves_inicial'] = data.get('galp_numero_aves')

        # Persistir lote en metadatos de observaciones si se especifica un nombre de lote personalizado
        lote_val = str(data.get('lote') or data.get('galpon') or '').strip()
        obs_base = str(data.get('observaciones') or data.get('galp_observaciones') or '').strip()

        if lote_val and lote_val != str(data.get('galpon_id') or ''):
            data['galp_observaciones'] = f"[Lote:{lote_val}] {obs_base}".strip()
        elif obs_base:
            data['galp_observaciones'] = obs_base

        return super().to_internal_value(data)

    def to_representation(self, instance):
        ret = super().to_representation(instance)

        # Extraer metadatos nativos o de respaldo en observaciones
        obs = instance.galp_observaciones or ''
        responsable = instance.galp_responsable or ''
        lote = str(instance.galpon_id)
        numero_aves_inicial = instance.galp_numero_aves_inicial if instance.galp_numero_aves_inicial is not None else instance.galp_numero_aves

        match_meta = re.search(r'^\[(.*?)\]\s*(.*)$', obs, re.DOTALL)
        if match_meta:
            meta_content, obs_limpia = match_meta.groups()
            obs = obs_limpia
            for tag in meta_content.split('|'):
                partes = tag.strip().split(':', 1)
                if len(partes) == 2:
                    k, v = partes[0].strip(), partes[1].strip()
                    if k == 'Resp' and not responsable:
                        responsable = v
                    elif k == 'Lote':
                        lote = v
                    elif k == 'AvesIni' and instance.galp_numero_aves_inicial is None:
                        try:
                            numero_aves_inicial = int(v)
                        except ValueError:
                            pass

        ret['id'] = instance.galpon_id
        ret['galpon'] = lote
        ret['lote'] = lote
        ret['fecha'] = str(instance.galp_fecha_ingreso) if instance.galp_fecha_ingreso else ''
        ret['hora'] = str(instance.galp_hora_ingreso) if instance.galp_hora_ingreso else ''
        ret['pesoPromedio'] = float(instance.galp_peso_promedio) if instance.galp_peso_promedio else 0.0
        ret['numeroAves'] = instance.galp_numero_aves
        ret['numerodeaves'] = instance.galp_numero_aves
        ret['numeroAvesInicial'] = numero_aves_inicial
        ret['semanadevida'] = instance.galp_semana_de_vida
        ret['semanaDeVida'] = instance.galp_semana_de_vida
        ret['linea'] = instance.galp_linea_de_aves
        ret['responsable'] = responsable
        ret['certificados'] = instance.galp_certificados or ''
        ret['observaciones'] = obs

        return ret
