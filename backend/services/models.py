from django.db import models

from backend.models import TimeStampedModel
from backend.utils import validate_icon_size, validate_icon_extension

class Service(TimeStampedModel):
   title = models.CharField(max_length=200)
   icon = models.ImageField(upload_to='uploads/icons/services/', validators=[validate_icon_extension, validate_icon_size])
   description = models.TextField(null=True, blank=True)

   def __str__(self):
      return self.title

   class Meta:
      verbose_name = "Service"
      verbose_name_plural = f"{verbose_name}s" 