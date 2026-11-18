import re
from datetime import date, time
from rest_framework import serializers
from .models import Galpon


def obtener_numero_galpon(galpon_obj):
    """
    Obtiene el número de galpón visible para el usuario (galp_numero_galpon),
    con respaldo a metadatos en observaciones o galpon_id si es 0/nulo.
    """
    if not galpon_obj:
        return 1
    num = getattr(galpon_obj, 'galp_numero_galpon', None)
    if num is not None and int(num) > 0:
        return int(num)
    obs = getattr(galpon_obj, 'galp_observaciones', '') or ''
    match_lote = re.search(r'\[Lote:\s*0*(\d+)\]', obs, re.IGNORECASE)
    if match_lote:
        return int(match_lote.group(1))
    return int(galpon_obj.galpon_id or 1)


def resolver_galpon(valor, galpon_id_explicit=None):
    """
    Resuelve una instancia de Galpon a partir de:
    - galpon_id_explicit (ID primario exacto cuando el frontend envía galponId)
    - Número de galpón (galp_numero_galpon: e.g. 1, "01", "Galpón 1", "Lote 02")
    - Instancia de Galpon o diccionario
    Si el galpón aún no existe en MySQL, lo crea automáticamente con galp_numero_galpon.
    """
    if isinstance(valor, Galpon):
        return valor

    if galpon_id_explicit is not None:
        try:
            gid_exp = int(str(galpon_id_explicit).strip())
            g_exp = Galpon.objects.filter(galpon_id=gid_exp).first()
            if g_exp:
                return g_exp
        except (ValueError, TypeError):
            pass

    if isinstance(valor, dict):
        raw_id_dict = valor.get('galpon_id') or valor.get('id')
        if raw_id_dict is not None:
            try:
                gid_dict = int(str(raw_id_dict).strip())
                g_dict = Galpon.objects.filter(galpon_id=gid_dict).first()
                if g_dict:
                    return g_dict
            except (ValueError, TypeError):
                pass
        valor = valor.get('galp_numero_galpon') or valor.get('galpon') or valor.get('lote')

    val_int = None
    if valor is not None:
        try:
            val_int = int(str(valor).strip())
        except (ValueError, TypeError):
            digits = re.findall(r'\d+', str(valor).strip())
            if digits:
                val_int = int(digits[0])

    if val_int is not None:
        # 1. Priorizar búsqueda por número de galpón (galp_numero_galpon)
        g_num = Galpon.objects.filter(galp_numero_galpon=val_int).order_by('-galpon_id').first()
        if g_num:
            return g_num
        # 2. Respaldo en etiqueta de observaciones [Lote:X]
        g_lote = (
            Galpon.objects.filter(galp_observaciones__icontains=f"[Lote:{val_int}]").order_by('-galpon_id').first()
            or Galpon.objects.filter(galp_observaciones__icontains=f"[Lote:0{val_int}]").order_by('-galpon_id').first()
        )
        if g_lote:
            return g_lote
        # 3. Respaldo por llave primaria galpon_id
        g_id = Galpon.objects.filter(galpon_id=val_int).first()
        if g_id:
            return g_id

    first_g = Galpon.objects.order_by('galp_numero_galpon', 'galpon_id').first()
    if first_g and val_int is None:
        return first_g

    lote_num = val_int if val_int is not None else 1
    return Galpon.objects.create(
        galp_numero_galpon=lote_num,
        galp_fecha_ingreso=date.today(),
        galp_hora_ingreso=time(8, 0),
        galp_peso_promedio=1200.00,
        galp_numero_aves=1000,
        galp_numero_aves_inicial=1000,
        galp_semana_de_vida=18,
        galp_linea_de_aves='Hy-line brown',
        galp_responsable='Instructor Líder (Admin)',
        galp_observaciones='Galpón registrado automáticamente',
    )


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
            'galp_numero_galpon',
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

        # Número de galpón (galp_numero_galpon)
        num_galp_raw = (
            data.get('galp_numero_galpon')
            or data.get('numeroGalpon')
            or data.get('galpon')
            or data.get('lote')
        )
        if num_galp_raw is not None:
            digits = re.findall(r'\d+', str(num_galp_raw).strip())
            if digits:
                data['galp_numero_galpon'] = max(1, int(digits[0]))
            else:
                data['galp_numero_galpon'] = 1
        elif not getattr(self.instance, 'galp_numero_galpon', None):
            data['galp_numero_galpon'] = 1

        # Mapeo de alias de frontend
        if 'fecha' in data:
            data['galp_fecha_ingreso'] = data['fecha']
        if 'hora' in data:
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
                cert_str = str(cert_raw.get('name') or '').strip()
            else:
                cert_str = str(cert_raw).strip()
                if cert_str.startswith('data:'):
                    cert_str = 'certificado_adjunto'
            data['galp_certificados'] = cert_str[:255] if cert_str else None

        # Responsable
        resp = str(data.get('responsable') or data.get('galp_responsable') or '').strip()
        data['galp_responsable'] = resp[:100] if resp else None

        # Número inicial de aves
        aves_ini = data.get('numeroAvesInicial') or data.get('galp_numero_aves_inicial') or data.get('galp_numero_aves')
        if aves_ini is not None:
            try:
                data['galp_numero_aves_inicial'] = int(aves_ini)
            except (ValueError, TypeError):
                data['galp_numero_aves_inicial'] = data.get('galp_numero_aves')

        # Observaciones limpias
        obs_base = str(data.get('observaciones') or data.get('galp_observaciones') or '').strip()
        obs_base = re.sub(r'^\[Lote:.*?\]\s*', '', obs_base).strip()
        data['galp_observaciones'] = obs_base[:300] if obs_base else None

        return super().to_internal_value(data)

    def to_representation(self, instance):
        ret = super().to_representation(instance)

        # Extraer metadatos nativos o de respaldo en observaciones
        obs = instance.galp_observaciones or ''
        responsable = instance.galp_responsable or ''
        num_galpon = obtener_numero_galpon(instance)
        lote = str(num_galpon)
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
                    elif k == 'AvesIni' and instance.galp_numero_aves_inicial is None:
                        try:
                            numero_aves_inicial = int(v)
                        except ValueError:
                            pass

        ret['id'] = instance.galpon_id
        ret['galpon_id'] = instance.galpon_id
        ret['galp_numero_galpon'] = num_galpon
        ret['numeroGalpon'] = lote
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
