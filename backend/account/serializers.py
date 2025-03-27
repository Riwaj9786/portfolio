from rest_framework import serializers

from account.models import User, MediaLinks

class UserSerializer(serializers.ModelSerializer):
   class Meta:
      model = User
      fields = ('name', 'title', 'short_bio', 'profile_pic')


class MediaLinkSerializer(serializers.ModelSerializer):
   class Meta:
      model = MediaLinks
      fields = ('id', 'platform_name', 'link')


class ProfileDescriptionSerializer(serializers.ModelSerializer):
   class Meta:
      model = User
      fields = ('description',)


class ResumeSerializer(serializers.ModelSerializer):
   class Meta:
      model = User
      fields = ('resume',)