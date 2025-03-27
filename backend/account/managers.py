from django.contrib.auth.models import BaseUserManager

class UserManager(BaseUserManager):
   def _create_user(self, email, password=None, **extra_fields):
      if not email:
         raise ValueError("Email must be set!")
      
      if not password:
         raise ValueError("Password must be set!")
      
      email = self.normalize_email(email)
      user = self.model(email=email, **extra_fields)

      if password:
         user.set_password(password)

      user.save(using=self.db)
      return user
   
   
   def create_superuser(self, email, password=None, **extra_fields):
      extra_fields.setdefault('is_staff', True)
      extra_fields.setdefault('is_active', True)
      extra_fields.setdefault('is_superuser', True)

      if extra_fields.get('is_staff') is not True:
         raise ValueError('SuperUser must have is_staff set to True!')
      
      if extra_fields.get('is_active') is not True:
         raise ValueError('SuperUser must have is_active set to True!')
      
      if extra_fields.get('is_staff') is not True:
         raise ValueError('SuperUser must have is_superuser set to True!')
      
      return self._create_user(email, password, **extra_fields)