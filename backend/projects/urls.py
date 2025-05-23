from django.urls import path

from projects.views import (
   ProjectCategoryListAPIView,
   ProjectListAPIView,
   ProjectDetailAPIView,
)

urlpatterns = [
   path('project/', ProjectListAPIView.as_view(), name='projects'),
   path('project/<slug:slug>/', ProjectDetailAPIView.as_view(), name='project_details'),
   path('categories/', ProjectCategoryListAPIView.as_view(), name='project_categories',)
]
