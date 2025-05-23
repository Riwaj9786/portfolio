from django.urls import path

from appointment.views import AppointmentCreateAPIView

urlpatterns = [
   path('create/', AppointmentCreateAPIView.as_view(), name='create_appointment'),
]
