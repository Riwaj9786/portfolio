from backend.utils import delete_old_file, delete_file

from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver

from blogs.models import Blog, BlogImage


@receiver(pre_save, sender=BlogImage)
def delete_old_blog_image(sender, instance, **kwargs):
   """
   Deletes the old blog image file when the blog image is updated.
   """
   if instance.pk:
      try:
         old_image = BlogImage.objects.get(pk=instance.pk).image
         if old_image and old_image != instance.image:
               delete_old_file(instance, "image")
      except BlogImage.DoesNotExist:
         pass


@receiver(post_delete, sender=BlogImage)
def delete_blog_image_file(sender, instance, **kwargs):
   """
   Deletes the blog image file when the blog image is deleted.
   """
   if instance.image:
      delete_file(instance.image)


@receiver(pre_save, sender=Blog)
def delete_old_banner_image(sender, instance, **kwargs):
   """
   Deletes the old blog image file when the blog image is updated.
   """
   if instance.pk:
      try:
         old_image = Blog.objects.get(pk=instance.pk).banner_image
         if old_image and old_image != instance.banner_image:
               delete_old_file(instance, "banner_image")
      except Blog.DoesNotExist:
         pass


@receiver(post_delete, sender=Blog)
def delete_blog_file(sender, instance, **kwargs):
   """
   Deletes the blog image file when the blog image is deleted.
   """
   if instance.banner_image:
      delete_file(instance.banner_image)