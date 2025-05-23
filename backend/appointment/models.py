from django.db import models

from services.models import Service
from backend.models import TimeStampedModel


class Appointment(TimeStampedModel):
   first_name = models.CharField(max_length=255)
   last_name = models.CharField(max_length=255)

   email = models.EmailField()
   service = models.ManyToManyField(
      Service,
      related_name="service_appointment"
   )

   appointment_datetime = models.DateTimeField()
   alternative_datetime = models.DateTimeField(null=True, blank=True)

   contact_number = models.CharField()
   address = models.CharField(max_length=1000)


   def __str__(self):
      return f"{self.first_name} {self.last_name}: {self.appointment_datetime}"

   class Meta:
      verbose_name = "Appointment Request"
      verbose_name_plural = f"{verbose_name}s"