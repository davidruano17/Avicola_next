from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q

from apps.galpones.models import Galpon
from apps.produccion.models import ProduccionHuevos, ClasificacionHuevos, AlimentacionAves
from apps.produccion.serializers import ProduccionHuevosSerializer, ClasificacionHuevosSerializer
from apps.sanidad.models import MortalidadAves, MorbilidadAves
from apps.sanidad.serializers import MortalidadAvesSerializer, MorbilidadAvesSerializer
from apps.finanzas.models import FinanzasUdAvicola

class FiltrarReportesView(APIView):
    """
    Endpoint dedicado para los filtros dinámicos de Reportes de AVISENA COL (ReportesView):
    - Parámetros:
      * tipoReporte: 'Producción de huevos' | 'Clasificación de huevos' | 'Mortalidad de aves' | 'Morbilidad de aves'
      * galpon: ID o nombre del galpón ('01', '02', 'Galpón 1', o vacío para todos)
      * fechaInicio: YYYY-MM-DD
      * fechaFin: YYYY-MM-DD
    - Retorna objeto con:
      * datos: lista con registros serializados según el contrato del frontend
      * resumen: indicadores estadísticos y de rendimiento avícola
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tipo_reporte = request.query_params.get('tipoReporte') or request.query_params.get('tipo') or ""
        galpon_param = request.query_params.get('galpon') or ""
        fecha_inicio = request.query_params.get('fechaInicio') or request.query_params.get('fecha_inicio') or ""
        fecha_fin = request.query_params.get('fechaFin') or request.query_params.get('fecha_fin') or ""

        # Normalizar ID de galpón si fue especificado
        galpon_id = None
        if galpon_param and galpon_param.lower() not in ['todos', '']:
            try:
                clean_g = str(galpon_param).replace('Galpón', '').replace('Galpon', '').strip()
                galpon_id = int(clean_g)
            except (ValueError, TypeError):
                pass

        datos = []
        resumen = {
            'totalRegistros': 0,
            'totalCantidad': 0,
            'promedio': 0.0,
            'maximo': 0,
            'minimo': 0,
            'totalHuevosBuenos': 0,
            'totalHuevosRotos': 0,
            'totalHuevosDescarte': 0,
            'tasaMerma': 0.0,
            'totalPanales': 0,
            'totalDinero': 0.0,
            'totalSobrantes': 0,
            'causaPrincipal': 'Sin datos',
            'afectacionPrincipal': 'Sin datos',
            'categoriaPrincipal': 'Sin datos',
            'galponPrincipal': 'Sin datos',
        }

        tipo_lower = tipo_reporte.lower()

        # 1. Producción de huevos
        if 'producci' in tipo_lower:
            qs = ProduccionHuevos.objects.select_related('galpon', 'usuario').all().order_by('-prod_fecha_recoleccion')
            if galpon_id:
                qs = qs.filter(galpon_id=galpon_id)
            if fecha_inicio and fecha_fin:
                qs = qs.filter(prod_fecha_recoleccion__range=[fecha_inicio, fecha_fin])
            elif fecha_inicio:
                qs = qs.filter(prod_fecha_recoleccion__gte=fecha_inicio)
            elif fecha_fin:
                qs = qs.filter(prod_fecha_recoleccion__lte=fecha_fin)

            serialized = ProduccionHuevosSerializer(qs, many=True).data
            datos = serialized

            total_buenos = sum(item.get('huevosBuenos') or 0 for item in serialized)
            total_rotos = sum(item.get('huevosRotos') or 0 for item in serialized)
            total_descarte = sum(item.get('descarte') or 0 for item in serialized)
            total_huevos = total_buenos + total_rotos + total_descarte
            cantidades = [item.get('totalHuevos') or 0 for item in serialized]

            resumen['totalRegistros'] = len(serialized)
            resumen['totalCantidad'] = total_huevos
            resumen['promedio'] = round(total_huevos / len(serialized), 1) if serialized else 0.0
            resumen['maximo'] = max(cantidades) if cantidades else 0
            resumen['minimo'] = min(cantidades) if cantidades else 0
            resumen['totalHuevosBuenos'] = total_buenos
            resumen['totalHuevosRotos'] = total_rotos
            resumen['totalHuevosDescarte'] = total_descarte
            resumen['tasaMerma'] = round(((total_rotos + total_descarte) / total_huevos) * 100, 2) if total_huevos > 0 else 0.0

            # Galpón con mayor producción
            galpon_counts = {}
            for item in serialized:
                g = item.get('galpon') or 'Galpón 01'
                galpon_counts[g] = galpon_counts.get(g, 0) + (item.get('totalHuevos') or 0)
            if galpon_counts:
                resumen['galponPrincipal'] = max(galpon_counts, key=lambda k: galpon_counts[k])

        # 2. Clasificación de huevos
        elif 'clasifica' in tipo_lower:
            qs = ClasificacionHuevos.objects.select_related('galpon', 'usuario').all().order_by('-clas_fecha_clasificacion')
            if galpon_id:
                qs = qs.filter(galpon_id=galpon_id)
            if fecha_inicio and fecha_fin:
                qs = qs.filter(clas_fecha_clasificacion__range=[fecha_inicio, fecha_fin])
            elif fecha_inicio:
                qs = qs.filter(clas_fecha_clasificacion__gte=fecha_inicio)
            elif fecha_fin:
                qs = qs.filter(clas_fecha_clasificacion__lte=fecha_fin)

            serialized = ClasificacionHuevosSerializer(qs, many=True).data
            datos = serialized

            total_unidades = sum(item.get('unidades') or 0 for item in serialized)
            total_panales = sum(item.get('panales') or 0 for item in serialized)
            total_sobrantes = sum(item.get('totalSobrantes') or 0 for item in serialized)
            total_dinero = sum(float(item.get('valorDinero') or 0) for item in serialized)
            cantidades = [item.get('unidades') or 0 for item in serialized]

            resumen['totalRegistros'] = len(serialized)
            resumen['totalCantidad'] = total_unidades
            resumen['promedio'] = round(total_unidades / len(serialized), 1) if serialized else 0.0
            resumen['maximo'] = max(cantidades) if cantidades else 0
            resumen['minimo'] = min(cantidades) if cantidades else 0
            resumen['totalPanales'] = total_panales
            resumen['totalDinero'] = round(total_dinero, 2)
            resumen['totalSobrantes'] = total_sobrantes

            galpon_counts = {}
            for item in serialized:
                g = item.get('galpon') or 'Galpón 01'
                galpon_counts[g] = galpon_counts.get(g, 0) + (item.get('unidades') or 0)
            if galpon_counts:
                resumen['galponPrincipal'] = max(galpon_counts, key=lambda k: galpon_counts[k])

        # 3. Mortalidad de aves
        elif 'mortalidad' in tipo_lower:
            qs = MortalidadAves.objects.select_related('galpon', 'usuario').all().order_by('-mort_fecha')
            if galpon_id:
                qs = qs.filter(galpon_id=galpon_id)
            if fecha_inicio and fecha_fin:
                qs = qs.filter(mort_fecha__range=[fecha_inicio, fecha_fin])
            elif fecha_inicio:
                qs = qs.filter(mort_fecha__gte=fecha_inicio)
            elif fecha_fin:
                qs = qs.filter(mort_fecha__lte=fecha_fin)

            serialized = MortalidadAvesSerializer(qs, many=True).data
            datos = serialized

            total_bajas = sum(item.get('cantidad') or 0 for item in serialized)
            cantidades = [item.get('cantidad') or 0 for item in serialized]

            resumen['totalRegistros'] = len(serialized)
            resumen['totalCantidad'] = total_bajas
            resumen['promedio'] = round(total_bajas / len(serialized), 1) if serialized else 0.0
            resumen['maximo'] = max(cantidades) if cantidades else 0
            resumen['minimo'] = min(cantidades) if cantidades else 0

            # Causa principal agrupada por cantidad de aves
            causas = {}
            for item in serialized:
                c = item.get('causa') or 'No especificada'
                causas[c] = causas.get(c, 0) + (item.get('cantidad') or 0)
            if causas:
                resumen['causaPrincipal'] = max(causas, key=lambda k: causas[k])

            galpon_counts = {}
            for item in serialized:
                g = item.get('galpon') or 'Galpón 01'
                galpon_counts[g] = galpon_counts.get(g, 0) + (item.get('cantidad') or 0)
            if galpon_counts:
                resumen['galponPrincipal'] = max(galpon_counts, key=lambda k: galpon_counts[k])

        # 4. Morbilidad de aves
        elif 'morbilidad' in tipo_lower:
            qs = MorbilidadAves.objects.select_related('galpon', 'usuario').all().order_by('-morb_fecha_reporte')
            if galpon_id:
                qs = qs.filter(galpon_id=galpon_id)
            if fecha_inicio and fecha_fin:
                qs = qs.filter(morb_fecha_reporte__range=[fecha_inicio, fecha_fin])
            elif fecha_inicio:
                qs = qs.filter(morb_fecha_reporte__gte=fecha_inicio)
            elif fecha_fin:
                qs = qs.filter(morb_fecha_reporte__lte=fecha_fin)

            serialized = MorbilidadAvesSerializer(qs, many=True).data
            datos = serialized

            total_enfermas = sum(item.get('cantidad') or 0 for item in serialized)
            cantidades = [item.get('cantidad') or 0 for item in serialized]

            resumen['totalRegistros'] = len(serialized)
            resumen['totalCantidad'] = total_enfermas
            resumen['promedio'] = round(total_enfermas / len(serialized), 1) if serialized else 0.0
            resumen['maximo'] = max(cantidades) if cantidades else 0
            resumen['minimo'] = min(cantidades) if cantidades else 0

            afectaciones = {}
            for item in serialized:
                af = item.get('afectacion') or 'Moderado'
                afectaciones[af] = afectaciones.get(af, 0) + (item.get('cantidad') or 0)
            if afectaciones:
                resumen['afectacionPrincipal'] = max(afectaciones, key=lambda k: afectaciones[k])

            galpon_counts = {}
            for item in serialized:
                g = item.get('galpon') or 'Galpón 01'
                galpon_counts[g] = galpon_counts.get(g, 0) + (item.get('cantidad') or 0)
            if galpon_counts:
                resumen['galponPrincipal'] = max(galpon_counts, key=lambda k: galpon_counts[k])

        return Response({
            'datos': datos,
            'resumen': resumen,
        }, status=status.HTTP_200_OK)


class DashboardMetricasView(APIView):
    """
    Endpoint analítico consolidado para el Dashboard y Reportes:
    - Total de aves activas.
    - Total de producción y desglose de clasificación.
    - Mortalidad acumulada y causa principal calculada con SUM(mort_cantidad_aves).
    - Tasa de postura y porcentaje de mortalidad.
    - Resumen financiero de ingresos, gastos y utilidad neta.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        galpon_id = request.query_params.get('galpon_id')
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')

        galpones_qs = Galpon.objects.all()
        produccion_qs = ProduccionHuevos.objects.all()
        clasificacion_qs = ClasificacionHuevos.objects.all()
        alimentacion_qs = AlimentacionAves.objects.all()
        mortalidad_qs = MortalidadAves.objects.all()
        morbilidad_qs = MorbilidadAves.objects.all()
        finanzas_qs = FinanzasUdAvicola.objects.all()

        if galpon_id:
            galpones_qs = galpones_qs.filter(galpon_id=galpon_id)
            produccion_qs = produccion_qs.filter(galpon_id=galpon_id)
            clasificacion_qs = clasificacion_qs.filter(galpon_id=galpon_id)
            alimentacion_qs = alimentacion_qs.filter(galpon_id=galpon_id)
            mortalidad_qs = mortalidad_qs.filter(galpon_id=galpon_id)
            morbilidad_qs = morbilidad_qs.filter(galpon_id=galpon_id)
            finanzas_qs = finanzas_qs.filter(galpon_id=galpon_id)

        if fecha_inicio and fecha_fin:
            produccion_qs = produccion_qs.filter(prod_fecha_recoleccion__range=[fecha_inicio, fecha_fin])
            clasificacion_qs = clasificacion_qs.filter(clas_fecha_clasificacion__range=[fecha_inicio, fecha_fin])
            alimentacion_qs = alimentacion_qs.filter(alim_fecha__range=[fecha_inicio, fecha_fin])
            mortalidad_qs = mortalidad_qs.filter(mort_fecha__range=[fecha_inicio, fecha_fin])
            morbilidad_qs = morbilidad_qs.filter(morb_fecha_reporte__range=[fecha_inicio, fecha_fin])
            finanzas_qs = finanzas_qs.filter(fnzs_fecha_operacion__range=[fecha_inicio, fecha_fin])

        # Métricas de Aves y Población
        total_aves = galpones_qs.aggregate(total=Sum('galp_numero_aves'))['total'] or 0
        total_galpones = galpones_qs.count()

        # Métricas de Producción
        total_huevos_buenos = produccion_qs.aggregate(total=Sum('prod_huevos_buenos'))['total'] or 0
        total_huevos_rotos = produccion_qs.aggregate(total=Sum('prod_huevos_rotos'))['total'] or 0
        total_huevos_descarte = produccion_qs.aggregate(total=Sum('prod_huevos_descarte'))['total'] or 0
        total_huevos_recolectados = total_huevos_buenos + total_huevos_rotos + total_huevos_descarte

        # Clasificación de Huevos
        clasificacion_totales = clasificacion_qs.aggregate(
            tipo_A=Sum('clas_huevo_tipo_A'),
            tipo_AA=Sum('clas_huevo_tipo_AA'),
            tipo_AAA=Sum('clas_huevo_tipo_AAA'),
            tipo_B=Sum('clas_huevo_tipo_B'),
            tipo_C=Sum('clas_huevo_tipo_C'),
            tipo_Jumbo=Sum('clas_huevo_tipo_Jumbo')
        )
        desglose_clasificacion = {k: v or 0 for k, v in clasificacion_totales.items()}
        total_clasificados = sum(desglose_clasificacion.values())

        # Mortalidad
        total_mortalidad = mortalidad_qs.aggregate(total=Sum('mort_cantidad_aves'))['total'] or 0
        causas_mortalidad = mortalidad_qs.values('mort_causa_muerte').annotate(
            total_aves=Sum('mort_cantidad_aves')
        ).order_by('-total_aves')

        causa_principal_mortalidad = causas_mortalidad.first() if causas_mortalidad.exists() else None

        poblacion_base = total_aves + total_mortalidad
        tasa_mortalidad = round((total_mortalidad / poblacion_base) * 100, 2) if poblacion_base > 0 else 0.0

        # Morbilidad
        total_aves_enfermas = morbilidad_qs.aggregate(total=Sum('morb_cant_aves_afectadas'))['total'] or 0

        # Consumo de Alimento
        total_alimento_kg = alimentacion_qs.aggregate(total=Sum('alim_cant_alimento'))['total'] or 0

        # Métricas Financieras
        total_ingresos = finanzas_qs.filter(fnzs_tipo_operacion='Ingreso').aggregate(total=Sum('fnzs_monto_total'))['total'] or 0
        total_gastos = finanzas_qs.filter(fnzs_tipo_operacion='Gasto').aggregate(total=Sum('fnzs_monto_total'))['total'] or 0
        utilidad_neta = total_ingresos - total_gastos

        # Tasa de postura
        tasa_postura = round((total_huevos_buenos / total_aves) * 100, 2) if total_aves > 0 else 0.0

        return Response({
            'resumen_general': {
                'total_aves_activas': total_aves,
                'total_galpones': total_galpones,
                'total_huevos_recolectados': total_huevos_recolectados,
                'total_huevos_buenos': total_huevos_buenos,
                'total_huevos_rotos': total_huevos_rotos,
                'total_huevos_descarte': total_huevos_descarte,
                'total_huevos_clasificados': total_clasificados,
                'tasa_postura_porcentaje': tasa_postura,
                'total_alimento_kg': float(total_alimento_kg),
                'total_mortalidad_aves': total_mortalidad,
                'tasa_mortalidad_porcentaje': tasa_mortalidad,
                'total_aves_enfermas': total_aves_enfermas,
            },
            'causa_principal_mortalidad': causa_principal_mortalidad,
            'desglose_mortalidad_por_causa': list(causas_mortalidad),
            'desglose_clasificacion_huevos': desglose_clasificacion,
            'balance_financiero': {
                'total_ingresos': float(total_ingresos),
                'total_gastos': float(total_gastos),
                'utilidad_neta': float(utilidad_neta)
            }
        }, status=status.HTTP_200_OK)
