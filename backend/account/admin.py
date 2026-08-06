from django.contrib import admin
from django.utils.html import format_html
from account.models import User, MediaLinks

admin.site.site_header = "Riwaj Portfolio Studio"
admin.site.site_title = "Portfolio Studio"
admin.site.index_title = "Content overview"

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
   list_display = ('name', 'email', 'profile_pic_preview')
   list_display_links = list_display
   readonly_fields = ('last_login', 'profile_pic_large_preview', 'updated_at')
   exclude = ('password', 'groups', 'user_permissions')
   search_fields = ('name', 'email', 'title')

   fieldsets = (
      ("Basic Information", {
         'fields': ('email', 'name', 'title', 'short_bio', 'description')
      }),
      ("Resume", {
         'fields': ('resume',)
      }),
      ("Profile Picture", {
         'fields': ('profile_pic', 'profile_pic_large_preview')
      }),
      ("System Information", {
         'fields': ('last_login', 'updated_at')
      })
   )

   def has_add_permission(self, request):
      if User.objects.exists():
         return False
      return True


   def has_delete_permission(self, request, obj=None):
      return False


   def profile_pic_preview(self, obj):
      if obj.profile_pic:
         return format_html(
            '<img src="{}" style="width:46px;height:46px;object-fit:cover;border-radius:12px;box-shadow:0 4px 12px rgba(76,29,149,.16)" />', obj.profile_pic.url
         )
      return "No Image"
   
   profile_pic_preview.short_description = "Profile Picture"


   def profile_pic_large_preview(self, obj):
      if obj.profile_pic:
         return format_html(
            '<img src="{}" style="width:220px;height:220px;object-fit:cover;border-radius:20px;box-shadow:0 12px 30px rgba(76,29,149,.18)" />', obj.profile_pic.url
         )
      return "No Image"
   
   profile_pic_large_preview.short_description = "Profile Picture Preview"



@admin.register(MediaLinks)
class MediaLinksAdmin(admin.ModelAdmin):
   list_display = ('platform_name', 'link')
   list_display_links = ('platform_name',)
   search_fields = ('platform_name', 'link')
