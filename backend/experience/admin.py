from django.contrib import admin
from django.utils.html import format_html

from experience.models import Experience

@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
   list_display = ('title', 'company', 'job_type_preview', 'start_date', 'end_date_preview', 'to_display')
   list_display_links = list_display
   readonly_fields = ('updated_at',)
   search_fields = ('title', 'company')
   list_filter = ('job_type',)
   filter_horizontal = ('skills',)
   ordering = ('-start_date', '-end_date')
   list_per_page = 5

   fieldsets = (
      ("Basic Information", {
         "fields": ('title', 'company', 'company_url', 'job_type', 'to_display', 'updated_at')
      }),
      ("Time", {
         "fields": ('start_date', 'end_date')
      }),
      ("Skills", {
         "fields": ('skills',)
      }),
   )

   def end_date_preview(self, obj):
      if obj.end_date:
         return obj.end_date
      else:
         return format_html(
            '<p class="btn btn-outline-primary">Present</p>'
         )
   end_date_preview.short_description = "End datetime"

   def job_type_preview(self, obj):
      if obj.job_type:
         if obj.job_type == "Onsite":
            return format_html(
               '<p class="btn btn-primary">{}</p>',
               obj.job_type
            )
         elif obj.job_type == "Remote":
            return format_html(
               '<p class="btn btn-secondary">{}</p>',
               obj.job_type
            )
         else:
            return format_html(
               '<p class="btn btn-outline-primary">{}</p>',
               obj.job_type
            )
      else:
         return "-"

   job_type_preview.short_description = "Job Type"

