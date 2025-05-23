from django.db import models

from backend.models import TimeStampedModel
from skills.models import Skill

class Experience(TimeStampedModel):
   JOB_TYPE_CHOICES = (
      ('Onsite', "ONSITE"),
      ('Remote', "REMOTE"),
      ('Hybrid', "HYBRID"),
   )

   title = models.CharField(max_length=350)

   company = models.CharField(max_length=1000)
   company_url = models.URLField(null=True, blank=True)

   start_date = models.DateField()
   end_date = models.DateField(null=True, blank=True)

   job_type = models.CharField(max_length=15, choices=JOB_TYPE_CHOICES)

   skills = models.ManyToManyField(Skill, related_name='job_skills')

   to_display = models.BooleanField(default=True)


   def __str__(self):
      return f"{self.title}: {self.company}"

   class Meta:
      verbose_name = "Experience"
      verbose_name_plural = f"{verbose_name}s"
