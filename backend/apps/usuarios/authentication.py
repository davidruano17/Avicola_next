from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from .models import Usuario

class UsuarioJWTAuthentication(JWTAuthentication):
    """
    Autenticación JWT personalizada que mapea el token con el modelo Usuario (tabla 'usuarios').
    Permite que request.user sea una instancia real de Usuario.
    """
    # `Usuario` no hereda de AbstractBaseUser (tabla propia), por eso la firma difiere del padre a propósito.
    def get_user(self, validated_token):  # pyrefly: ignore[bad-override]
        user_id = validated_token.get('user_id') or validated_token.get('usuario_id')
        if not user_id:
            raise InvalidToken("El token no contiene una identificación de usuario válida.")

        try:
            user = Usuario.objects.select_related('rol').get(usuario_id=user_id)
        except Usuario.DoesNotExist:
            raise AuthenticationFailed("El usuario asociado a este token no existe.", code="user_not_found")

        if user.usu_estado != Usuario.Estado.ACTIVO:
            raise AuthenticationFailed("Esta cuenta de usuario se encuentra inactiva.", code="user_inactive")

        return user
 