from django.urls import path
from .views import DashboardMetricasView, FiltrarReportesView

urlpatterns = [
    path('dashboard/', DashboardMetricasView.as_view(), name='dashboard_metricas'),
    path('consolidado/', DashboardMetricasView.as_view(), name='reportes_consolidado'),
    path('filtrar/', FiltrarReportesView.as_view(), name='reportes_filtrar'),
]
