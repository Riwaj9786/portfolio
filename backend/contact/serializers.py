from rest_framework import serializers

from contact.models import Message, ContactInformation

class MessageSerializer(serializers.ModelSerializer):
   class Meta:
      model = Message
      fields = ('name', 'email', 'message')


class ContactInformationSerializer(serializers.ModelSerializer):
   class Meta:
      model = ContactInformation
      fields = ('contact_banner', 'whatsapp', 'address')