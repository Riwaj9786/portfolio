from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.filters import SearchFilter

from blogs.models import Blog, BlogImage, FeaturedBlog
from blogs.serializers import BlogSerializer, BlogImagesSerializer, FeaturedBlogSerializer, BlogDetailSerializer

class BlogListView(ListAPIView):
   serializer_class = BlogSerializer
   filter_backends = (SearchFilter,)
   search_fields = ('title',)

   def get_queryset(self):
      featured_blog_ids = FeaturedBlog.objects.values_list('blog_id', flat=True)
      return Blog.objects.filter(is_draft=False).exclude(id__in=featured_blog_ids).prefetch_related('blog_images')

   def get_object(self):
      try:
         return super().get_object()
      except Exception:
         raise ValueError("Blog not found!")


class BlogDetailView(RetrieveAPIView):
   queryset = Blog.objects.filter(is_draft=False).prefetch_related('blog_images')
   serializer_class = BlogDetailSerializer
   lookup_field = 'slug'

   def get_serializer_context(self):
      context = super().get_serializer_context()
      context.update({'request': self.request})
      return context


class FeaturedBlogViewSet(ReadOnlyModelViewSet):
   queryset = FeaturedBlog.objects.select_related('blog')
   serializer_class = FeaturedBlogSerializer