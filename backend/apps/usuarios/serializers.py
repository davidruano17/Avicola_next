from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from django.db.models import Q
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Rol, Usuario

class RolSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source='rol_nombre', required=False)
    estado = serializers.IntegerField(source='rol_estado', required=False, default=1)

    class Meta:
        model = Rol
        fields = ['rol_id', 'rol_nombre', 'rol_estado', 'nombre', 'estado']
        extra_kwargs = {
            'rol_nombre': {'required': False},
            'rol_estado': {'required': False, 'default': 1},
        }
        read_only_fields = ['rol_id']

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'nombre' in data and 'rol_nombre' not in data:
            data['rol_nombre'] = data['nombre']
        if 'estado' in data and 'rol_estado' not in data:
            data['rol_estado'] = data['estado']
        if 'rol_estado' not in data:
            data['rol_estado'] = 1
        return super().to_internal_value(data)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['id'] = instance.rol_id
        ret['nombre'] = instance.rol_nombre
        ret['estado'] = instance.rol_estado
        return ret


class UsuarioDetailSerializer(serializers.ModelSerializer):
    """
    Serializador de salida: Nunca expone 'usu_password'.
    Incluye información anidada del rol y alias compatibles con el frontend.
    """
    rol = RolSerializer(read_only=True)

    class Meta:
        model = Usuario
        fields = [
            'usuario_id',
            'usu_nombre_completo',
            'usu_correo_electronico',
            'usu_numero_celular',
            'usu_tipo_doc_identificacion',
            'usu_No_doc_identificacion',
            'usu_residencia',
            'usu_fecha_ingreso',
            'usu_estado',
            'rol',
        ]
        read_only_fields = ['usuario_id']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Alias exactos consumidos por componentes de React/Next.js
        ret['id'] = instance.usuario_id
        ret['nombre'] = instance.usu_nombre_completo
        ret['email'] = instance.usu_correo_electronico
        ret['telefono'] = instance.usu_numero_celular
        ret['tipoDoc'] = instance.usu_tipo_doc_identificacion
        ret['documento'] = instance.usu_No_doc_identificacion
        ret['residencia'] = instance.usu_residencia
        ret['fecha'] = str(instance.usu_fecha_ingreso) if instance.usu_fecha_ingreso else ''
        ret['rol'] = instance.rol.rol_nombre if instance.rol else ''
        ret['estado'] = (instance.usu_estado or 'Activo').upper()
        return ret


class UsuarioCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializador de entrada:
    - 'usu_password' es de solo escritura (write_only).
    - Aplica hashing seguro de contraseñas.
    - Valida unicidad de correo y documento.
    - Mapea dinámicamente alias de campos enviados desde el formulario frontend.
    """
    usu_password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        style={'input_type': 'password'},
        help_text="Contraseña del usuario (se almacena de forma cifrada)."
    )
    rol_id = serializers.PrimaryKeyRelatedField(
        queryset=Rol.objects.filter(rol_estado=1),
        source='rol',
        write_only=True,
        required=False,
        help_text="Identificador del rol a asignar."
    )
    rol = RolSerializer(read_only=True)

    class Meta:
        model = Usuario
        fields = [
            'usuario_id',
            'usu_nombre_completo',
            'usu_correo_electronico',
            'usu_numero_celular',
            'usu_tipo_doc_identificacion',
            'usu_No_doc_identificacion',
            'usu_residencia',
            'usu_fecha_ingreso',
            'usu_password',
            'usu_estado',
            'rol_id',
            'rol',
        ]
        read_only_fields = ['usuario_id']
        extra_kwargs = {
            'usu_numero_celular': {'required': False},
            'usu_tipo_doc_identificacion': {'required': False},
            'usu_residencia': {'required': False},
            'usu_fecha_ingreso': {'required': False},
            'usu_estado': {'required': False},
            'usu_No_doc_identificacion': {'required': False},
        }

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)

        # Mapeo de alias de frontend a nombres de campo en base de datos
        alias_map = {
            'nombre': 'usu_nombre_completo',
            'email': 'usu_correo_electronico',
            'telefono': 'usu_numero_celular',
            'tipoDoc': 'usu_tipo_doc_identificacion',
            'tipoDocumento': 'usu_tipo_doc_identificacion',
            'documento': 'usu_No_doc_identificacion',
            'residencia': 'usu_residencia',
            'fecha': 'usu_fecha_ingreso',
            'password': 'usu_password',
            'contrasena': 'usu_password',
            'contraseña': 'usu_password',
            'estado': 'usu_estado',
        }
        for k_src, k_dst in alias_map.items():
            if k_src in data and k_dst not in data:
                data[k_dst] = data[k_src]

        # Normalización del estado ('Activo' | 'Inactivo')
        raw_estado = str(data.get('usu_estado') or data.get('estado') or '').strip().lower()
        if raw_estado:
            if 'inac' in raw_estado or raw_estado == '0' or raw_estado == 'false':
                data['usu_estado'] = Usuario.Estado.INACTIVO
            else:
                data['usu_estado'] = Usuario.Estado.ACTIVO
        elif not self.instance:
            data['usu_estado'] = Usuario.Estado.ACTIVO

        # Valores por defecto seguros para campos secundarios en creación
        if not self.instance:
            from datetime import date
            if not data.get('usu_tipo_doc_identificacion'):
                data['usu_tipo_doc_identificacion'] = 'CC'
            if not data.get('usu_numero_celular'):
                data['usu_numero_celular'] = '3000000000'
            if not data.get('usu_residencia'):
                data['usu_residencia'] = 'Granja Avícola'
            if not data.get('usu_fecha_ingreso'):
                data['usu_fecha_ingreso'] = date.today()
            if not data.get('usu_No_doc_identificacion'):
                import time
                data['usu_No_doc_identificacion'] = str(int(time.time()))[-8:]

        # Mapeo de rol si viene como string (nombre del rol en frontend)
        if 'rol' in data and 'rol_id' not in data:
            rol_val = data.get('rol')
            if isinstance(rol_val, int):
                data['rol_id'] = rol_val
            elif isinstance(rol_val, str) and rol_val.isdigit():
                data['rol_id'] = int(rol_val)
            elif isinstance(rol_val, str):
                rol_obj = Rol.objects.filter(rol_nombre__iexact=rol_val.strip()).first()
                if not rol_obj:
                    rol_obj = Rol.objects.filter(rol_nombre__icontains=rol_val.strip()).first()
                if not rol_obj:
                    rol_obj = Rol.objects.filter(rol_estado=1).first()
                if rol_obj:
                    data['rol_id'] = rol_obj.rol_id

        # Si es creación y no se envía contraseña, usar el documento como contraseña inicial por defecto
        if not self.instance and not data.get('usu_password') and data.get('usu_No_doc_identificacion'):
            data['usu_password'] = str(data.get('usu_No_doc_identificacion'))

        return super().to_internal_value(data)

    def validate_usu_correo_electronico(self, value):
        user_id = self.instance.usuario_id if self.instance else None
        qs = Usuario.objects.filter(usu_correo_electronico__iexact=value)
        if user_id:
            qs = qs.exclude(usuario_id=user_id)
        if qs.exists():
            raise serializers.ValidationError("Ya existe un usuario registrado con este correo electrónico.")
        return value.lower()

    def validate_usu_No_doc_identificacion(self, value):
        user_id = self.instance.usuario_id if self.instance else None
        qs = Usuario.objects.filter(usu_No_doc_identificacion=value)
        if user_id:
            qs = qs.exclude(usuario_id=user_id)
        if qs.exists():
            raise serializers.ValidationError("Ya existe un usuario con este número de documento.")
        return value

    def validate_usu_password(self, value):
        if value and len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('usu_password', None)
        if not password and validated_data.get('usu_No_doc_identificacion'):
            password = str(validated_data.get('usu_No_doc_identificacion'))
        if not password:
            raise serializers.ValidationError({"usu_password": "La contraseña es requerida para nuevos usuarios."})
        if len(password) < 8:
            raise serializers.ValidationError({"usu_password": "La contraseña debe tener al menos 8 caracteres."})
        validated_data['usu_password'] = make_password(password)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        # Si la petición proviene de un usuario autenticado que NO es administrador, no permitir cambiar rol ni estado
        if request and request.user and request.user.is_authenticated:
            es_admin = getattr(request.user, 'es_administrador', False)
            if not es_admin:
                validated_data.pop('rol', None)
                validated_data.pop('usu_estado', None)

        password = validated_data.pop('usu_password', None)
        if password:
            if len(password) < 8:
                raise serializers.ValidationError({"usu_password": "La contraseña debe tener al menos 8 caracteres."})
            instance.usu_password = make_password(password)

        return super().update(instance, validated_data)

    def to_representation(self, instance):
        # Asegurar respuesta con formato frontend idéntico (id, nombre, email, estado: 'ACTIVO'/'INACTIVO', etc.)
        return UsuarioDetailSerializer(instance, context=self.context).to_representation(instance)


class LoginSerializer(serializers.Serializer):
    """
    Serializador para autenticación:
    Permite iniciar sesión únicamente con correo electrónico y contraseña.
    También soporta documento de identidad o identificadores de prueba ('admin', 'aprendiz', 'investigador').
    Retorna access token, refresh token y datos completos del usuario.
    """
    identificador = serializers.CharField(write_only=True, required=False, allow_blank=True)
    email = serializers.CharField(write_only=True, required=False, allow_blank=True)
    correo = serializers.CharField(write_only=True, required=False, allow_blank=True)
    username = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, style={'input_type': 'password'})

    def validate(self, attrs):
        identificador = (
            attrs.get('email') or 
            attrs.get('correo') or 
            attrs.get('identificador') or 
            attrs.get('username') or 
            ''
        ).strip()
        password = (attrs.get('password') or '').strip()

        if not identificador:
            raise serializers.ValidationError("Debe ingresar su correo electrónico.")

        # Buscar usuario por correo electrónico o por documento de identidad
        usuario = Usuario.objects.select_related('rol').filter(
            Q(usu_correo_electronico__iexact=identificador) |
            Q(usu_No_doc_identificacion=identificador)
        ).first()

        # Si se usó una palabra clave demo ('admin', 'aprendiz', 'investigador')
        if not usuario and identificador.lower() in ['admin', 'aprendiz', 'investigador']:
            from .utils import get_or_create_demo_users
            usuarios_demo = get_or_create_demo_users()
            usuario = usuarios_demo.get(identificador.lower())

        if not usuario:
            raise serializers.ValidationError("Credenciales de acceso incorrectas. Verifique correo y contraseña.")

        if usuario.usu_estado != Usuario.Estado.ACTIVO:
            raise serializers.ValidationError("Esta cuenta de usuario se encuentra inactiva.")

        # Validar contraseña obligatoria
        if not password:
            raise serializers.ValidationError("Debe ingresar su contraseña.")

        password_valida = (
            check_password(password, usuario.usu_password) or 
            (usuario.usu_password == password)
        )
        if not password_valida:
            raise serializers.ValidationError("Credenciales de acceso incorrectas. Verifique correo y contraseña.")

        # Generar tokens JWT
        refresh = RefreshToken()
        refresh['user_id'] = usuario.usuario_id
        refresh['usuario_id'] = usuario.usuario_id
        refresh['email'] = usuario.usu_correo_electronico
        refresh['rol'] = usuario.rol.rol_nombre if usuario.rol else 'Usuario'

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'usuario': UsuarioDetailSerializer(usuario).data
        }
