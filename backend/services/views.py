from rest_framework.viewsets import ReadOnlyModelViewSet

from services.models import Service
from services.serializers import ServiceSerializer

class ServiceViewSet(ReadOnlyModelViewSet):
   queryset = Service.objects.all()
   serializer_class = ServiceSerializer