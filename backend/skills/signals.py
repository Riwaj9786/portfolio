from backend.utils import delete_file, delete_old_file

from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver

from skills.models import Skill

@receiver(pre_save, sender=Skill)
def update_skill_images(sender, instance, **kwargs):
   delete_old_file(instance, 'logo')

@receiver(post_delete, sender=Skill)
def delete_logo_after_delete(sender, instance, **kwargs):
   delete_file(instance.logo)