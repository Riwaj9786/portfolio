from services.models import Service

from backend.utils import delete_file, delete_old_file

from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver


@receiver(pre_save, sender=Service)
def update_service_icon_file(sender, instance, **kwargs):
   delete_old_file(instance, 'icon')


@receiver(post_delete, sender=Service)
def delete_files_on_delete(sender, instance, **kwargs):
   if instance.icon:
      delete_file(instance.icon)