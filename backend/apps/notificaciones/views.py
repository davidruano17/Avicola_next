from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated 

from .models import Notificacion
from .serializers import NotificacionSerializer

class NotificacionViewSet(viewsets.ModelViewSet):
    """
    CRUD y gestión de Notificaciones:
    - Soporta pestañas del frontend: 'Todas', 'No leídas', 'Críticas'.
    - Acciones para marcar como leída (/marcar_leida/) y marcar todas (/marcar_todas_leidas/).
    """
    queryset = Notificacion.objects.select_related('galpon', 'usuario').all().order_by('-noti_fecha_creacion', '-notificacion_id')
    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        tab = self.request.query_params.get('tab')
        tipo = self.request.query_params.get('tipo')
        unread = self.request.query_params.get('unread')
        leido = self.request.query_params.get('leido')

        if tab == 'No leídas' or (unread and unread.lower() in ['true', '1']):
            qs = qs.filter(noti_estado_leido=0)
        elif tab == 'Críticas':
            qs = qs.filter(noti_tipo__in=['Mortalidad', 'Salud'])

        if tipo:
            if tipo == 'critical':
                qs = qs.filter(noti_tipo__in=['Mortalidad', 'Salud'])
            elif tipo == 'warning':
                qs = qs.filter(noti_tipo='Inventario')
            elif tipo == 'success':
                qs = qs.filter(noti_tipo='Finanzas')
            elif tipo == 'info':
                qs = qs.filter(noti_tipo='Sistema')
            else:
                qs = qs.filter(noti_tipo=tipo)

        if leido is not None:
            qs = qs.filter(noti_estado_leido=int(leido))

        return qs

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    @action(detail=True, methods=['patch', 'post'])
    def marcar_leida(self, request, pk=None):
        notificacion = self.get_object()
        notificacion.noti_estado_leido = 1
        notificacion.save(update_fields=['noti_estado_leido'])
        serializer = self.get_serializer(notificacion)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['patch', 'post'])
    def marcar_todas_leidas(self, request):
        qs = self.get_queryset().filter(noti_estado_leido=0)
        actualizadas = qs.update(noti_estado_leido=1)
        return Response({
            'actualizadas': actualizadas,
            'status': 'Todas las notificaciones marcadas como leídas'
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def contadores(self, request):
        base_qs = super().get_queryset()
        total = base_qs.count()
        unread = base_qs.filter(noti_estado_leido=0).count()
        critical = base_qs.filter(noti_tipo__in=['Mortalidad', 'Salud']).count()
        return Response({
            'total': total,
            'unread': unread,
            'critical': critical
        }, status=status.HTTP_200_OK)
