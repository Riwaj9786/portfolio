from rest_framework import serializers

from appointment.models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
   class Meta:
      model = Appointment
      fields = (
         'id', 'first_name', 'last_name', 'email',
         'service', 'appointment_datetime', 'alternative_datetime',
         'contact_number', 'address'
      )