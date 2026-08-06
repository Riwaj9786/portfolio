from django.apps import AppConfig


class AccountConfig(AppConfig):
   default_auto_field = 'django.db.models.BigAutoField'
   name = 'account'

   def ready(self):
      import account.signals
      # Present Django's permission management as a concise Settings section
      # in the admin navigation. This changes only the display label.
      from django.apps import apps
      apps.get_app_config('auth').verbose_name = 'Settings'
