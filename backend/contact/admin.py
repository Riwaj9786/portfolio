from django.contrib import admin

from contact.models import ContactInformation, Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
   list_display = ('name', 'email', 'message_preview', 'created_at')
   list_display_links = list_display
   list_per_page = 15
   search_fields = ('name', 'email', 'message')
   date_hierarchy = 'created_at'
   ordering = ('-created_at',)

   readonly_fields = ('name', 'email', 'message', 'created_at')

   def has_add_permission(self, request):
      return False

   @admin.display(description="Message")
   def message_preview(self, obj):
      return f"{obj.message[:70]}…" if len(obj.message) > 70 else obj.message


@admin.register(ContactInformation)
class ContactInformationAdmin(admin.ModelAdmin):
   list_display = ('__str__',)
   list_display_links = list_display

   def has_add_permission(self, request):
      if ContactInformation.objects.exists():
         return False
      return True
