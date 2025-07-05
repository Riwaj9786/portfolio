import re

from rest_framework import serializers
from blogs.models import Blog, BlogImage, FeaturedBlog

from django.conf import settings

class BlogImagesSerializer(serializers.ModelSerializer):
   class Meta:
      model = BlogImage
      fields = ('image', 'caption')


class BlogSerializer(serializers.ModelSerializer):
   content = serializers.SerializerMethodField()

   class Meta:
      model = Blog
      fields = ('title', 'content', 'slug', 'banner_image', 'published_at')
      ordering = ('published_at',)


   def get_content(self, obj):
      request = self.context.get('request')
      content = obj.content

      if request:
         base_url = request.build_absolute_uri('/')[:-1]
         # Replace all src="/media/... or src='/media/... with full URL
         pattern = r'src=[\'"](/media/[^\'"]+)[\'"]'
         replacement = rf'src="{base_url}\1"'
         return re.sub(pattern, replacement, content)

      return content


class BlogDetailSerializer(serializers.ModelSerializer):
   blog_images = BlogImagesSerializer(many=True, read_only=True)

   class Meta:
      model = Blog
      fields = ('title', 'content', 'slug', 'banner_image', 'blog_images', 'published_at')


class FeaturedBlogSerializer(serializers.ModelSerializer):
   blog = BlogSerializer(read_only=True)

   class Meta:
      model = FeaturedBlog
      fields = ('blog',)