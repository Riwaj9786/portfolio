from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

from backend.models import TimeStampedModel
from backend.utils import validate_icon_size, validate_image_extension


class SkillCategory(TimeStampedModel):
   name = models.CharField(max_length=200)
   
   def __str__(self):
      return self.name
   
   class Meta:
      verbose_name_plural = "Skill Categories"
      ordering = ('name',)


class Skill(TimeStampedModel):
   name = models.CharField(max_length=150)
   level = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(10.0)])
   logo = models.ImageField(upload_to='uploads/icons/skills/', validators=[validate_icon_size, validate_image_extension])
   category = models.ForeignKey(SkillCategory, on_delete=models.PROTECT, related_name='skills')

   def __str__(self):
      return self.name