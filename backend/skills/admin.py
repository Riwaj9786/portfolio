from django.contrib import admin
from django.utils.html import format_html

from skills.models import SkillCategory, Skill

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
   list_display = ('name', 'level', 'logo_preview', 'category_type')
   list_display_links = list_display
   readonly_fields = ('updated_at',)
   list_filter = ('category__name',)
   list_per_page = 8

   def category_type(self, obj):
      if obj.category:
         return format_html(
               '<a href="/admin/skills/skillcategory/{}/change/" class="btn btn-primary">'
               '{}'
               '</a>',
               obj.category.id,
               obj.category.name
         )
      return "-"
   category_type.short_description = "Category"


   def logo_preview(self, obj):
      if obj.logo:
         return format_html('<img src="{}" width="50" height="50" />', obj.logo.url)
      return "(No Logo)"
   
   logo_preview.short_description = "Logo"


class SkillInline(admin.TabularInline):
   model = Skill
   extra = 0
   can_delete = False
   readonly_fields = ('name', 'logo_preview', 'level')
   exclude = ('logo',)

   def logo_preview(self, obj):
      if obj.logo:
         return format_html('<img src="{}" width="50" height="50" />', obj.logo.url)
      return "(No Logo)"
   
   logo_preview.short_description = "Logo"


@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
   list_display = ('name',)
   list_display_links = list_display
   inlines = (SkillInline,)