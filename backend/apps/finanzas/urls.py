from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FinanzasUdAvicolaViewSet

router = DefaultRouter()
router.register(r'transacciones', FinanzasUdAvicolaViewSet, basename='transacciones')
router.register(r'', FinanzasUdAvicolaViewSet, basename='finanzas')

urlpatterns = [
    path('', include(router.urls)),
]
