import re
import json
from rest_framework import serializers
from .models import FinanzasUdAvicola
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


class FinanzasUdAvicolaSerializer(serializers.ModelSerializer):
    """
    Serializador de Finanzas 100% compatible con el frontend Next.js (finanzas).
    Soporta:
    - id / finanzas_ud_avicola_id
    - fecha / fnzs_fecha_operacion
    - concepto / fnzs_concepto_operacion
    - tipo / fnzs_tipo_operacion ('Ingreso' | 'Gasto')
    - categoria ('Venta de Huevos', 'Alimentos', 'Salud/Vet', 'Infraestructura', 'Mano de Obra', 'Otros Gastos')
    - monto / fnzs_monto_total
    - estado / fnzs_estado_operacion ('Completado', 'Pendiente', 'Cancelado')
    - detalle (persistido en metadatos sin migración DB)
    - tipoHuevos / fnzs_clasificacion_panal ('C', 'B', 'A', 'AA', 'AAA', 'Jumbo', 'Mixto')
    - panalesVendidos / fnzs_panales_vendidos
    - precioPorPanal / fnzs_precio_panal
    - desgloseInventario (lista de items clasificados)
    - galpon ("Galpón 01")
    - galpon_id
    """
    id = serializers.IntegerField(source='finanzas_ud_avicola_id', read_only=True)
    fecha = serializers.DateField(source='fnzs_fecha_operacion', required=False)
    concepto = serializers.SerializerMethodField(read_only=True)
    tipo = serializers.CharField(source='fnzs_tipo_operacion', required=False)
    categoria = serializers.SerializerMethodField(read_only=True)
    monto = serializers.FloatField(source='fnzs_monto_total', required=False)
    estado = serializers.CharField(source='fnzs_estado_operacion', required=False)
    detalle = serializers.SerializerMethodField(read_only=True)
    tipoHuevos = serializers.CharField(source='fnzs_clasificacion_panal', required=False, allow_null=True)
    panalesVendidos = serializers.IntegerField(source='fnzs_panales_vendidos', required=False, allow_null=True)
    precioPorPanal = serializers.FloatField(source='fnzs_precio_panal', required=False, allow_null=True)
    desgloseInventario = serializers.SerializerMethodField(read_only=True)
    galpon = serializers.SerializerMethodField(read_only=True)
    galpon_id = serializers.IntegerField(source='galpon.galpon_id', read_only=True)
    usuario_nombre = serializers.ReadOnlyField(source='usuario.usu_nombre_completo')

    class Meta:
        model = FinanzasUdAvicola
        fields = [
            'id',
            'finanzas_ud_avicola_id',
            'fecha',
            'fnzs_fecha_operacion',
            'concepto',
            'fnzs_concepto_operacion',
            'tipo',
            'fnzs_tipo_operacion',
            'categoria',
            'fnzs_categoria_gasto',
            'monto',
            'fnzs_monto_total',
            'estado',
            'fnzs_estado_operacion',
            'detalle',
            'tipoHuevos',
            'fnzs_clasificacion_panal',
            'panalesVendidos',
            'fnzs_panales_vendidos',
            'precioPorPanal',
            'fnzs_precio_panal',
            'desgloseInventario',
            'galpon',
            'galpon_id',
            'usuario',
            'usuario_nombre',
        ]
        read_only_fields = ['finanzas_ud_avicola_id', 'usuario']

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

    def get_concepto(self, obj):
        _, clean = self._parse_metadata(obj.fnzs_concepto_operacion)
        return clean or obj.fnzs_concepto_operacion

    def get_detalle(self, obj):
        meta, _ = self._parse_metadata(obj.fnzs_concepto_operacion)
        return meta.get('Detalle') or "Operación registrada"

    def get_categoria(self, obj):
        meta, _ = self._parse_metadata(obj.fnzs_concepto_operacion)
        if 'Cat' in meta and meta['Cat']:
            return meta['Cat']
        # Mapeo fallback desde BD
        db_to_front = {
            'Ventas': 'Venta de Huevos',
            'Alimento': 'Alimentos',
            'Medicina': 'Salud/Vet',
            'Mantenimiento': 'Infraestructura',
            'Insumos': 'Mano de Obra',
            'Otro': 'Otros Gastos',
        }
        return db_to_front.get(obj.fnzs_categoria_gasto, 'Otros Gastos')

    def get_desgloseInventario(self, obj):
        meta, _ = self._parse_metadata(obj.fnzs_concepto_operacion)
        if 'Desglose' in meta:
            try:
                return json.loads(meta['Desglose'])
            except Exception:
                pass
        return None

    def get_galpon(self, obj):
        if not obj.galpon:
            return "Galpón 01"
        return f"Galpón {str(obj.galpon.galpon_id).zfill(2)}"

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)

        # Mapeos directos
        if 'fecha' in data and 'fnzs_fecha_operacion' not in data:
            data['fnzs_fecha_operacion'] = data['fecha']
        if 'tipo' in data and 'fnzs_tipo_operacion' not in data:
            data['fnzs_tipo_operacion'] = data['tipo']
        if 'monto' in data and 'fnzs_monto_total' not in data:
            data['fnzs_monto_total'] = float(data['monto'] or 0)
        if 'estado' in data and 'fnzs_estado_operacion' not in data:
            data['fnzs_estado_operacion'] = data['estado']

        if 'tipoHuevos' in data and 'fnzs_clasificacion_panal' not in data:
            val_h = data['tipoHuevos']
            data['fnzs_clasificacion_panal'] = val_h if val_h in ['A', 'AA', 'AAA', 'B', 'C', 'Jumbo', 'Mixto'] else 'Mixto'

        if 'panalesVendidos' in data and 'fnzs_panales_vendidos' not in data:
            try:
                data['fnzs_panales_vendidos'] = int(float(data['panalesVendidos'] or 0))
            except (ValueError, TypeError):
                data['fnzs_panales_vendidos'] = 0

        if 'precioPorPanal' in data and 'fnzs_precio_panal' not in data:
            try:
                data['fnzs_precio_panal'] = float(data['precioPorPanal'] or 0)
            except (ValueError, TypeError):
                data['fnzs_precio_panal'] = 0

        # Mapeo de Categoría frontend a enum DB
        front_cat = str(data.get('categoria') or data.get('fnzs_categoria_gasto') or '').strip()
        cat_mapping = {
            'Venta de Huevos': 'Ventas',
            'Alimentos': 'Alimento',
            'Salud/Vet': 'Medicina',
            'Infraestructura': 'Mantenimiento',
            'Mano de Obra': 'Insumos',
            'Otros Gastos': 'Otro',
        }
        data['fnzs_categoria_gasto'] = cat_mapping.get(front_cat, 'Otro')

        # Resolver Galpón
        raw_galpon = data.get('galpon') or data.get('galpon_id')
        galpon_obj = resolver_galpon(raw_galpon)
        if galpon_obj:
            data['galpon'] = galpon_obj.galpon_id

        # Empacar metadatos en fnzs_concepto_operacion
        concepto_base = str(data.get('concepto') or data.get('fnzs_concepto_operacion') or 'Operación Avícola').strip()
        detalle = str(data.get('detalle') or data.get('detalleVeterinario') or '').strip()
        desglose = data.get('desgloseInventario')

        meta_parts = []
        if front_cat:
            meta_parts.append(f"Cat={front_cat}")
        if detalle:
            meta_parts.append(f"Detalle={detalle}")
        if desglose and isinstance(desglose, list):
            try:
                meta_parts.append(f"Desglose={json.dumps(desglose)}")
            except Exception:
                pass

        if meta_parts:
            header = f"[META:{';'.join(meta_parts)}]"
            data['fnzs_concepto_operacion'] = f"{header} {concepto_base}".strip()[:255]
        else:
            data['fnzs_concepto_operacion'] = concepto_base[:255]

        return super().to_internal_value(data)
