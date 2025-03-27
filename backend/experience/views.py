from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.filters import OrderingFilter

from experience.models import Experience
from experience.serializers import ExperienceSerializer

class ExperienceViewSet(ReadOnlyModelViewSet):
   queryset = Experience.objects.all()
   serializer_class = ExperienceSerializer
   filter_backends = (OrderingFilter,)
   ordering = ('-start_date',)