from rest_framework.viewsets import ReadOnlyModelViewSet

from account.models import User, MediaLinks
from account.serializers import (
   UserSerializer,
   MediaLinkSerializer,
   ProfileDescriptionSerializer,
   ResumeSerializer
)

class UserInformationViewSet(ReadOnlyModelViewSet):
   queryset = User.objects.all()
   serializer_class = UserSerializer


class MediaLinkViewSet(ReadOnlyModelViewSet):
   queryset = MediaLinks.objects.all()
   serializer_class = MediaLinkSerializer


class DescriptionViewSet(ReadOnlyModelViewSet):
   queryset = User.objects.all()
   serializer_class = ProfileDescriptionSerializer

class ResumeViewSet(ReadOnlyModelViewSet):
   queryset = User.objects.all()
   serializer_class = ResumeSerializer