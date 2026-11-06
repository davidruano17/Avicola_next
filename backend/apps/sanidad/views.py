from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated 
from django.db import transaction

from apps.galpones.models import Galpon
from .models import MortalidadAves, MorbilidadAves, TratamientoAves
from .serializers import (
    MortalidadAvesSerializer,
    MorbilidadAvesSerializer,
    TratamientoAvesSerializer
)

class MortalidadAvesViewSet(viewsets.ModelViewSet):
    """
    CRUD del módulo Mortalidad de Aves:
    - Inyecta automáticamente usuario=request.user en creación.
    - REGLA CRÍTICA DE NEGOCIO: Descuento atómico de aves vivas en el Galpón/Lote
      (galp_numero_aves = galp_numero_aves - mort_cantidad_aves).
    - Ajuste automático al editar cantidad o eliminar registro.
    """
    queryset = MortalidadAves.objects.select_related('galpon', 'usuario').all().order_by('-mort_fecha', '-mortalidad_id')
    serializer_class = MortalidadAvesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        galpon = self.request.query_params.get('galpon') or self.request.query_params.get('galpon_id')
        fecha = self.request.query_params.get('fecha')
        causa = self.request.query_params.get('causa')

        if galpon:
            try:
                gid = int(galpon.replace('Galpón', '').replace('Galpon', '').strip())
                qs = qs.filter(galpon_id=gid)
            except (ValueError, TypeError):
                pass

        if fecha:
            qs = qs.filter(mort_fecha=fecha)
        if causa:
            qs = qs.filter(mort_causa_muerte__icontains=causa)

        return qs

    def perform_create(self, serializer):
        with transaction.atomic():
            instance = serializer.save(usuario=self.request.user)
            # Descuento atómico en Galpón
            if instance.galpon_id:
                try:
                    galpon = Galpon.objects.select_for_update().get(galpon_id=instance.galpon_id)
                    bajas = instance.mort_cantidad_aves or 0
                    galpon.galp_numero_aves = max(0, (galpon.galp_numero_aves or 0) - bajas)
                    galpon.save(update_fields=['galp_numero_aves'])
                except Galpon.DoesNotExist:
                    pass

    def perform_update(self, serializer):
        with transaction.atomic():
            old_instance = self.get_object()
            old_qty = old_instance.mort_cantidad_aves or 0
            old_gid = old_instance.galpon_id

            new_instance = serializer.save()
            new_qty = new_instance.mort_cantidad_aves or 0
            new_gid = new_instance.galpon_id

            if old_gid == new_gid and old_gid:
                diff = new_qty - old_qty
                try:
                    galpon = Galpon.objects.select_for_update().get(galpon_id=new_gid)
                    galpon.galp_numero_aves = max(0, (galpon.galp_numero_aves or 0) - diff)
                    galpon.save(update_fields=['galp_numero_aves'])
                except Galpon.DoesNotExist:
                    pass
            else:
                # Se cambió de galpón: reintegrar al viejo y descontar del nuevo
                if old_gid:
                    try:
                        old_g = Galpon.objects.select_for_update().get(galpon_id=old_gid)
                        old_g.galp_numero_aves = (old_g.galp_numero_aves or 0) + old_qty
                        old_g.save(update_fields=['galp_numero_aves'])
                    except Galpon.DoesNotExist:
                        pass
                if new_gid:
                    try:
                        new_g = Galpon.objects.select_for_update().get(galpon_id=new_gid)
                        new_g.galp_numero_aves = max(0, (new_g.galp_numero_aves or 0) - new_qty)
                        new_g.save(update_fields=['galp_numero_aves'])
                    except Galpon.DoesNotExist:
                        pass

    def perform_destroy(self, instance):
        with transaction.atomic():
            gid = instance.galpon_id
            bajas = instance.mort_cantidad_aves or 0
            if gid:
                try:
                    galpon = Galpon.objects.select_for_update().get(galpon_id=gid)
                    galpon.galp_numero_aves = (galpon.galp_numero_aves or 0) + bajas
                    galpon.save(update_fields=['galp_numero_aves'])
                except Galpon.DoesNotExist:
                    pass
            instance.delete()


class MorbilidadAvesViewSet(viewsets.ModelViewSet):
    """
    CRUD del módulo Morbilidad de Aves:
    - Filtros por galpón, grado de afectación ('Leve', 'Moderado', 'Crítico') y fecha.
    - Inyecta automáticamente usuario=request.user en creación.
    """
    queryset = MorbilidadAves.objects.select_related('galpon', 'usuario').all().order_by('-morb_fecha_reporte', '-morbilidad_id')
    serializer_class = MorbilidadAvesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        galpon = self.request.query_params.get('galpon') or self.request.query_params.get('galpon_id')
        afectacion = self.request.query_params.get('afectacion') or self.request.query_params.get('grado')
        fecha = self.request.query_params.get('fecha')

        if galpon:
            try:
                gid = int(galpon.replace('Galpón', '').replace('Galpon', '').strip())
                qs = qs.filter(galpon_id=gid)
            except (ValueError, TypeError):
                pass

        if afectacion:
            raw = afectacion.strip().lower()
            if 'leve' in raw or 'bajo' in raw:
                qs = qs.filter(morb_grado_afectacion='Bajo')
            elif 'crit' in raw or 'alto' in raw:
                qs = qs.filter(morb_grado_afectacion__in=['Critico', 'Alto'])
            else:
                qs = qs.filter(morb_grado_afectacion='Medio')

        if fecha:
            qs = qs.filter(morb_fecha_reporte=fecha)

        return qs

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class TratamientoAvesViewSet(viewsets.ModelViewSet):
    """
    CRUD del módulo Tratamientos de Aves:
    - Tratamientos autónomos (morbilidad opcional).
    - Acción /completar/ para cambiar estado a 'Completado'.
    - Inyecta automáticamente usuario=request.user en creación.
    """
    queryset = TratamientoAves.objects.select_related('galpon', 'usuario', 'morbilidad').all().order_by('-trat_fecha_tratamiento', '-tratamiento_id')
    serializer_class = TratamientoAvesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        galpon = self.request.query_params.get('galpon') or self.request.query_params.get('galpon_id')
        fecha = self.request.query_params.get('fecha')
        estado = self.request.query_params.get('estado')

        if galpon:
            try:
                gid = int(galpon.replace('Galpón', '').replace('Galpon', '').strip())
                qs = qs.filter(galpon_id=gid)
            except (ValueError, TypeError):
                pass

        if fecha:
            qs = qs.filter(trat_fecha_tratamiento=fecha)

        if estado:
            qs = qs.filter(trat_observaciones__icontains=f"Estado={estado}")

        return qs

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    @action(detail=True, methods=['post'])
    def completar(self, request, pk=None):
        """
        Marca un tratamiento como 'Completado'.
        """
        tratamiento = self.get_object()
        obs = tratamiento.trat_observaciones or ""
        if '[META:' in obs and ']' in obs:
            fin = obs.find(']')
            clean_obs = obs[fin + 1:].strip()
            tratamiento.trat_observaciones = f"[META:Estado=Completado] {clean_obs}".strip()[:100]
        else:
            tratamiento.trat_observaciones = f"[META:Estado=Completado] {obs}".strip()[:100]

        tratamiento.save(update_fields=['trat_observaciones'])
        serializer = self.get_serializer(tratamiento)
        return Response(serializer.data, status=status.HTTP_200_OK)
