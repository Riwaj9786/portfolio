from django.contrib import admin
from django.utils.html import format_html

from adminsortable2.admin import SortableAdminMixin

from services.models import Service

@admin.register(Service)
class ServiceAdmin(SortableAdminMixin, admin.ModelAdmin):
   list_display = ('title', 'description_truncated', 'icon_preview')
   list_display_links = list_display
   readonly_fields = ('icon_preview',)

   def description_truncated(self, obj):
      description = obj.description
      return f'{description[:25]}...' if len(description) > 15 else description
   description_truncated.short_description = "Description"

   def icon_preview(self, obj):
      if obj.icon:
         return format_html(
            '<img src={} height="50" width="50" />',
            obj.icon.url
         )
      else:
         return "No Icon"
   icon_preview.short_description = "Icon"
