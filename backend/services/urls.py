from django.urls import path
from rest_framework import routers

from services.views import ServiceViewSet

router = routers.DefaultRouter()

router.register(r'services', ServiceViewSet, basename='services')

urlpatterns = router.urls
