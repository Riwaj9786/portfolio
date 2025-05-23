from django.contrib import admin
from projects.models import (
   ProjectCategory,
   Project,
   ProjectImage,
   ProjectLink,
)

class ProjectImageInline(admin.TabularInline):
   model = ProjectImage
   fields = ('image', 'caption')
   extra = 0
   list_per_page = 5
   verbose_name = "Project Image"
   verbose_name_plural = "Project Images"


class ProjectLinkInline(admin.TabularInline):
   model = ProjectLink
   fields = ('name', 'link')
   extra = 0
   verbose_name = "Project Link"
   verbose_name_plural = "Project Links"


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
   list_display = ('name', 'category', 'client', 'is_archive')
   list_display_links = list_display
   readonly_fields = ('updated_at', 'slug')
   list_filter = ('category__name', 'is_archive')
   filter_horizontal = ('skills',)
   ordering = ('-start_date', '-end_date')
   list_per_page = 5

   inlines = (ProjectImageInline, ProjectLinkInline)

   fieldsets = (
      ("Project General", {
         'fields': ('name', 'client', 'banner_image', 'category', 'is_archive', 'slug', 'updated_at')
      }),
      ("Project Date", {
         "fields": ('start_date', 'end_date')
      }),
      ("Project Description", {
         "fields": ('description', 'distinct_features',)
      }),
      ("Skills", {
         "fields": ('skills',)
      }),
   )


class ProjectInline(admin.TabularInline):
   model = Project
   fields = ('name', 'banner_image')
   extra = 0
   readonly_fields = fields


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
   list_display = ('name',)
   list_display_links = list_display
   inlines = (ProjectInline,)