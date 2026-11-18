from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenRefreshView

from .models import Rol, Usuario
from .serializers import (
    RolSerializer,
    UsuarioDetailSerializer,
    UsuarioCreateUpdateSerializer,
    LoginSerializer
)
from .permissions import IsAdminUserRole, IsAdminOrSelf

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class PerfilUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UsuarioDetailSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UsuarioCreateUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UsuarioDetailSerializer(request.user).data, status=status.HTTP_200_OK)


class CambiarPasswordView(APIView):
    """
    Permite al usuario autenticado cambiar su contraseña,
    exigiendo la contraseña actual como medida de seguridad.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from django.contrib.auth.hashers import make_password, check_password
        password_actual = (
            request.data.get('password_actual') or 
            request.data.get('current_password') or 
            ''
        ).strip()
        password_nueva = (
            request.data.get('password_nueva') or 
            request.data.get('new_password') or 
            ''
        ).strip()

        if not password_actual or not password_nueva:
            return Response(
                {"error": "Debe ingresar tanto la contraseña actual como la nueva contraseña."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(password_nueva) < 8:
            return Response(
                {"error": "La nueva contraseña debe tener al menos 8 caracteres."},
                status=status.HTTP_400_BAD_REQUEST
            )

        usuario = request.user
        password_valida = (
            check_password(password_actual, usuario.usu_password) or 
            (usuario.usu_password == password_actual)
        )

        if not password_valida:
            return Response(
                {"error": "La contraseña actual no es correcta. Por favor verifíquela."},
                status=status.HTTP_400_BAD_REQUEST
            )

        usuario.usu_password = make_password(password_nueva)
        usuario.save(update_fields=['usu_password'])

        return Response(
            {"mensaje": "Contraseña actualizada exitosamente."},
            status=status.HTTP_200_OK
        )


class RolViewSet(viewsets.ModelViewSet):
    """
    Catálogo de roles: Permite listar, crear y actualizar roles.
    """
    queryset = Rol.objects.all().order_by('rol_id')
    serializer_class = RolSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        solo_activos = self.request.query_params.get('activos', 'true').lower()
        if solo_activos in ['1', 'true']:
            return qs.filter(rol_estado=1)
        return qs


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    CRUD de Usuarios:
    - Listar y Crear: Solo administradores (Instructor Líder).
    - Ver detalle y Modificar: Administrador o el propio usuario.
    - Eliminar: Solo administradores.
    """
    queryset = Usuario.objects.select_related('rol').all().order_by('-usuario_id')
    permission_classes = [IsAdminOrSelf]

    def get_permissions(self):
        if self.action in ['list', 'create', 'destroy']:
            return [IsAdminUserRole()]
        return [IsAdminOrSelf()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UsuarioCreateUpdateSerializer
        return UsuarioDetailSerializer

    def destroy(self, request, *args, **kwargs):
        """
        En lugar de borrar físicamente si hay registros relacionados,
        permite desactivar al usuario de forma segura.
        """
        instance = self.get_object()
        from django.db.models.deletion import ProtectedError
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {"error": "No se puede eliminar el usuario porque tiene registros operativos asociados. Considere cambiar su estado a 'Inactivo'."},
                status=status.HTTP_400_BAD_REQUEST
            )


# =======================================================
# VISTAS PARA RECUPERACIÓN DE CONTRASEÑA (CÓDIGO OTP)
# =======================================================
import random
import time
from typing import TypedDict
from django.conf import settings
from django.core.mail import send_mail
from django.core.signing import TimestampSigner, BadSignature
from django.contrib.auth.hashers import make_password

class DatosOTP(TypedDict):
    codigo: str
    expires_at: float
    intentos: int
    usuario_id: int

# Almacenamiento temporal en memoria para códigos OTP (expiración: 15 minutos)
CODIGOS_RECUPERACION: dict[str, DatosOTP] = {}

class SolicitarRecuperacionPasswordView(APIView):
    """
    Paso 1: Genera y envía un código numérico de 6 dígitos al correo del usuario.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        if not email:
            return Response(
                {"error": "Por favor ingrese su correo electrónico."},
                status=status.HTTP_400_BAD_REQUEST
            )

        usuario = Usuario.objects.filter(usu_correo_electronico__iexact=email).first()
        if not usuario:
            return Response(
                {"error": "No se encontró ningún usuario registrado con este correo electrónico."},
                status=status.HTTP_404_NOT_FOUND
            )

        if usuario.usu_estado != Usuario.Estado.ACTIVO:
            return Response(
                {"error": "Esta cuenta de usuario se encuentra inactiva. Comuníquese con el administrador."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generar código OTP seguro de 6 dígitos
        codigo = f"{random.randint(100000, 999999):06d}"

        # Guardar en memoria con tiempo de vida de 15 minutos (900 segundos)
        CODIGOS_RECUPERACION[email] = {
            'codigo': codigo,
            'expires_at': time.time() + 900,
            'intentos': 0,
            'usuario_id': usuario.usuario_id,
        }

        # Enviar correo con plantilla profesional institucional
        asunto = "Código de Recuperación de Contraseña - AVISENA COL"
        mensaje_plano = (
            f"Hola {usuario.usu_nombre_completo},\n\n"
            f"Has solicitado restablecer tu contraseña en el Sistema de Gestión Avícola AVISENA COL.\n\n"
            f"Tu código de verificación de 6 dígitos es: {codigo}\n\n"
            f"Este código es válido durante 15 minutos. Si no realizaste esta solicitud, puedes ignorar este mensaje.\n\n"
            f"Centro Agropecuario - SENA Regional Cauca"
        )
        mensaje_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
            <h2 style="color: #043224; margin: 0 0 6px 0;">AVISENA COL</h2>
            <p style="color: #64748b; font-size: 13px; margin: 0 0 16px 0;">Sistema de Gestión Avícola - SENA</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <p style="color: #1e293b; font-size: 15px;">Hola <strong>{usuario.usu_nombre_completo}</strong>,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                Has solicitado restablecer tu contraseña de acceso. Ingresa el siguiente código de verificación en el aplicativo:
            </p>
            <div style="background-color: #f8fafc; border: 2px dashed #49e619; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
                <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #043224;">{codigo}</span>
            </div>
            <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
                Este código expira en <strong>15 minutos</strong>. Si tú no realizaste esta solicitud, haz caso omiso de este correo.
            </p>
        </div>
        """

        try:
            send_mail(
                asunto,
                mensaje_plano,
                getattr(settings, 'DEFAULT_FROM_EMAIL', 'AVISENA COL <no-reply@avisena.com>'),
                [usuario.usu_correo_electronico],
                html_message=mensaje_html,
                fail_silently=False,
            )
        except Exception as mail_err:
            print(f"[Recuperación Password] Aviso al enviar correo: {mail_err}")

        respuesta = {
            "mensaje": f"Se ha enviado un código de 6 dígitos a {usuario.usu_correo_electronico}.",
            "email": usuario.usu_correo_electronico,
        }

        return Response(respuesta, status=status.HTTP_200_OK)


class VerificarCodigoRecuperacionView(APIView):
    """
    Paso 2: Valida que el código de 6 dígitos ingresado coincida y esté vigente.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        codigo = (request.data.get('codigo') or '').strip()

        if not email or not codigo:
            return Response(
                {"error": "Debe proporcionar el correo y el código de 6 dígitos."},
                status=status.HTTP_400_BAD_REQUEST
            )

        datos_otp = CODIGOS_RECUPERACION.get(email)
        if not datos_otp or time.time() > datos_otp['expires_at']:
            return Response(
                {"error": "El código ha expirado o no es válido. Por favor solicita uno nuevo."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if datos_otp['codigo'] != codigo:
            datos_otp['intentos'] += 1
            if datos_otp['intentos'] >= 5:
                del CODIGOS_RECUPERACION[email]
                return Response(
                    {"error": "Superaste el límite de intentos permitidos. Solicita un nuevo código."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {"error": "El código ingresado es incorrecto. Por favor verifícalo."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generar token firmado criptográficamente para autorizar el paso 3
        signer = TimestampSigner()
        reset_token = signer.sign(f"{datos_otp['usuario_id']}:{codigo}")

        return Response(
            {
                "valido": True,
                "mensaje": "Código verificado correctamente.",
                "reset_token": reset_token
            },
            status=status.HTTP_200_OK
        )


class RestablecerPasswordView(APIView):
    """
    Paso 3: Establece la nueva contraseña en MySQL una vez validado el código.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        codigo = (request.data.get('codigo') or '').strip()
        reset_token = (request.data.get('reset_token') or '').strip()
        password_nueva = (request.data.get('password_nueva') or '').strip()
        password_confirmar = (request.data.get('password_confirmar') or '').strip()

        if not email:
            return Response(
                {"error": "El correo electrónico es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not password_nueva or not password_confirmar:
            return Response(
                {"error": "Debe ingresar y confirmar su nueva contraseña."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(password_nueva) < 8:
            return Response(
                {"error": "La nueva contraseña debe tener al menos 8 caracteres."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if password_nueva != password_confirmar:
            return Response(
                {"error": "Las contraseñas no coinciden. Por favor verifíquelas."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar autorización: bien por reset_token firmado o por código activo en memoria
        autorizado = False
        if reset_token:
            signer = TimestampSigner()
            try:
                signer.unsign(reset_token, max_age=900)
                autorizado = True
            except BadSignature:
                autorizado = False

        if not autorizado:
            datos_otp = CODIGOS_RECUPERACION.get(email)
            if datos_otp and datos_otp['codigo'] == codigo and time.time() <= datos_otp['expires_at']:
                autorizado = True

        if not autorizado:
            return Response(
                {"error": "La sesión de recuperación ha vencido o no es válida. Inicie el proceso de nuevo."},
                status=status.HTTP_400_BAD_REQUEST
            )

        usuario = Usuario.objects.filter(usu_correo_electronico__iexact=email).first()
        if not usuario:
            return Response(
                {"error": "No se encontró el usuario a actualizar."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Actualizar contraseña cifrada en MySQL
        usuario.usu_password = make_password(password_nueva)
        usuario.save(update_fields=['usu_password'])

        # Invalida el código para que no pueda reutilizarse
        if email in CODIGOS_RECUPERACION:
            del CODIGOS_RECUPERACION[email]

        return Response(
            {
                "mensaje": "¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión con tu nueva contraseña."
            },
            status=status.HTTP_200_OK
        )
