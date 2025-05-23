from backend.utils import delete_old_file

from django.db.models.signals import pre_save
from django.dispatch import receiver

from account.models import User


@receiver(pre_save, sender=User)
def delete_old_files_on_update(sender, instance, **kwargs):
   delete_old_file(instance, "profile_pic")
   delete_old_file(instance, "resume")