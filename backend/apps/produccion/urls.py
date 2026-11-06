from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProduccionHuevosViewSet,
    ClasificacionHuevosViewSet,
    AlimentacionAvesViewSet
)

router = DefaultRouter()
router.register(r'clasificacion', ClasificacionHuevosViewSet, basename='clasificacion')
router.register(r'alimentacion', AlimentacionAvesViewSet, basename='alimentacion')
router.register(r'recoleccion', ProduccionHuevosViewSet, basename='recoleccion')
router.register(r'', ProduccionHuevosViewSet, basename='produccion')

urlpatterns = [
    path('', include(router.urls)),
]
