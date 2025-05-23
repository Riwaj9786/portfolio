from backend.utils import delete_file, delete_old_file

from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver

from projects.models import ProjectImage, Project

@receiver(pre_save, sender=Project)
def update_image_on_projects(sender, instance, **kwargs):
   delete_old_file(instance, 'banner_image')

@receiver(pre_save, sender=ProjectImage)
def update_project_images(sender, instance, **kwargs):
   delete_old_file(instance, 'image')

@receiver(post_delete, sender=ProjectImage)
def delete_project_images_on_delete(sender, instance, **kwargs):
   delete_file(instance.image)