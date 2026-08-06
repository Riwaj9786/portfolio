from django.contrib import admin
from django.utils.html import format_html

from blogs.models import Blog, BlogImage, FeaturedBlog

class BlogImageInline(admin.StackedInline):
   model = BlogImage
   fields = ('image', 'caption')
   extra = 0


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
   list_display = ('banner_preview', 'title', 'get_status', 'published_at', 'image_count')
   list_display_links = list_display
   readonly_fields = ('slug',)
   list_per_page = 15
   search_fields = ('title', 'content', 'slug')
   list_filter = ('is_draft', 'published_at')
   date_hierarchy = 'published_at'
   save_on_top = True
   actions = ('publish_selected', 'move_to_drafts')

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

   @admin.display(description="Preview")
   def banner_preview(self, obj):
      return format_html('<img src="{}" style="width:64px;height:44px;object-fit:cover;border-radius:8px" />', obj.banner_image.url) if obj.banner_image else "—"

   @admin.display(description="Gallery")
   def image_count(self, obj):
      return obj.blog_images.count()

   @admin.action(description="Publish selected articles")
   def publish_selected(self, request, queryset):
      self.message_user(request, f"{queryset.update(is_draft=False)} article(s) published.")

   @admin.action(description="Move selected articles to drafts")
   def move_to_drafts(self, request, queryset):
      self.message_user(request, f"{queryset.update(is_draft=True)} article(s) moved to drafts.")


@admin.register(FeaturedBlog)
class FeaturedBlogAdmin(admin.ModelAdmin):
   list_display = ('__str__', 'blog')
   list_display_links = list_display

   def has_add_permission(self, request):
      if FeaturedBlog.objects.exists():
         return False
      return True
