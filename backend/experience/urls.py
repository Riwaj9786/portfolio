from django.urls import path
from rest_framework import routers

from experience.views import ExperienceViewSet

router = routers.DefaultRouter()

router.register(r'experiences', ExperienceViewSet, basename='experience')

urlpatterns = router.urls