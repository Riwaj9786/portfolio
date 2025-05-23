from rest_framework.viewsets import ReadOnlyModelViewSet

from blogs.models import Blog, BlogImage, FeaturedBlog
from blogs.serializers import BlogSerializer, BlogImagesSerializer, FeaturedBlogSerializer

class BlogViewSets(ReadOnlyModelViewSet):
   serializer_class = BlogSerializer
   lookup_field = 'slug'

   def get_queryset(self):
      featured_blog_ids = FeaturedBlog.objects.values_list('blog_id', flat=True)
      
      return Blog.objects.filter(is_draft=False).exclude(id__in=featured_blog_ids).prefetch_related('blog_images')

   def get_object(self):
      try:
         return super().get_object()
      except Exception:
         raise ValueError("Blog not found!")


class FeaturedBlogViewSet(ReadOnlyModelViewSet):
   queryset = FeaturedBlog.objects.select_related('blog')
   serializer_class = FeaturedBlogSerializer