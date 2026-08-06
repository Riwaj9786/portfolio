from django.db import models
from django.core.exceptions import ValidationError

from backend.models import TimeStampedModel
from backend.utils import validate_file_size, validate_image_extension

class TestimonialRequest(TimeStampedModel):
   name = models.CharField(max_length=255)
   email = models.EmailField(unique=True)

   def __str__(self):
      return self.name

   class Meta:
      verbose_name = "Testimonial Request"
      verbose_name_plural = f"Requests"


class Testimonial(TimeStampedModel):
   name = models.CharField(max_length=255)
   email = models.EmailField(unique=True)
   image = models.ImageField(
      upload_to='uploads/testimonials/image/',
      null=True, blank=True,
      validators=(validate_image_extension, validate_file_size)
   )
   company = models.CharField(max_length=1000)
   position = models.CharField(max_length=550)
   testimonial = models.TextField()
   to_publish = models.BooleanField(default=False)

   order = models.PositiveIntegerField(default=0, null=False, blank=False, db_index=True)

   published = models.BooleanField(default=False)
   created_at = models.DateTimeField(auto_now_add=True)

   def __str__(self):
      return f"{self.name}: {self.company}"

   def clean(self, *args, **kwargs):
      if not self.to_publish and self.published:
         raise ValidationError("You don't have consent to publish the testimonial. Consider this only as a message to you!")
      # super().clean(*args, **kwargs)

   class Meta:
      verbose_name = "Testimonial"
      verbose_name_plural = f"{verbose_name}s"
      ordering = ('order',)