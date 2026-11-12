import re
import json
from rest_framework import serializers
from .models import ProduccionHuevos, ClasificacionHuevos, AlimentacionAves
from apps.galpones.models import Galpon
from apps.galpones.serializers import resolver_galpon, obtener_numero_galpon


class ProduccionHuevosSerializer(serializers.ModelSerializer):
    """
    Serializador de ProduccionHuevos 100% alineado con el frontend Next.js (prodfunfinal).
    Soporta lectura/escritura bidireccional de:
    - id / produccion_id
    - fecha / prod_fecha_recoleccion
    - hora / prod_hora_recoleccion
    - jornada / prod_jornada_recoleccion
    - edadSemanas / semanadevida / prod_semana_de_produccion
    - huevosBuenos / prod_huevos_buenos
    - huevosRotos / prod_huevos_rotos
    - descarte / prod_huevos_descarte
    - notas / prod_observaciones
    - lineaGenetica (persistida en metadatos sin migración DB)
    - trabajador (persistida en metadatos o usuario)
    - clasificado (True si tiene registro en ClasificacionHuevos)
    - totalHuevos (suma computada)
    """
    id = serializers.IntegerField(source='produccion_id', read_only=True)
    fecha = serializers.DateField(source='prod_fecha_recoleccion', required=False)
    hora = serializers.TimeField(source='prod_hora_recoleccion', required=False)
    jornada = serializers.SerializerMethodField(read_only=True)
    edadSemanas = serializers.SerializerMethodField(read_only=True)
    huevosBuenos = serializers.IntegerField(source='prod_huevos_buenos', required=False)
    huevosRotos = serializers.IntegerField(source='prod_huevos_rotos', required=False)
    descarte = serializers.IntegerField(source='prod_huevos_descarte', required=False)
    notas = serializers.SerializerMethodField(read_only=True)
    totalHuevos = serializers.SerializerMethodField(read_only=True)
    huevos = serializers.SerializerMethodField(read_only=True)
    clasificado = serializers.SerializerMethodField(read_only=True)
    lineaGenetica = serializers.SerializerMethodField(read_only=True)
    trabajador = serializers.SerializerMethodField(read_only=True)
    galpon = serializers.SerializerMethodField(read_only=True)
    galpon_id = serializers.IntegerField(source='galpon.galpon_id', read_only=True)

    class Meta:
        model = ProduccionHuevos
        fields = [
            'id',
            'produccion_id',
            'fecha',
            'prod_fecha_recoleccion',
            'hora',
            'prod_hora_recoleccion',
            'jornada',
            'prod_jornada_recoleccion',
            'edadSemanas',
            'prod_semana_de_produccion',
            'huevosBuenos',
            'prod_huevos_buenos',
            'huevosRotos',
            'prod_huevos_rotos',
            'descarte',
            'prod_huevos_descarte',
            'notas',
            'prod_observaciones',
            'totalHuevos',
            'huevos',
            'clasificado',
            'lineaGenetica',
            'trabajador',
            'galpon',
            'galpon_id',
            'usuario',
        ]
        read_only_fields = ['produccion_id', 'usuario']

    def _parse_metadata(self, obs):
        meta = {}
        if not obs or not obs.startswith('[META:'):
            return meta, obs or ""
        try:
            fin = obs.find(']')
            if fin != -1:
                header = obs[6:fin]
                clean_obs = obs[fin + 1:].strip()
                for part in header.split(';'):
                    if '=' in part:
                        k, v = part.split('=', 1)
                        meta[k.strip()] = v.strip()
                return meta, clean_obs
        except Exception:
            pass
        return meta, obs or ""

    def get_edadSemanas(self, obj):
        return obj.prod_semana_de_produccion

    def get_jornada(self, obj):
        meta, _ = self._parse_metadata(obj.prod_observaciones)
        if 'Jornada' in meta and meta['Jornada']:
            return meta['Jornada']
        return obj.prod_jornada_recoleccion or "Mañana"

    def get_notas(self, obj):
        _, clean = self._parse_metadata(obj.prod_observaciones)
        return clean

    def get_lineaGenetica(self, obj):
        meta, _ = self._parse_metadata(obj.prod_observaciones)
        if 'Linea' in meta and meta['Linea']:
            return meta['Linea']
        if obj.galpon and obj.galpon.galp_linea_de_aves:
            return obj.galpon.galp_linea_de_aves
        return "Hy-Line Brown"

    def get_trabajador(self, obj):
        meta, _ = self._parse_metadata(obj.prod_observaciones)
        if 'Trab' in meta and meta['Trab']:
            return meta['Trab']
        if obj.usuario and obj.usuario.usu_nombre_completo:
            return obj.usuario.usu_nombre_completo
        return "Operario Avícola"

    def get_totalHuevos(self, obj):
        return (obj.prod_huevos_buenos or 0) + (obj.prod_huevos_rotos or 0) + (obj.prod_huevos_descarte or 0)

    def get_huevos(self, obj):
        return self.get_totalHuevos(obj)

    def get_clasificado(self, obj):
        return hasattr(obj, 'clasificacion')

    def get_galpon(self, obj):
        if not obj.galpon:
            return "Galpón 1"
        return f"Galpón {obtener_numero_galpon(obj.galpon)}"

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)

        # Mapeo de fecha
        if 'fecha' in data:
            data['prod_fecha_recoleccion'] = data['fecha']
        elif 'fechaRecoleccion' in data:
            data['prod_fecha_recoleccion'] = data['fechaRecoleccion']

        # Mapeo de hora
        if 'hora' in data:
            val_hora = str(data['hora']).strip()
            if len(val_hora) == 5:
                val_hora += ":00"
            data['prod_hora_recoleccion'] = val_hora

        # Mapeo de jornada: soporta las 3 jornadas (Mañana, Mediodía / Medio día, Tarde)
        raw_jornada = str(data.get('jornada') or data.get('prod_jornada_recoleccion') or 'Mañana').strip()
        jornada_lower = raw_jornada.lower()

        if 'medio' in jornada_lower:
            data['prod_jornada_recoleccion'] = 'Medio día'
        elif 'tarde' in jornada_lower:
            data['prod_jornada_recoleccion'] = 'Tarde'
        else:
            data['prod_jornada_recoleccion'] = 'Mañana'

        # Mapeo de semana de producción / edad
        edad_val = data.get('edadSemanas') or data.get('semanadevida') or data.get('prod_semana_de_produccion') or 1
        try:
            edad_clean = int(float(str(edad_val).replace('Semanas', '').replace('sem', '').strip()))
            data['prod_semana_de_produccion'] = max(1, edad_clean)
        except (ValueError, TypeError):
            data['prod_semana_de_produccion'] = 1

        # Mapeo de huevos
        for f_front, f_db in [
            ('huevosBuenos', 'prod_huevos_buenos'),
            ('huevosRotos', 'prod_huevos_rotos'),
            ('descarte', 'prod_huevos_descarte')
        ]:
            if f_front in data:
                try:
                    data[f_db] = int(data[f_front] or 0)
                except (ValueError, TypeError):
                    data[f_db] = 0

        # Resolución de Galpón
        raw_galpon = data.get('galpon') or data.get('galpon_id') or data.get('galponOrigen')
        galpon_obj = resolver_galpon(raw_galpon)

        # Preservación de metadatos (Trabajador, Línea Genética) en prod_observaciones
        trab = str(data.get('trabajador') or '').strip()
        linea = str(data.get('lineaGenetica') or '').strip()
        raw_notas = str(data.get('notas') or data.get('prod_observaciones') or '').strip()

        meta_parts = []
        if trab:
            meta_parts.append(f"Trab={trab}")
        if linea:
            meta_parts.append(f"Linea={linea}")

        if meta_parts:
            header = f"[META:{';'.join(meta_parts)}]"
            data['prod_observaciones'] = f"{header} {raw_notas}".strip()[:300]
        elif raw_notas:
            data['prod_observaciones'] = raw_notas[:300]

        ret = super().to_internal_value(data)
        if galpon_obj:
            ret['galpon'] = galpon_obj
        return ret


class ClasificacionHuevosSerializer(serializers.ModelSerializer):
    """
    Serializador de ClasificacionHuevos 100% alineado con registro_clasificacion de Next.js.
    Soporta:
    - id / clasificacion_id
    - codigo (REC-001)
    - fecha / clas_fecha_clasificacion
    - galpon ("Galpón 01")
    - lote
    - responsable
    - unidades / total_clasificados
    - panales (unidades // 30)
    - totalSobrantes (unidades % 30)
    - detalles ({ C, B, A, AA, AAA, Jumbo })
    - sobrantesSiguiente ({ C, B, A, AA, AAA, Jumbo })
    - total / valorDinero
    - obs / observaciones
    - produccion (opcional o vinculada)
    """
    id = serializers.IntegerField(source='clasificacion_id', read_only=True)
    codigo = serializers.SerializerMethodField(read_only=True)
    fecha = serializers.DateField(source='clas_fecha_clasificacion', required=False)
    galpon = serializers.SerializerMethodField(read_only=True)
    galpon_id = serializers.IntegerField(source='galpon.galpon_id', read_only=True)
    lote = serializers.SerializerMethodField(read_only=True)
    responsable = serializers.SerializerMethodField(read_only=True)
    unidades = serializers.SerializerMethodField(read_only=True)
    panales = serializers.SerializerMethodField(read_only=True)
    totalSobrantes = serializers.SerializerMethodField(read_only=True)
    total = serializers.SerializerMethodField(read_only=True)
    valorDinero = serializers.SerializerMethodField(read_only=True)
    obs = serializers.SerializerMethodField(read_only=True)
    detalles = serializers.SerializerMethodField(read_only=True)
    sobrantesSiguiente = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ClasificacionHuevos
        fields = [
            'id',
            'clasificacion_id',
            'codigo',
            'fecha',
            'clas_fecha_clasificacion',
            'galpon',
            'galpon_id',
            'lote',
            'responsable',
            'unidades',
            'panales',
            'totalSobrantes',
            'total',
            'valorDinero',
            'obs',
            'clas_observaciones',
            'detalles',
            'sobrantesSiguiente',
            'clas_huevo_tipo_A',
            'clas_huevo_tipo_AA',
            'clas_huevo_tipo_AAA',
            'clas_huevo_tipo_B',
            'clas_huevo_tipo_C',
            'clas_huevo_tipo_Jumbo',
            'produccion',
            'usuario',
        ]
        read_only_fields = ['clasificacion_id', 'usuario']
        extra_kwargs = {
            'produccion': {'required': False, 'allow_null': True}
        }

    def _parse_metadata(self, obs):
        meta = {}
        if not obs or not obs.startswith('[META:'):
            return meta, obs or ""
        try:
            fin = obs.find(']')
            if fin != -1:
                header = obs[6:fin]
                clean_obs = obs[fin + 1:].strip()
                for part in header.split(';'):
                    if '=' in part:
                        k, v = part.split('=', 1)
                        meta[k.strip()] = v.strip()
                return meta, clean_obs
        except Exception:
            pass
        return meta, obs or ""

    def get_codigo(self, obj):
        return f"REC-{str(obj.clasificacion_id).zfill(3)}"

    def get_galpon(self, obj):
        if not obj.galpon:
            return "1"
        return str(obtener_numero_galpon(obj.galpon))

    def get_lote(self, obj):
        meta, _ = self._parse_metadata(obj.clas_observaciones)
        num = obtener_numero_galpon(obj.galpon) if obj.galpon else 1
        return meta.get('Lote') or f"Lote {num}"

    def get_responsable(self, obj):
        meta, _ = self._parse_metadata(obj.clas_observaciones)
        if 'Resp' in meta and meta['Resp']:
            return meta['Resp']
        if obj.usuario and obj.usuario.usu_nombre_completo:
            return obj.usuario.usu_nombre_completo
        return "Responsable Clasificación"

    def get_unidades(self, obj):
        return (
            (obj.clas_huevo_tipo_A or 0) +
            (obj.clas_huevo_tipo_AA or 0) +
            (obj.clas_huevo_tipo_AAA or 0) +
            (obj.clas_huevo_tipo_B or 0) +
            (obj.clas_huevo_tipo_C or 0) +
            (obj.clas_huevo_tipo_Jumbo or 0)
        )

    def get_panales(self, obj):
        return self.get_unidades(obj) // 30

    def get_totalSobrantes(self, obj):
        return self.get_unidades(obj) % 30

    def get_obs(self, obj):
        _, clean = self._parse_metadata(obj.clas_observaciones)
        return clean or "Sin observaciones"

    def get_valorDinero(self, obj):
        meta, _ = self._parse_metadata(obj.clas_observaciones)
        if 'Total' in meta:
            try:
                return float(meta['Total'])
            except ValueError:
                pass
        # Precios base si no están en metadatos
        precios = {
            'C': 10500, 'B': 12000, 'A': 13500,
            'AA': 15000, 'AAA': 16500, 'Jumbo': 18000
        }
        total = (
            ((obj.clas_huevo_tipo_C or 0) / 30) * precios['C'] +
            ((obj.clas_huevo_tipo_B or 0) / 30) * precios['B'] +
            ((obj.clas_huevo_tipo_A or 0) / 30) * precios['A'] +
            ((obj.clas_huevo_tipo_AA or 0) / 30) * precios['AA'] +
            ((obj.clas_huevo_tipo_AAA or 0) / 30) * precios['AAA'] +
            ((obj.clas_huevo_tipo_Jumbo or 0) / 30) * precios['Jumbo']
        )
        return round(total, 2)

    def get_total(self, obj):
        val = self.get_valorDinero(obj)
        return f"${val:,.0f}".replace(',', '.')

    def get_detalles(self, obj):
        return {
            'C': {'hoy': obj.clas_huevo_tipo_C or 0, 'anterior': 0, 'precio': '10.500'},
            'B': {'hoy': obj.clas_huevo_tipo_B or 0, 'anterior': 0, 'precio': '12.000'},
            'A': {'hoy': obj.clas_huevo_tipo_A or 0, 'anterior': 0, 'precio': '13.500'},
            'AA': {'hoy': obj.clas_huevo_tipo_AA or 0, 'anterior': 0, 'precio': '15.000'},
            'AAA': {'hoy': obj.clas_huevo_tipo_AAA or 0, 'anterior': 0, 'precio': '16.500'},
            'Jumbo': {'hoy': obj.clas_huevo_tipo_Jumbo or 0, 'anterior': 0, 'precio': '18.000'},
        }

    def get_sobrantesSiguiente(self, obj):
        return {
            'C': (obj.clas_huevo_tipo_C or 0) % 30,
            'B': (obj.clas_huevo_tipo_B or 0) % 30,
            'A': (obj.clas_huevo_tipo_A or 0) % 30,
            'AA': (obj.clas_huevo_tipo_AA or 0) % 30,
            'AAA': (obj.clas_huevo_tipo_AAA or 0) % 30,
            'Jumbo': (obj.clas_huevo_tipo_Jumbo or 0) % 30,
        }

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)

        # Fecha
        if 'fecha' in data and 'clas_fecha_clasificacion' not in data:
            data['clas_fecha_clasificacion'] = data['fecha']

        # Si viene tabla de detalles desde frontend: tableData = { C: { hoy: 10 }, ... }
        detalles = data.get('detalles')
        if isinstance(detalles, dict):
            if 'C' in detalles:
                data['clas_huevo_tipo_C'] = int(detalles['C'].get('hoy') or 0)
            if 'B' in detalles:
                data['clas_huevo_tipo_B'] = int(detalles['B'].get('hoy') or 0)
            if 'A' in detalles:
                data['clas_huevo_tipo_A'] = int(detalles['A'].get('hoy') or 0)
            if 'AA' in detalles:
                data['clas_huevo_tipo_AA'] = int(detalles['AA'].get('hoy') or 0)
            if 'AAA' in detalles:
                data['clas_huevo_tipo_AAA'] = int(detalles['AAA'].get('hoy') or 0)
            if 'Jumbo' in detalles:
                data['clas_huevo_tipo_Jumbo'] = int(detalles['Jumbo'].get('hoy') or 0)

        # Galpon
        raw_galpon = data.get('galpon') or data.get('galpon_id')
        galpon_obj = resolver_galpon(raw_galpon)

        # Resolver produccion de forma segura (evitar fallo si es null, ID local o ya clasificada)
        raw_prod = data.get('produccion') or data.get('produccion_id')
        prod_obj = None
        if raw_prod:
            try:
                pid = int(raw_prod)
                if pid < 100000000000:
                    cand = ProduccionHuevos.objects.filter(produccion_id=pid).first()
                    if cand:
                        ya_clas = ClasificacionHuevos.objects.filter(produccion_id=pid)
                        if self.instance:
                            ya_clas = ya_clas.exclude(clasificacion_id=self.instance.clasificacion_id)
                        if not ya_clas.exists():
                            prod_obj = cand
            except (ValueError, TypeError):
                pass
        data['produccion'] = prod_obj.produccion_id if prod_obj else None

        # Metadatos para clas_observaciones
        lote = str(data.get('lote') or '').strip()
        resp = str(data.get('responsable') or '').strip()
        total_raw = str(data.get('total') or data.get('valorDinero') or '').replace('$', '').replace('.', '').strip()
        obs_raw = str(data.get('obs') or data.get('observaciones') or data.get('clas_observaciones') or '').strip()

        meta_parts = []
        if lote:
            meta_parts.append(f"Lote={lote}")
        if resp:
            meta_parts.append(f"Resp={resp}")
        if total_raw:
            meta_parts.append(f"Total={total_raw}")

        if meta_parts:
            header = f"[META:{';'.join(meta_parts)}]"
            data['clas_observaciones'] = f"{header} {obs_raw}".strip()[:300]
        elif obs_raw:
            data['clas_observaciones'] = obs_raw[:300]

        ret = super().to_internal_value(data)
        if galpon_obj:
            ret['galpon'] = galpon_obj
        return ret


class AlimentacionAvesSerializer(serializers.ModelSerializer):
    """
    Serializador de AlimentacionAves alineado con el frontend (prodfunfinal).
    """
    id = serializers.IntegerField(source='alimentacion_id', read_only=True)
    fecha = serializers.DateField(source='alim_fecha', required=False)
    kg = serializers.DecimalField(source='alim_cant_alimento', max_digits=10, decimal_places=2, required=False)
    cantidad = serializers.DecimalField(source='alim_cant_alimento', max_digits=10, decimal_places=2, required=False, read_only=True)
    tipo = serializers.CharField(source='alim_tipo_alimento', required=False)
    galpon = serializers.SerializerMethodField(read_only=True)
    galpon_id = serializers.IntegerField(source='galpon.galpon_id', read_only=True)
    usuario_nombre = serializers.ReadOnlyField(source='usuario.usu_nombre_completo')

    class Meta:
        model = AlimentacionAves
        fields = [
            'id',
            'alimentacion_id',
            'fecha',
            'alim_fecha',
            'kg',
            'cantidad',
            'alim_cant_alimento',
            'tipo',
            'alim_tipo_alimento',
            'galpon',
            'galpon_id',
            'usuario',
            'usuario_nombre',
        ]
        read_only_fields = ['alimentacion_id', 'usuario']

    def get_galpon(self, obj):
        if not obj.galpon:
            return "Galpón 1"
        return f"Galpón {obtener_numero_galpon(obj.galpon)}"

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'fecha' in data:
            data['alim_fecha'] = data['fecha']
        if 'kg' in data:
            data['alim_cant_alimento'] = data['kg']
        elif 'cantidad' in data:
            data['alim_cant_alimento'] = data['cantidad']
        if 'tipo' in data:
            data['alim_tipo_alimento'] = data['tipo']
        if not data.get('alim_tipo_alimento'):
            data['alim_tipo_alimento'] = "Alimento Postura Fase 1"

        raw_galpon = data.get('galpon') or data.get('galpon_id')
        galpon_obj = resolver_galpon(raw_galpon)

        ret = super().to_internal_value(data)
        if galpon_obj:
            ret['galpon'] = galpon_obj
        return ret
