import re
from rest_framework import serializers
from django.db import transaction
from .models import MortalidadAves, MorbilidadAves, TratamientoAves
from apps.galpones.models import Galpon

def resolver_galpon(valor):
    if not valor:
        return Galpon.objects.first()
    if isinstance(valor, Galpon):
        return valor
    if isinstance(valor, dict):
        valor = valor.get('id') or valor.get('galpon_id')
    try:
        val_int = int(str(valor).strip())
        g = Galpon.objects.filter(galpon_id=val_int).first()
        if g:
            return g
    except (ValueError, TypeError):
        pass

    str_val = str(valor).strip()
    digits = re.findall(r'\d+', str_val)
    if digits:
        val_int = int(digits[0])
        g = Galpon.objects.filter(galpon_id=val_int).first()
        if g:
            return g

    return Galpon.objects.first()


class MortalidadAvesSerializer(serializers.ModelSerializer):
    """
    Serializador de MortalidadAves 100% compatible con el frontend Next.js (mortalidad).
    Soporta:
    - id / mortalidad_id
    - fecha / mort_fecha
    - galpon ("Galpón 01")
    - galponId (1)
    - cantidad / mort_cantidad_aves
    - edad / semanadevida (persistida en metadatos para evitar alterar MariaDB)
    - causa / mort_causa_muerte
    - necropsia / mort_resultado_necropsia
    - disposicion / mort_disposicion_final
    - responsable / usuario_nombre
    """
    id = serializers.IntegerField(source='mortalidad_id', read_only=True)
    fecha = serializers.DateField(source='mort_fecha', required=False)
    galpon = serializers.SerializerMethodField(read_only=True)
    galponId = serializers.IntegerField(source='galpon.galpon_id', read_only=True)
    cantidad = serializers.IntegerField(source='mort_cantidad_aves', required=False)
    edad = serializers.SerializerMethodField(read_only=True)
    causa = serializers.CharField(source='mort_causa_muerte', required=False)
    necropsia = serializers.SerializerMethodField(read_only=True)
    disposicion = serializers.CharField(source='mort_disposicion_final', required=False)
    responsable = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MortalidadAves
        fields = [
            'id',
            'mortalidad_id',
            'fecha',
            'mort_fecha',
            'galpon',
            'galponId',
            'cantidad',
            'mort_cantidad_aves',
            'edad',
            'mort_edad_semanas',
            'causa',
            'mort_causa_muerte',
            'necropsia',
            'mort_resultado_necropsia',
            'disposicion',
            'mort_disposicion_final',
            'responsable',
            'usuario',
        ]
        read_only_fields = ['mortalidad_id', 'usuario']

    def _parse_metadata(self, text):
        meta = {}
        if not text or not text.startswith('[META:'):
            return meta, text or ""
        try:
            fin = text.find(']')
            if fin != -1:
                header = text[6:fin]
                clean = text[fin + 1:].strip()
                for part in header.split(';'):
                    if '=' in part:
                        k, v = part.split('=', 1)
                        meta[k.strip()] = v.strip()
                return meta, clean
        except Exception:
            pass
        return meta, text or ""

    def get_galpon(self, obj):
        if not obj.galpon:
            return "Galpón 01"
        return f"Galpón {str(obj.galpon.galpon_id).zfill(2)}"

    def get_edad(self, obj):
        if hasattr(obj, 'mort_edad_semanas') and obj.mort_edad_semanas is not None:
            return obj.mort_edad_semanas
        meta, _ = self._parse_metadata(obj.mort_resultado_necropsia)
        if 'Edad' in meta:
            try:
                return int(meta['Edad'])
            except ValueError:
                pass
        if obj.galpon and obj.galpon.galp_semana_de_vida:
            return obj.galpon.galp_semana_de_vida
        return 1

    def get_necropsia(self, obj):
        _, clean = self._parse_metadata(obj.mort_resultado_necropsia)
        return clean or "No realizada"

    def get_responsable(self, obj):
        if obj.usuario and obj.usuario.usu_nombre_completo:
            return obj.usuario.usu_nombre_completo
        return "Encargado de Sanidad"

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)

        # Mapeos de campos directos
        if 'fecha' in data and 'mort_fecha' not in data:
            data['mort_fecha'] = data['fecha']
        if 'cantidad' in data and 'mort_cantidad_aves' not in data:
            data['mort_cantidad_aves'] = int(data['cantidad'] or 0)
        if 'causa' in data and 'mort_causa_muerte' not in data:
            data['mort_causa_muerte'] = data['causa']
        if 'disposicion' in data and 'mort_disposicion_final' not in data:
            data['mort_disposicion_final'] = data['disposicion']
        if not data.get('mort_disposicion_final'):
            data['mort_disposicion_final'] = "Compostaje en fosa biológica"

        # Resolver Galpón
        raw_galpon = data.get('galpon') or data.get('galponId') or data.get('galpon_id')
        galpon_obj = resolver_galpon(raw_galpon)
        if galpon_obj:
            data['galpon'] = galpon_obj.galpon_id

        # Mapear edad nativa a la columna de base de datos mort_edad_semanas
        raw_edad = data.get('edad') or data.get('semanadevida') or data.get('mort_edad_semanas')
        if raw_edad is not None:
            try:
                clean_num = int(re.sub(r'[^\d]', '', str(raw_edad)) or 1)
                data['mort_edad_semanas'] = clean_num
            except (ValueError, TypeError):
                data['mort_edad_semanas'] = galpon_obj.galp_semana_de_vida if (galpon_obj and galpon_obj.galp_semana_de_vida) else 1
        else:
            data['mort_edad_semanas'] = galpon_obj.galp_semana_de_vida if (galpon_obj and galpon_obj.galp_semana_de_vida) else 1

        raw_necropsia = str(data.get('necropsia') or data.get('mort_resultado_necropsia') or '').strip()
        data['mort_resultado_necropsia'] = raw_necropsia[:300] if raw_necropsia else None

        return super().to_internal_value(data)


class MorbilidadAvesSerializer(serializers.ModelSerializer):
    """
    Serializador de MorbilidadAves 100% compatible con el frontend Next.js (morbilidad).
    Soporta:
    - id / morbilidad_id
    - fecha / morb_fecha_reporte
    - galpon ("Galpón 01")
    - lote ("Galpón 01")
    - cantidad / morb_cant_aves_afectadas
    - afectacion (mapeo transparente entre 'Leve'/'Moderado'/'Crítico' y DB 'Bajo'/'Medio'/'Critico')
    - sintomas / morb_sintomas
    - accion / accion_inmediata (persistida en morb_concepto_veterinario)
    - observaciones (persistida en morb_concepto_veterinario)
    - responsable / usuario_nombre
    """
    id = serializers.IntegerField(source='morbilidad_id', read_only=True)
    fecha = serializers.DateField(source='morb_fecha_reporte', required=False)
    galpon = serializers.SerializerMethodField(read_only=True)
    galpon_id = serializers.IntegerField(source='galpon.galpon_id', read_only=True)
    lote = serializers.SerializerMethodField(read_only=True)
    cantidad = serializers.IntegerField(source='morb_cant_aves_afectadas', required=False)
    afectacion = serializers.SerializerMethodField(read_only=True)
    sintomas = serializers.CharField(source='morb_sintomas', required=False)
    accion = serializers.SerializerMethodField(read_only=True)
    observaciones = serializers.SerializerMethodField(read_only=True)
    responsable = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MorbilidadAves
        fields = [
            'id',
            'morbilidad_id',
            'fecha',
            'morb_fecha_reporte',
            'galpon',
            'galpon_id',
            'lote',
            'cantidad',
            'morb_cant_aves_afectadas',
            'afectacion',
            'morb_grado_afectacion',
            'sintomas',
            'morb_sintomas',
            'accion',
            'observaciones',
            'morb_concepto_veterinario',
            'responsable',
            'usuario',
        ]
        read_only_fields = ['morbilidad_id', 'usuario']

    def _parse_metadata(self, text):
        meta = {}
        if not text or not text.startswith('[META:'):
            return meta, text or ""
        try:
            fin = text.find(']')
            if fin != -1:
                header = text[6:fin]
                clean = text[fin + 1:].strip()
                for part in header.split(';'):
                    if '=' in part:
                        k, v = part.split('=', 1)
                        meta[k.strip()] = v.strip()
                return meta, clean
        except Exception:
            pass
        return meta, text or ""

    def get_galpon(self, obj):
        if not obj.galpon:
            return "Galpón 01"
        return f"Galpón {str(obj.galpon.galpon_id).zfill(2)}"

    def get_lote(self, obj):
        return self.get_galpon(obj)

    def get_afectacion(self, obj):
        # Mapeo hacia el frontend: 'Leve', 'Moderado', 'Crítico'
        mapping = {
            'Bajo': 'Leve',
            'Medio': 'Moderado',
            'Alto': 'Crítico',
            'Critico': 'Crítico',
        }
        return mapping.get(obj.morb_grado_afectacion, 'Moderado')

    def get_accion(self, obj):
        meta, clean = self._parse_metadata(obj.morb_concepto_veterinario)
        return meta.get('Accion') or clean or "Aislamiento preventivo"

    def get_observaciones(self, obj):
        meta, clean = self._parse_metadata(obj.morb_concepto_veterinario)
        return meta.get('Obs') or ""

    def get_responsable(self, obj):
        meta, _ = self._parse_metadata(obj.morb_concepto_veterinario)
        if 'Resp' in meta and meta['Resp']:
            return meta['Resp']
        if obj.usuario and obj.usuario.usu_nombre_completo:
            return obj.usuario.usu_nombre_completo
        return "Inspector Sanitario"

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)

        # Mapeos de campos directos
        if 'fecha' in data and 'morb_fecha_reporte' not in data:
            data['morb_fecha_reporte'] = data['fecha']
        if 'cantidad' in data and 'morb_cant_aves_afectadas' not in data:
            data['morb_cant_aves_afectadas'] = int(data['cantidad'] or 0)
        if 'sintomas' in data and 'morb_sintomas' not in data:
            data['morb_sintomas'] = str(data['sintomas'])[:255]

        # Mapeo de grado de afectación hacia las opciones válidas de MariaDB ('Bajo', 'Medio', 'Critico', 'Alto')
        raw_afectacion = str(data.get('afectacion') or data.get('morb_grado_afectacion') or '').strip().lower()
        if 'leve' in raw_afectacion or 'bajo' in raw_afectacion:
            data['morb_grado_afectacion'] = 'Bajo'
        elif 'crit' in raw_afectacion or 'alto' in raw_afectacion:
            data['morb_grado_afectacion'] = 'Critico'
        else:
            data['morb_grado_afectacion'] = 'Medio'

        # Resolver Galpón
        raw_galpon = data.get('galpon') or data.get('galpon_id')
        galpon_obj = resolver_galpon(raw_galpon)
        if galpon_obj:
            data['galpon'] = galpon_obj.galpon_id

        # Empacar accion, observaciones y responsable en morb_concepto_veterinario
        accion = str(data.get('accion') or data.get('accion_inmediata') or '').strip()
        obs = str(data.get('observaciones') or '').strip()
        resp = str(data.get('responsable') or '').strip()

        meta_parts = []
        if accion:
            meta_parts.append(f"Accion={accion}")
        if obs:
            meta_parts.append(f"Obs={obs}")
        if resp:
            meta_parts.append(f"Resp={resp}")

        concepto_base = str(data.get('morb_concepto_veterinario') or '').strip()
        if meta_parts:
            header = f"[META:{';'.join(meta_parts)}]"
            data['morb_concepto_veterinario'] = f"{header} {concepto_base}".strip()[:255]
        elif concepto_base:
            data['morb_concepto_veterinario'] = concepto_base[:255]
        else:
            data['morb_concepto_veterinario'] = "Evaluación clínica de lote"

        return super().to_internal_value(data)


class TratamientoAvesSerializer(serializers.ModelSerializer):
    """
    Serializador de TratamientoAves 100% compatible con el frontend Next.js (tratamiento).
    Soporta tratamientos autónomos (morbilidad opcional).
    Campos:
    - id / tratamiento_id
    - fechaInicio / fecha / trat_fecha_tratamiento
    - galpon ("Galpón 01")
    - medicamento / trat_tratamiento
    - tipo / trat_tipo_tratamiento
    - viaAdministracion / trat_via_administracion
    - dosis / trat_dosis_suministro
    - duracion / trat_duracion_tratamiento
    - responsable / trat_medico_veterinario
    - operario / trat_operario_encargado
    - observaciones / trat_observaciones / trat_diagnostico
    - estado ('Activo' | 'Completado')
    """
    id = serializers.IntegerField(source='tratamiento_id', read_only=True)
    fechaInicio = serializers.DateField(source='trat_fecha_tratamiento', required=False)
    fecha = serializers.DateField(source='trat_fecha_tratamiento', required=False)
    galpon = serializers.SerializerMethodField(read_only=True)
    galpon_id = serializers.IntegerField(source='galpon.galpon_id', read_only=True)
    medicamento = serializers.CharField(source='trat_tratamiento', required=False)
    tipo = serializers.CharField(source='trat_tipo_tratamiento', required=False)
    viaAdministracion = serializers.CharField(source='trat_via_administracion', required=False)
    dosis = serializers.CharField(source='trat_dosis_suministro', required=False)
    duracion = serializers.IntegerField(source='trat_duracion_tratamiento', required=False)
    responsable = serializers.CharField(source='trat_medico_veterinario', required=False)
    operario = serializers.CharField(source='trat_operario_encargado', required=False)
    observaciones = serializers.SerializerMethodField(read_only=True)
    estado = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = TratamientoAves
        fields = [
            'id',
            'tratamiento_id',
            'fechaInicio',
            'fecha',
            'trat_fecha_tratamiento',
            'galpon',
            'galpon_id',
            'medicamento',
            'trat_tratamiento',
            'tipo',
            'trat_tipo_tratamiento',
            'viaAdministracion',
            'trat_via_administracion',
            'dosis',
            'trat_dosis_suministro',
            'duracion',
            'trat_duracion_tratamiento',
            'responsable',
            'trat_medico_veterinario',
            'operario',
            'trat_operario_encargado',
            'observaciones',
            'trat_diagnostico',
            'trat_observaciones',
            'estado',
            'morbilidad',
            'usuario',
        ]
        read_only_fields = ['tratamiento_id', 'usuario']
        extra_kwargs = {
            'morbilidad': {'required': False, 'allow_null': True}
        }

    def _parse_metadata(self, text):
        meta = {}
        if not text or not text.startswith('[META:'):
            return meta, text or ""
        try:
            fin = text.find(']')
            if fin != -1:
                header = text[6:fin]
                clean = text[fin + 1:].strip()
                for part in header.split(';'):
                    if '=' in part:
                        k, v = part.split('=', 1)
                        meta[k.strip()] = v.strip()
                return meta, clean
        except Exception:
            pass
        return meta, text or ""

    def get_galpon(self, obj):
        if not obj.galpon:
            return "Galpón 01"
        return f"Galpón {str(obj.galpon.galpon_id).zfill(2)}"

    def get_observaciones(self, obj):
        _, clean = self._parse_metadata(obj.trat_observaciones)
        return clean or obj.trat_diagnostico or ""

    def get_estado(self, obj):
        meta, _ = self._parse_metadata(obj.trat_observaciones)
        return meta.get('Estado') or 'Activo'

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)

        # Mapeo de fecha
        fecha_val = data.get('fechaInicio') or data.get('fecha') or data.get('trat_fecha_tratamiento')
        if fecha_val:
            data['trat_fecha_tratamiento'] = str(fecha_val).split('T')[0]

        # Mapeos de campos directos
        if 'medicamento' in data and 'trat_tratamiento' not in data:
            data['trat_tratamiento'] = str(data['medicamento'])[:50]
        if 'tipo' in data and 'trat_tipo_tratamiento' not in data:
            data['trat_tipo_tratamiento'] = str(data['tipo'])[:50]
        if 'viaAdministracion' in data and 'trat_via_administracion' not in data:
            data['trat_via_administracion'] = str(data['viaAdministracion'])[:50]
        if 'dosis' in data and 'trat_dosis_suministro' not in data:
            data['trat_dosis_suministro'] = str(data['dosis'])[:20]
        if 'duracion' in data and 'trat_duracion_tratamiento' not in data:
            try:
                data['trat_duracion_tratamiento'] = int(data['duracion'] or 1)
            except (ValueError, TypeError):
                data['trat_duracion_tratamiento'] = 1

        # Mapeo de responsable -> trat_medico_veterinario
        resp = str(data.get('responsable') or data.get('trat_medico_veterinario') or 'Médico Veterinario').strip()
        data['trat_medico_veterinario'] = resp[:45]

        # Mapeo de operario -> trat_operario_encargado
        operario = str(data.get('operario') or data.get('trat_operario_encargado') or resp).strip()
        data['trat_operario_encargado'] = operario[:45]

        # Mapeo de observaciones -> trat_diagnostico y metadato de estado
        raw_obs = str(data.get('observaciones') or data.get('diagnostico') or data.get('trat_diagnostico') or 'Tratamiento veterinario').strip()
        data['trat_diagnostico'] = raw_obs[:300]

        estado = str(data.get('estado') or 'Activo').strip()
        header = f"[META:Estado={estado}]"
        data['trat_observaciones'] = f"{header} {raw_obs}".strip()[:100]

        # Resolver Galpón
        raw_galpon = data.get('galpon') or data.get('galpon_id')
        galpon_obj = resolver_galpon(raw_galpon)
        if galpon_obj:
            data['galpon'] = galpon_obj.galpon_id

        # Autonomía de Tratamientos: resolver o asociar morbilidad sin forzar al frontend
        raw_morb = data.get('morbilidad') or data.get('morbilidad_id')
        if not raw_morb and galpon_obj:
            latest_morb = MorbilidadAves.objects.filter(galpon=galpon_obj).order_by('-morbilidad_id').first()
            if latest_morb:
                data['morbilidad'] = latest_morb.morbilidad_id
            else:
                # Si no existe ninguna morbilidad en el galpón, vincular a la primera disponible del sistema
                first_morb = MorbilidadAves.objects.first()
                if first_morb:
                    data['morbilidad'] = first_morb.morbilidad_id

        return super().to_internal_value(data)
