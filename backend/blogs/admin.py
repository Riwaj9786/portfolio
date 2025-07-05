from django.contrib import admin
from django.utils.html import format_html

from blogs.models import Blog, BlogImage, FeaturedBlog

class BlogImageInline(admin.StackedInline):
   model = BlogImage
   fields = ('image', 'caption')
   extra = 0


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
   list_display = ('title', 'get_status', 'published_at', 'slug')
   list_display_links = list_display
   readonly_fields = ('slug',)
   list_per_page = 5
   search_fields = ('title',)

   inlines = (BlogImageInline,)
   ordering = ('-published_at',)

   fieldsets = (
      ('Blog Information', {
         'fields': ('is_draft', 'title', 'banner_image',  'slug')
      }),
      ('Content', {
         'fields': ('content',)
      }),
      ('Publication Info', {
         'fields': ('published_at',)
      }),
   )

   def description_truncate(self, obj):
      return f'{obj.content[:25]}'
   
   description_truncate.short_description = "Content"

   def get_status(self, obj):
      if obj.is_draft:
         return format_html('<span style="color: red;">Draft</span>')
      return format_html('<span style="color: green;">Published</span>')
   
   get_status.short_description = "Status"


@admin.register(FeaturedBlog)
class FeaturedBlogAdmin(admin.ModelAdmin):
   list_display = ('__str__', 'blog')
   list_display_links = list_display

   def has_add_permission(self, request):
      if FeaturedBlog.objects.exists():
         return False
      return True