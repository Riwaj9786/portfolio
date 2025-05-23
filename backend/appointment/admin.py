from django.contrib import admin

from appointment.models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
   list_display = ('first_name', 'last_name', 'appointment_datetime')
   list_display_links = list_display

   readonly_fields = (
      'first_name', 'last_name', 'email',
      'service', 'appointment_datetime', 'alternative_datetime',
      'contact_number', 'address'
   )

   fieldsets = (
      ("Personal Information", {
         'fields': ('first_name', 'last_name', 'email', 'contact_number', 'address')
      }),
      ("Dates", {
         'fields': ('appointment_datetime', 'alternative_datetime')
      }),
      ('Services', {
         'fields': ('service',)
      }),
   )