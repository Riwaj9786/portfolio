from django.db import models

class TimeStampedModel(models.Model):
   updated_at = models.DateTimeField(auto_now=True)

   class Meta:
      abstract = True