from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MortalidadAvesViewSet,
    MorbilidadAvesViewSet,
    TratamientoAvesViewSet
)

router = DefaultRouter()
router.register(r'mortalidad', MortalidadAvesViewSet, basename='mortalidad')
router.register(r'morbilidad', MorbilidadAvesViewSet, basename='morbilidad')
router.register(r'tratamientos', TratamientoAvesViewSet, basename='tratamientos')
router.register(r'tratamiento', TratamientoAvesViewSet, basename='tratamiento')

urlpatterns = [
    path('', include(router.urls)),
]
