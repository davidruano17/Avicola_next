from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GalponViewSet

router = DefaultRouter()
router.register(r'', GalponViewSet, basename='galpon')

urlpatterns = [
    path('', include(router.urls)),
]
