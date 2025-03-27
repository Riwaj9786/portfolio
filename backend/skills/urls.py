from django.urls import path
from rest_framework import routers

from skills.views import SkillsListAPIView, SkillCategoryViewSet

router = routers.DefaultRouter()

router.register(r'categories', SkillCategoryViewSet, basename='categories')

urlpatterns = [
   path('', SkillsListAPIView.as_view(), name='skills'),
]

urlpatterns += router.urls
