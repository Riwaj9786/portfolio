from django.contrib import admin
from django.utils.html import format_html

from adminsortable2.admin import SortableAdminMixin

from testimonial.models import TestimonialRequest, Testimonial

@admin.register(TestimonialRequest)
class TestimonialRequestAdmin(admin.ModelAdmin):
   list_display = ('name', 'email', 'updated_at')
   list_display_links = list_display
   readonly_fields = ('updated_at',)
   search_fields = ('name', 'email')


@admin.register(Testimonial)
class TestimonialAdmin(SortableAdminMixin, admin.ModelAdmin):
   list_display = ('image_preview', 'name', 'company', 'position', 'consent_status', 'publication_status', 'created_at')
   list_display_links = list_display
   readonly_fields = (
      'name', 'email', 'company', 'image',
      'image_large_preview', 'position',
      'testimonial', 'updated_at', 'created_at'
   )
   ordering = ('order',)
   list_filter = ('to_publish', 'published', 'created_at')
   search_fields = ('name', 'email', 'company', 'position', 'testimonial')
   date_hierarchy = 'created_at'
   list_per_page = 20

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

   @admin.display(description="Consent", boolean=True, ordering="to_publish")
   def consent_status(self, obj):
      return obj.to_publish

   @admin.display(description="Published", boolean=True, ordering="published")
   def publication_status(self, obj):
      return obj.published
