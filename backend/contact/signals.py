from backend.utils import delete_file, delete_old_file

from contact.models import ContactInformation

from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver


@receiver(pre_save, sender=ContactInformation)
def update_contact_banner(sender, instance, **kwargs):
   delete_old_file(instance, 'contact_banner')