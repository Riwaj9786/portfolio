from django.db import models
from django_ckeditor_5.fields import CKEditor5Field
from django.core.validators import MinValueValidator

from backend.models import TimeStampedModel
from backend.utils import (
   validate_image_extension,
   validate_icon_size,
   generate_unique_slug,
)

# Create your models here.
class Blog(TimeStampedModel):
   title = models.CharField(max_length=500)
   content = CKEditor5Field('Text')
   slug = models.SlugField(unique=True, blank=True)
   banner_image = models.ImageField(upload_to='blog/banner_image/', validators=[validate_icon_size, validate_image_extension])
   published_at = models.DateTimeField()
   is_draft = models.BooleanField(default=True)

   def __str__(self):
      return self.title

   class Meta:
      ordering = ('-published_at',)

   def save(self, *args, **kwargs):
      if not self.slug:
         self.slug = generate_unique_slug(self.title)
      super().save(*args, **kwargs)


class BlogImage(models.Model):
   blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='blog_images')
   image = models.ImageField(upload_to='blog/images/', validators=[validate_image_extension, validate_icon_size])
   caption = models.CharField(max_length=255, blank=True, null=True)

   def __str__(self):
      return f"{self.blog.title}-{self.image}"
   
   class Meta:
      verbose_name = "Blog Image"
      verbose_name_plural = f"{verbose_name}s"


class FeaturedBlog(models.Model):
   blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='featured_blog')

   def __str__(self):
      return 'Featured Blog'

   class Meta:
      verbose_name_plural = 'Featured Blog'