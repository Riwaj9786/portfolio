from django.contrib import admin
from django.utils.html import format_html

from adminsortable2.admin import SortableAdminMixin

from testimonial.models import TestimonialRequest, Testimonial

@admin.register(TestimonialRequest)
class TestimonialRequestAdmin(admin.ModelAdmin):
   list_display = ('name', 'email')
   list_display_links = list_display
   readonly_fields = ('updated_at',)


@admin.register(Testimonial)
class TestimonialAdmin(SortableAdminMixin, admin.ModelAdmin):
   list_display = ('name', 'email', 'company', 'image_preview')
   list_display_links = list_display
   readonly_fields = (
      'name', 'email', 'company', 'image',
      'image_large_preview', 'position',
      'testimonial', 'to_publish',
      'updated_at', 'created_at'
   )
   ordering = ('order',)

   def image_preview(self, obj):
      if obj.image:
         return format_html(
            '<img src="{}" width="50" height="50" />', obj.image.url
         )
      return "No Image"

   image_preview.short_description = "Image Preview"


   def image_large_preview(self, obj):
      if obj.image:
         return format_html(
            '<img src="{}" width="250" height="250" />', obj.image.url
         )
      return "No Image"

   image_large_preview.short_description = "Image Preview"


   def has_add_permission(self, request, *args, **kwargs):
      return False