from datetime import datetime
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated 
from django.db.models import Sum, Q

from .models import ProduccionHuevos, ClasificacionHuevos, AlimentacionAves
from .serializers import (
    ProduccionHuevosSerializer,
    ClasificacionHuevosSerializer,
    AlimentacionAvesSerializer
)

class ProduccionHuevosViewSet(viewsets.ModelViewSet):
    """
    CRUD del módulo Producción de Huevos:
    - Inyecta automáticamente usuario=request.user en creación.
    - Soporta las 3 jornadas de recolección: Mañana, Medio día (Mediodía) y Tarde.
    - Soporta endpoint /api/produccion/pendientes/ para recolectas no clasificadas.
    - Filtros por galpón, fecha y jornada.
    """
    queryset = ProduccionHuevos.objects.select_related('galpon', 'usuario').all().order_by('-prod_fecha_recoleccion', '-produccion_id')
    serializer_class = ProduccionHuevosSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        galpon = self.request.query_params.get('galpon') or self.request.query_params.get('galpon_id')
        fecha = self.request.query_params.get('fecha')
        fecha_inicio = self.request.query_params.get('fechaInicio') or self.request.query_params.get('fecha_inicio')
        fecha_fin = self.request.query_params.get('fechaFin') or self.request.query_params.get('fecha_fin')
        clasificado = self.request.query_params.get('clasificado')

        if galpon:
            try:
                gid = int(galpon.replace('Galpón', '').replace('Galpon', '').strip())
                qs = qs.filter(Q(galpon__galp_numero_galpon=gid) | Q(galpon_id=gid))
            except (ValueError, TypeError):
                pass

        if fecha:
            qs = qs.filter(prod_fecha_recoleccion=fecha)
        elif fecha_inicio and fecha_fin:
            qs = qs.filter(prod_fecha_recoleccion__range=[fecha_inicio, fecha_fin])

        if clasificado is not None:
            es_clas = clasificado.lower() in ['true', '1', 'si']
            qs = qs.filter(clasificacion__isnull=not es_clas)

        jornada = self.request.query_params.get('jornada')
        if jornada:
            j_lower = jornada.lower()
            if 'medio' in j_lower:
                qs = qs.filter(prod_observaciones__icontains='Jornada=Medio día')
            elif 'tarde' in j_lower:
                qs = qs.filter(prod_jornada_recoleccion='Tarde')
            elif 'mañana' in j_lower or 'manana' in j_lower:
                qs = qs.filter(prod_jornada_recoleccion='Mañana').exclude(prod_observaciones__icontains='Jornada=Medio día')

        return qs

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """
        Retorna las recolecciones de huevos pendientes de clasificación.
        Equivalente a localStorage.getItem("produccionesPendientes") del frontend.
        """
        pendientes_qs = self.get_queryset().filter(clasificacion__isnull=True)
        serializer = self.get_serializer(pendientes_qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ClasificacionHuevosViewSet(viewsets.ModelViewSet):
    """
    CRUD del módulo Clasificación de Huevos:
    - Vinculación 1:1 con ProduccionHuevos cuando corresponda.
    - Inyecta automáticamente usuario=request.user en creación.
    """
    queryset = ClasificacionHuevos.objects.select_related('galpon', 'usuario', 'produccion').all().order_by('-clas_fecha_clasificacion', '-clasificacion_id')
    serializer_class = ClasificacionHuevosSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        galpon = self.request.query_params.get('galpon') or self.request.query_params.get('galpon_id')
        produccion_id = self.request.query_params.get('produccion_id')
        fecha = self.request.query_params.get('fecha')
        fecha_inicio = self.request.query_params.get('fechaInicio') or self.request.query_params.get('fecha_inicio')
        fecha_fin = self.request.query_params.get('fechaFin') or self.request.query_params.get('fecha_fin')

        if galpon:
            try:
                gid = int(galpon.replace('Galpón', '').replace('Galpon', '').strip())
                qs = qs.filter(Q(galpon__galp_numero_galpon=gid) | Q(galpon_id=gid))
            except (ValueError, TypeError):
                pass

        if produccion_id:
            qs = qs.filter(produccion_id=produccion_id)

        if fecha:
            qs = qs.filter(clas_fecha_clasificacion=fecha)
        elif fecha_inicio and fecha_fin:
            qs = qs.filter(clas_fecha_clasificacion__range=[fecha_inicio, fecha_fin])

        return qs

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class AlimentacionAvesViewSet(viewsets.ModelViewSet):
    """
    CRUD del módulo Alimentación de Aves:
    - Inyecta automáticamente usuario=request.user en creación.
    - Soporta cálculo de acumulados mensuales para el parámetro de conversión alimenticia (FCR).
    """
    queryset = AlimentacionAves.objects.select_related('galpon', 'usuario').all().order_by('-alim_fecha', '-alimentacion_id')
    serializer_class = AlimentacionAvesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        galpon = self.request.query_params.get('galpon') or self.request.query_params.get('galpon_id')
        fecha = self.request.query_params.get('fecha')
        mes = self.request.query_params.get('mes') # e.g. "2026-10"

        if galpon:
            try:
                gid = int(galpon.replace('Galpón', '').replace('Galpon', '').strip())
                qs = qs.filter(Q(galpon__galp_numero_galpon=gid) | Q(galpon_id=gid))
            except (ValueError, TypeError):
                pass

        if fecha:
            qs = qs.filter(alim_fecha=fecha)
        elif mes:
            try:
                partes = mes.split('-')
                qs = qs.filter(alim_fecha__year=int(partes[0]), alim_fecha__month=int(partes[1]))
            except (ValueError, IndexError):
                pass

        return qs

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    @action(detail=False, methods=['get'])
    def acumulado_mes(self, request):
        """
        Retorna el acumulado mensual de alimento para el cálculo de FCR.
        """
        mes = request.query_params.get('mes') or datetime.now().strftime('%Y-%m')
        qs = self.get_queryset()
        try:
            partes = mes.split('-')
            qs_mes = qs.filter(alim_fecha__year=int(partes[0]), alim_fecha__month=int(partes[1]))
        except Exception:
            qs_mes = qs

        total_kg = qs_mes.aggregate(total=Sum('alim_cant_alimento'))['total'] or 0
        serializer = self.get_serializer(qs_mes, many=True)
        return Response({
            'mes': mes,
            'total_kg': float(total_kg),
            'registros': serializer.data
        }, status=status.HTTP_200_OK)
