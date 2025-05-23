from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

urlpatterns = [
    path('admin/', admin.site.urls),
    path('admin/password_change/', auth_views.PasswordResetView.as_view(), name='admin_password_change'),
    path('admin/password_change/done/', auth_views.PasswordResetDoneView.as_view(), name='password_change_done'),
    path('admin/reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_change_confirm'),
    path('admin/reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_change_complete'),
    
    path('api/', lambda request: JsonResponse({"message": "Welcome to the API root"})),
    
    path('api/v1/information/', include('account.urls')),
    path('api/v1/appointment/', include('appointment.urls')),
    path('api/v1/experience/', include('experience.urls')),
    path('api/v1/skill/', include('skills.urls')),
    path('api/v1/service/', include('services.urls')),
    path('api/v1/projects/', include('projects.urls')),
    path('api/v1/contact/', include('contact.urls')),
    path('api/v1/blogs/', include('blogs.urls')),

    path("ckeditor5/", include('django_ckeditor_5.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)