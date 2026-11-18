from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Endpoints de la API REST de AVISENA COL
    path('api/', include('apps.usuarios.urls')),
    path('api/galpones/', include('apps.galpones.urls')),
    path('api/produccion/', include('apps.produccion.urls')),
    path('api/sanidad/', include('apps.sanidad.urls')),
    path('api/finanzas/', include('apps.finanzas.urls')),
    path('api/notificaciones/', include('apps.notificaciones.urls')),
    path('api/reportes/', include('apps.reportes.urls')),
]
