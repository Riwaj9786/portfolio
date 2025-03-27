from django.urls import path
from rest_framework import routers
from account.views import (
   UserInformationViewSet,
   MediaLinkViewSet,
   DescriptionViewSet,
   ResumeViewSet
)

router = routers.DefaultRouter()

router.register(r'profile', UserInformationViewSet, basename='information')
router.register(r'media', MediaLinkViewSet, basename='media_links')
router.register(r'description', DescriptionViewSet, basename='description')
router.register(r'resume', ResumeViewSet, basename='resume')

urlpatterns = router.urls