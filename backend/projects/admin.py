from django.contrib import admin
from projects.models import ProjectCategory, Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
   list_display = ('name', 'category', 'client')
   list_display_links = list_display
   readonly_fields = ('updated_at',)
   list_filter = ('category__name',)
   filter_horizontal = ('skills',)
   ordering = ('-start_date', '-end_date')

   fieldsets = (
      ("Project General", {
         'fields': ('name', 'link', 'client', 'banner_image', 'category', 'updated_at')
      }),
      ("Project Date", {
         "fields": ('start_date', 'end_date')
      }),
      ("Skills", {
         "fields": ('skills',)
      })
   )


class ProjectInline(admin.TabularInline):
   model = Project
   fields = ('name', 'link', 'banner_image')
   extra = 0
   readonly_fields = fields


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
   list_display = ('name',)
   list_display_links = list_display
   inlines = [ProjectInline]