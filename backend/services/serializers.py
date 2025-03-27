from rest_framework import serializers

from services.models import Service

class ServiceSerializer(serializers.ModelSerializer):
   class Meta:
      model = Service
      fields = ('title', 'icon', 'description')