from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models.deletion import ProtectedError
from django.db import IntegrityError

from .models import Galpon
from .serializers import GalponSerializer
from apps.usuarios.permissions import IsInstructorOrReadOnly, IsAdminUserRole

class GalponViewSet(viewsets.ModelViewSet):
    """
    CRUD del módulo Galpones:
    - Consulta (list, retrieve): Cualquier usuario autenticado.
    - Creación y edición: Instructores o Administradores.
    - Eliminación: Solo Administrador (Instructor Líder).
    - Valida restricciones de clave foránea antes de eliminar.
    """
    queryset = Galpon.objects.all().order_by('-galpon_id')
    serializer_class = GalponSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Validación proactiva de relaciones existentes en MariaDB
        tiene_producciones = instance.producciones.exists() if hasattr(instance, 'producciones') else False
        tiene_clasificaciones = instance.clasificaciones.exists() if hasattr(instance, 'clasificaciones') else False
        tiene_alimentaciones = instance.alimentaciones.exists() if hasattr(instance, 'alimentaciones') else False
        tiene_mortalidades = instance.mortalidades.exists() if hasattr(instance, 'mortalidades') else False
        tiene_morbilidades = instance.morbilidades.exists() if hasattr(instance, 'morbilidades') else False
        tiene_tratamientos = instance.tratamientos.exists() if hasattr(instance, 'tratamientos') else False
        tiene_transacciones = instance.transacciones.exists() if hasattr(instance, 'transacciones') else False

        if any([
            tiene_producciones, tiene_clasificaciones, tiene_alimentaciones,
            tiene_mortalidades, tiene_morbilidades, tiene_tratamientos, tiene_transacciones
        ]):
            return Response(
                {
                    "error": "No se puede eliminar el galpón porque tiene registros vinculados en producción, sanidad o finanzas."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except (ProtectedError, IntegrityError):
            return Response(
                {
                    "error": "Restricción de integridad: Este galpón cuenta con dependencias en otras tablas y no puede ser eliminado."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
