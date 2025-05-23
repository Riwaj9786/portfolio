from django.db import models

from backend.models import TimeStampedModel
from backend.utils import (
   validate_image_extension,
   validate_file_size,
   generate_unique_slug,
)

from skills.models import Skill

from django_ckeditor_5.fields import CKEditor5Field


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
   client = models.CharField(max_length=250, null=True, blank=True)
   banner_image = models.ImageField(
      upload_to='uploads/projects/banner_images/',
      null=True, blank=True,
      validators=[validate_file_size, validate_image_extension]
   )

   is_archive = models.BooleanField(default=False)

   start_date = models.DateField(null=True, blank=True)
   end_date = models.DateField(null=True, blank=True)

   description = CKEditor5Field('Description', config_name='extends', null=True, blank=True)
   distinct_features = CKEditor5Field('Distinct Features', config_name='extends', null=True, blank=True)

   category = models.ForeignKey(
      ProjectCategory,
      on_delete=models.PROTECT,
      related_name='project_categories'
   )

   slug = models.SlugField(unique=True, null=True)

   def __str__(self):
      return self.name

   def save(self, *args, **kwargs):
      if not self.slug:
         self.slug = generate_unique_slug(self.name)
      super().save(*args, **kwargs)


class ProjectLink(TimeStampedModel):
   project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='project_links')
   name = models.CharField(max_length=115)
   link = models.URLField()

   def __str__(self):
      return f"{self.project.name}: {self.name}"


class ProjectImage(TimeStampedModel):
   project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='project_images')
   image = models.ImageField(
      upload_to='uploads/projects/',
      null=True, blank=True,
      validators=[validate_file_size, validate_image_extension]
   )
   caption = models.CharField(max_length=500, null=True, blank=True)

   def __str__(self):
      return f"{self.project.name}: {self.image}"