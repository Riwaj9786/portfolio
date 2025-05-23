import os
import string
import random
from urllib.parse import urljoin


from django.core.exceptions import ValidationError
from django.utils.text import slugify
from django.core.files.storage import default_storage, FileSystemStorage
from django.conf import settings


class CustomStorage(FileSystemStorage):
   location = os.path.join(settings.MEDIA_ROOT, "uploads")
   base_url = urljoin(settings.MEDIA_URL, "uploads/")

def validate_pdf(file):
   ext = os.path.splitext(file.name)[1].lower()

   if ext != ".pdf":
      raise ValidationError(
         "Unsupported File Extension. Only .pdf extension is valid"
      )

def validate_image_extension(image):
   valid_extensions = [
      '.jpg', '.png', '.jpeg', '.webp', '.gif'
   ]

   ext = os.path.splitext(image.name)[1].lower()

   if ext not in valid_extensions:
      raise ValidationError(
         f"Unsupported File Extension. Valid extensions are: {", ".join(valid_extensions)}"
      )

def validate_file_size(file):
   max_size = 10*1024*1024

   if file.size > max_size:
      raise ValidationError('File size exceeds 10MB size limit.')


def validate_icon_size(file):
   max_size = 5*1024*1024

   if file.size > max_size:
      raise ValidationError('File size exceeds 5MB size limit.')
   

def validate_icon_extension(image):
   valid_extensions = [
      '.png', '.gif', '.webp'
   ]

   ext = os.path.splitext(image.name)[1].lower()

   if ext not in valid_extensions:
      raise ValidationError(
         f'Unsupported File Extension. Valid extensions are: {", ".join(valid_extensions)}'
      )


def generate_unique_slug(text):
   slug = slugify(text)[:40]
   random_chars = ''.join(random.choices(string.ascii_letters + string.digits, k=5))
   unique_slug = f"{slug}-{random_chars}"
   
   return unique_slug


def delete_old_file(instance, field_name):
   if instance.pk:
      model_class = instance.__class__
      try:
         old_instance = model_class.objects.get(pk=instance.pk)
      except model_class.DoesNotExist:
         return
      
      old_file = getattr(old_instance, field_name)
      new_file = getattr(instance, field_name)

      if old_file and old_file.name and old_file.name != new_file.name:
         if default_storage.exists(old_file.name):
               default_storage.delete(old_file.name)


def delete_file(file_field):
   if file_field and file_field.name:
      if default_storage.exists(file_field.name):
         default_storage.delete(file_field.name)