import os
from django.core.exceptions import ValidationError


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