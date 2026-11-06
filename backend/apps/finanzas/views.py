from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum 

from .models import FinanzasUdAvicola
from .serializers import FinanzasUdAvicolaSerializer

class FinanzasUdAvicolaViewSet(viewsets.ModelViewSet):
    """
    CRUD del módulo Finanzas:
    - Inyecta automáticamente usuario=request.user en creación.
    - Filtros por rango de fechas (fechaInicio, fechaFin), galpón, tipo y estado.
    - Endpoint /resumen/ con métricas consolidadas alineadas con la vista de Next.js:
      * ingresosTotales, gastosTotales, utilidadNeta
      * desglose por categorías (Alimentos, Salud/Vet, Infraestructura, Venta de Huevos)
      * métricas por calibre de huevo (C, B, A, AA, AAA, Jumbo)
      * estructura gráfica de 12 meses (ENE a DIC).
    """
    queryset = FinanzasUdAvicola.objects.select_related('galpon', 'usuario').all().order_by('-fnzs_fecha_operacion', '-finanzas_ud_avicola_id')
    serializer_class = FinanzasUdAvicolaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        galpon = self.request.query_params.get('galpon') or self.request.query_params.get('galpon_id')
        tipo = self.request.query_params.get('tipo')
        estado = self.request.query_params.get('estado')
        fecha_inicio = self.request.query_params.get('fechaInicio') or self.request.query_params.get('fecha_inicio')
        fecha_fin = self.request.query_params.get('fechaFin') or self.request.query_params.get('fecha_fin')

        if galpon:
            try:
                gid = int(galpon.replace('Galpón', '').replace('Galpon', '').strip())
                qs = qs.filter(galpon_id=gid)
            except (ValueError, TypeError):
                pass

        if tipo:
            qs = qs.filter(fnzs_tipo_operacion=tipo)
        if estado:
            qs = qs.filter(fnzs_estado_operacion=estado)

        if fecha_inicio and fecha_fin:
            qs = qs.filter(fnzs_fecha_operacion__range=[fecha_inicio, fecha_fin])
        elif fecha_inicio:
            qs = qs.filter(fnzs_fecha_operacion__gte=fecha_inicio)
        elif fecha_fin:
            qs = qs.filter(fnzs_fecha_operacion__lte=fecha_fin)

        return qs

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    @action(detail=False, methods=['get'])
    def resumen(self, request):
        qs = self.get_queryset()

        total_ingresos = qs.filter(fnzs_tipo_operacion='Ingreso').aggregate(total=Sum('fnzs_monto_total'))['total'] or 0
        total_gastos = qs.filter(fnzs_tipo_operacion='Gasto').aggregate(total=Sum('fnzs_monto_total'))['total'] or 0
        utilidad_neta = total_ingresos - total_gastos

        # Categorías calculadas
        gasto_alimentos = qs.filter(fnzs_tipo_operacion='Gasto', fnzs_categoria_gasto='Alimento').aggregate(total=Sum('fnzs_monto_total'))['total'] or 0
        gasto_salud = qs.filter(fnzs_tipo_operacion='Gasto', fnzs_categoria_gasto='Medicina').aggregate(total=Sum('fnzs_monto_total'))['total'] or 0
        gasto_infraestructura = qs.filter(fnzs_tipo_operacion='Gasto', fnzs_categoria_gasto='Mantenimiento').aggregate(total=Sum('fnzs_monto_total'))['total'] or 0
        ingreso_huevos = qs.filter(fnzs_tipo_operacion='Ingreso', fnzs_categoria_gasto='Ventas').aggregate(total=Sum('fnzs_monto_total'))['total'] or 0

        # Métricas por calibre de huevo (C, B, A, AA, AAA, Jumbo)
        calibres = ['C', 'B', 'A', 'AA', 'AAA', 'Jumbo']
        metricas_calibre = {}
        for c in calibres:
            c_qs = qs.filter(fnzs_tipo_operacion='Ingreso', fnzs_clasificacion_panal=c)
            vendidos = c_qs.aggregate(total=Sum('fnzs_panales_vendidos'))['total'] or 0
            ingresos = c_qs.aggregate(total=Sum('fnzs_monto_total'))['total'] or 0
            promedio = (ingresos / vendidos) if vendidos > 0 else 0
            metricas_calibre[c] = {
                'vendidos': int(vendidos),
                'ingresos': float(ingresos),
                'precioPromedio': float(round(promedio, 2))
            }

        # Gráfica mensual fija de 12 meses
        meses_nombres = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]
        grafica_mensual = [
            {'clave': f"{i+1:02d}", 'nombre': meses_nombres[i], 'ingresos': 0.0, 'gastos': 0.0}
            for i in range(12)
        ]

        for reg in qs:
            if reg.fnzs_fecha_operacion:
                m_idx = reg.fnzs_fecha_operacion.month - 1
                monto = float(reg.fnzs_monto_total or 0)
                if reg.fnzs_tipo_operacion == 'Ingreso':
                    grafica_mensual[m_idx]['ingresos'] += monto
                else:
                    grafica_mensual[m_idx]['gastos'] += monto

        return Response({
            'ingresosTotales': float(total_ingresos),
            'gastosTotales': float(total_gastos),
            'utilidadNeta': float(utilidad_neta),
            'gastoAlimentos': float(gasto_alimentos),
            'gastoSalud': float(gasto_salud),
            'gastoInfraestructura': float(gasto_infraestructura),
            'ingresoHuevos': float(ingreso_huevos),
            'metricasPorClasificacion': metricas_calibre,
            'graficaMensual': grafica_mensual,
        }, status=status.HTTP_200_OK)
