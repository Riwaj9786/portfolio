from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ReadOnlyModelViewSet

from contact.models import Message, ContactInformation
from contact.serializers import MessageSerializer, ContactInformationSerializer


class MessageCreateAPIView(CreateAPIView):
   permission_classes = (AllowAny,)
   serializer_class = MessageSerializer


class ContactInformationViewSet(ReadOnlyModelViewSet):
   queryset = ContactInformation.objects.all()
   serializer_class = ContactInformationSerializer