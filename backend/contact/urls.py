from django.urls import path
from rest_framework.routers import DefaultRouter

from contact.views import MessageCreateAPIView, ContactInformationViewSet

router = DefaultRouter()

router.register(r'information', ContactInformationViewSet, basename='information')

urlpatterns = [
   path('message/create/', MessageCreateAPIView.as_view(), name='message_create'),
]

urlpatterns += router.urls
