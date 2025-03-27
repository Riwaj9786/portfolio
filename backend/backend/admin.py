from django.contrib import admin

class CustomAdmin(admin.AdminSite):
   def get_app_list(self, request):
      self.css = ['css/custom_admin.css']
      return super().get_app_list(request)

admin.site = CustomAdmin()