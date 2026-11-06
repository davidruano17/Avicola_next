from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView,
    PerfilUsuarioView,
    CambiarPasswordView,
    RolViewSet,
    UsuarioViewSet,
    SolicitarRecuperacionPasswordView,
    VerificarCodigoRecuperacionView,
    RestablecerPasswordView,
)

router = DefaultRouter()
router.register(r'roles', RolViewSet, basename='rol')
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    # Autenticación JWT y Gestión de Contraseñas
    path('auth/login/', LoginView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', PerfilUsuarioView.as_view(), name='perfil_usuario'),
    path('auth/cambiar-contrasena/', CambiarPasswordView.as_view(), name='cambiar_password'),

    # Recuperación de contraseñas vía código OTP
    path('auth/recuperar-password/solicitar/', SolicitarRecuperacionPasswordView.as_view(), name='recuperar_solicitar'),
    path('auth/recuperar-password/verificar/', VerificarCodigoRecuperacionView.as_view(), name='recuperar_verificar'),
    path('auth/recuperar-password/restablecer/', RestablecerPasswordView.as_view(), name='recuperar_restablecer'),

    # Rutas CRUD de usuarios y roles
    path('', include(router.urls)),
]
