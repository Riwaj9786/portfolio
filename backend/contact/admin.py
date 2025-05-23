from django.contrib import admin

from contact.models import ContactInformation, Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
   list_display = ('name', 'email', 'created_at')
   list_display_links = list_display
   list_per_page = 15

   readonly_fields = ('name', 'email', 'message', 'created_at')

   def has_add_permission(self, request):
      return False


@admin.register(ContactInformation)
class ContactInformationAdmin(admin.ModelAdmin):
   list_display = ('__str__',)
   list_display_links = list_display

   def has_add_permission(self, obj):
      if ContactInformation.objects.exists():
         return False
      return True