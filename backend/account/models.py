from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

from backend.models import TimeStampedModel
from backend.utils import validate_file_size, validate_image_extension, validate_pdf

from account.managers import UserManager

from django_ckeditor_5.fields import CKEditor5Field


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
   email = models.EmailField(unique=True)

   name = models.CharField(max_length=150)
   title = models.CharField(max_length=800)

   short_bio = models.TextField(null=True, blank=True)
   description = CKEditor5Field('Text', config_name='extends', null=True, blank=True)

   profile_pic = models.ImageField(upload_to='uploads/profile_pic/', null=True, blank=True, validators=[validate_image_extension, validate_file_size])
   resume = models.FileField(upload_to='uploads/resume/', null=True, blank=True, validators=[validate_file_size, validate_pdf])

   is_active = models.BooleanField(default=True)
   is_staff = models.BooleanField(default=True)
   is_superuser = models.BooleanField(default=True)

   USERNAME_FIELD = 'email'
   REQUIRED_FIELDS = ['name']

   objects = UserManager()

   class Meta:
      verbose_name = "User"
      verbose_name_plural = verbose_name

   def save(self, *args, **kwargs):
      super().save(*args, **kwargs) 


   def __str__(self):
      return f'{self.email}'


   def has_perm(self, perm, obj=None):
      """Check if the user has a specific permission."""
      return True


   def has_module_perms(self, app_label):
      """Check if the user has permissions to access the specified app."""
      return True



class MediaLinks(TimeStampedModel):
   PLATFORM_CHOICE = [
      ('fb', "Facebook"),
      ('ig', "Instagram"),
      ('be', "Behance"),
      ('lkin', "LinkedIn"),
      ('x', "X"),
      ('gh', "Github")
   ]

   platform_name = models.CharField(max_length=12, unique=True, choices=PLATFORM_CHOICE)
   link = models.URLField()

   def __str__(self):
      return self.platform_name
   
   class Meta:
      verbose_name = "Media Link"
      verbose_name_plural = f"{verbose_name}s"