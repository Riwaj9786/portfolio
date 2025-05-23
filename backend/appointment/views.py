from appointment.serializers import AppointmentSerializer
from appointment.models import Appointment

from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny

class AppointmentCreateAPIView(CreateAPIView):
   queryset = Appointment.objects.select_related('service').all()
   serializer_class = AppointmentSerializer
   permission_classes = (AllowAny,)