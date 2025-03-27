from django.urls import path
from rest_framework import routers

from projects.views import ProjectCategoryViewSet, ProjectListAPIView

router = routers.DefaultRouter()
router.register(r'categories', ProjectCategoryViewSet, basename='categories')

urlpatterns = [
   path('', ProjectListAPIView.as_view(), name='projects'),
]

urlpatterns += router.urls