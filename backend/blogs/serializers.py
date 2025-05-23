from rest_framework import serializers
from blogs.models import Blog, BlogImage, FeaturedBlog


class BlogImagesSerializer(serializers.ModelSerializer):
   class Meta:
      model = BlogImage
      fields = ('image', 'caption')


class BlogSerializer(serializers.ModelSerializer):
   blog_images = BlogImagesSerializer(read_only=True, many=True)

   class Meta:
      model = Blog
      fields = ('title', 'content', 'slug', 'banner_image', 'published_at', 'blog_images')
      ordering = ('-published_at')


class FeaturedBlogSerializer(serializers.ModelSerializer):
   blog = BlogSerializer(read_only=True)
   
   class Meta:
      model = FeaturedBlog
      fields = ('blog',)