from django.contrib import admin
from django.utils.html import format_html

from skills.models import SkillCategory, Skill

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
   list_display = ('logo_preview', 'name', 'category_type', 'level_preview', 'updated_at')
   list_display_links = list_display
   readonly_fields = ('updated_at',)
   list_filter = ('category__name',)
   search_fields = ('name', 'category__name')
   ordering = ('category__name', '-level')
   list_per_page = 20

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

   @admin.display(description="Rating", ordering="level")
   def level_preview(self, obj):
      width = min(max(obj.level * 10, 0), 100)
      return format_html('<div style="min-width:130px"><strong>{}/10</strong><div style="height:5px;background:#eee;border-radius:5px;margin-top:5px"><div style="width:{}%;height:100%;background:linear-gradient(90deg,#7c3aed,#c026d3);border-radius:5px"></div></div></div>', obj.level, width)


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
   list_display = ('name', 'skill_count', 'updated_at')
   list_display_links = list_display
   inlines = (SkillInline,)

   @admin.display(description="Skills")
   def skill_count(self, obj):
      return obj.skills.count()
