from django.db import models

from backend.models import TimeStampedModel
from backend.utils import validate_image_extension, validate_file_size

from skills.models import Skill


class ProjectCategory(TimeStampedModel):
   name = models.CharField(max_length=150)

   def __str__(self):
      return self.name

   class Meta:
      verbose_name = "Project Category"
      verbose_name_plural = "Project Categories"


class Project(TimeStampedModel):
   name = models.CharField(max_length=200)
   skills = models.ManyToManyField(
      Skill,
      related_name='project_skills'
   )
   link = models.URLField()
   client = models.CharField(max_length=250, null=True, blank=True)
   banner_image = models.ImageField(
      upload_to='uploads/projects/',
      null=True, blank=True,
      validators=[validate_file_size, validate_image_extension]
   )

   start_date = models.DateField(null=True, blank=True)
   end_date = models.DateField(null=True, blank=True)

   category = models.ForeignKey(
      ProjectCategory,
      on_delete=models.PROTECT,
      related_name='project_category'
   )

   def __str__(self):
      return self.name

