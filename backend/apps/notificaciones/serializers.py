from rest_framework import serializers
from .models import Notificacion
from apps.galpones.models import Galpon

class NotificacionSerializer(serializers.ModelSerializer):
    """
    Serializador de Notificaciones 100% compatible con el frontend Next.js (notificaciones).
    Soporta:
    - id / notificacion_id
    - type ('critical', 'warning', 'success', 'info')
    - title / noti_titulo
    - description / noti_mensaje
    - unread (booleano: noti_estado_leido == 0)
    - time (fecha formateada)
    - galpon ("Galpón 01")
    """
    id = serializers.IntegerField(source='notificacion_id', read_only=True)
    title = serializers.CharField(source='noti_titulo', required=False)
    description = serializers.CharField(source='noti_mensaje', required=False)
    type = serializers.SerializerMethodField(read_only=True)
    unread = serializers.SerializerMethodField(read_only=True)
    time = serializers.SerializerMethodField(read_only=True)
    galpon = serializers.SerializerMethodField(read_only=True)
    galpon_id = serializers.IntegerField(source='galpon.galpon_id', read_only=True)
    usuario_nombre = serializers.ReadOnlyField(source='usuario.usu_nombre_completo')

    class Meta:
        model = Notificacion
        fields = [
            'id',
            'notificacion_id',
            'title',
            'noti_titulo',
            'description',
            'noti_mensaje',
            'type',
            'noti_tipo',
            'unread',
            'noti_estado_leido',
            'time',
            'noti_fecha_creacion',
            'galpon',
            'galpon_id',
            'usuario',
            'usuario_nombre',
        ]
        read_only_fields = ['notificacion_id', 'usuario', 'noti_fecha_creacion']

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

    def get_type(self, obj):
        meta, _ = self._parse_metadata(obj.noti_mensaje)
        if 'Type' in meta:
            return meta['Type']
        # Mapeo según noti_tipo
        mapping = {
            'Mortalidad': 'critical',
            'Salud': 'critical',
            'Inventario': 'warning',
            'Finanzas': 'success',
            'Sistema': 'info',
        }
        return mapping.get(obj.noti_tipo, 'info')

    def get_unread(self, obj):
        return obj.noti_estado_leido == 0

    def get_time(self, obj):
        if not obj.noti_fecha_creacion:
            return "Reciente"
        return obj.noti_fecha_creacion.strftime('%Y-%m-%d %H:%M')

    def get_galpon(self, obj):
        if not obj.galpon:
            return None
        return f"Galpón {str(obj.galpon.galpon_id).zfill(2)}"

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)

        if 'title' in data and 'noti_titulo' not in data:
            data['noti_titulo'] = str(data['title'])[:100]
        if 'description' in data and 'noti_mensaje' not in data:
            data['noti_mensaje'] = str(data['description'])[:255]

        # Mapeo de type frontend -> noti_tipo DB
        raw_type = str(data.get('type') or data.get('noti_tipo') or 'info').lower()
        if raw_type == 'critical':
            data['noti_tipo'] = 'Mortalidad'
        elif raw_type == 'warning':
            data['noti_tipo'] = 'Inventario'
        elif raw_type == 'success':
            data['noti_tipo'] = 'Finanzas'
        else:
            data['noti_tipo'] = 'Sistema'

        # Preservar type original en header si es distinto
        desc = str(data.get('noti_mensaje') or '').strip()
        header = f"[META:Type={raw_type}]"
        data['noti_mensaje'] = f"{header} {desc}".strip()[:255]

        # Mapeo de unread -> noti_estado_leido
        if 'unread' in data and 'noti_estado_leido' not in data:
            data['noti_estado_leido'] = 0 if data['unread'] else 1

        return super().to_internal_value(data)
