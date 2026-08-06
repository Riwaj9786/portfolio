from django.contrib import admin
from django.utils.html import format_html
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
   list_display = ('banner_preview', 'name', 'category', 'client', 'project_period', 'visibility')
   list_display_links = list_display
   readonly_fields = ('updated_at', 'slug')
   list_filter = ('category__name', 'is_archive')
   search_fields = ('name', 'client', 'description', 'distinct_features')
   filter_horizontal = ('skills',)
   ordering = ('-start_date', '-end_date')
   list_per_page = 15
   date_hierarchy = 'start_date'
   save_on_top = True
   actions = ('make_visible', 'make_archived')
   list_select_related = ('category',)

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

   @admin.display(description="Preview")
   def banner_preview(self, obj):
      if obj.banner_image:
         return format_html('<img src="{}" style="width:64px;height:44px;object-fit:cover;border-radius:8px" />', obj.banner_image.url)
      return "—"

   @admin.display(description="Timeline")
   def project_period(self, obj):
      if not obj.start_date:
         return "Not specified"
      return f"{obj.start_date:%b %Y} — {obj.end_date:%b %Y}" if obj.end_date else f"{obj.start_date:%b %Y} — Present"

   @admin.display(description="Status", boolean=False, ordering="is_archive")
   def visibility(self, obj):
      color, label = ("#64748b", "Archived") if obj.is_archive else ("#16a34a", "Visible")
      return format_html('<span style="color:{};font-weight:700">● {}</span>', color, label)

   @admin.action(description="Make selected projects visible")
   def make_visible(self, request, queryset):
      self.message_user(request, f"{queryset.update(is_archive=False)} project(s) made visible.")

   @admin.action(description="Archive selected projects")
   def make_archived(self, request, queryset):
      self.message_user(request, f"{queryset.update(is_archive=True)} project(s) archived.")


class ProjectInline(admin.TabularInline):
   model = Project
   fields = ('name', 'banner_image')
   extra = 0
   readonly_fields = fields


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
   list_display = ('name', 'project_count', 'updated_at')
   list_display_links = list_display
   inlines = (ProjectInline,)
   search_fields = ('name',)

   @admin.display(description="Projects")
   def project_count(self, obj):
      return obj.project_categories.count()
