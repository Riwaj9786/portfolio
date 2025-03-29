from django.db import models

from backend.utils import validate_file_size, validate_image_extension

class Message(models.Model):
   name = models.CharField(max_length=250)
   email = models.EmailField()
   message = models.TextField()
   created_at = models.DateTimeField(auto_now_add=True)

   def __str__(self):
      return f"{self.name}: {self.id}"
   
   class Meta:
      verbose_name = "Message"
      verbose_name_plural = "Messages"


class ContactInformation(models.Model):
   contact_banner = models.ImageField(
      upload_to='uploads/contact_banner/',
      null=True, blank=True,
      validators=[validate_file_size, validate_image_extension]
   )

   whatsapp = models.CharField(max_length=15, null=True, blank=True)
   address = models.CharField(max_length=500, null=True, blank=True)

   def __str__(self):
      return "Information"
   
   class Meta:
      verbose_name = "Information"
      verbose_name_plural = "Informations"