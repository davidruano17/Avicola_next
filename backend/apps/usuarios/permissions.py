from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminUserRole(BasePermission):
    """
    Permite el acceso únicamente a usuarios con rol de Administrador / Instructor Líder.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'es_administrador', False))


class IsAdminOrSelf(BasePermission):
    """
    Permite el acceso si el usuario es Administrador o si es el propio usuario consultando/editando su perfil.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if getattr(request.user, 'es_administrador', False):
            return True
        return obj.usuario_id == request.user.usuario_id


class IsInstructorOrReadOnly(BasePermission):
    """
    Permite lectura (GET, HEAD, OPTIONS) a cualquier usuario autenticado,
    pero operaciones de escritura (POST, PUT, PATCH, DELETE) requieren rol de Instructor o Administrador.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return getattr(request.user, 'es_instructor', False)
