from rest_framework import serializers

from projects.models import (
   Project,
   ProjectCategory,
   ProjectImage,
   ProjectLink
)
from skills.serializers import SkillNameSerializer


class ProjectLinkSerializer(serializers.ModelSerializer):
   class Meta:
      model = ProjectLink
      fields = ('name', 'link')


class ProjectImageSerializer(serializers.ModelSerializer):
   class Meta:
      model = ProjectImage
      fields = ('image', 'caption')


class ProjectCategorySerializer(serializers.ModelSerializer):
   class Meta:
      model = ProjectCategory
      fields = ('name',)


class ProjectSerializer(serializers.ModelSerializer):
   skills = SkillNameSerializer(many=True, read_only=True)

   class Meta:
      model = Project
      fields = (
         'name', 'skills', 'client', 'start_date', 'end_date', 'banner_image', 'slug'
      )

class ProjectDetailSerializer(serializers.ModelSerializer):
   skills = SkillNameSerializer(many=True, read_only=True)
   project_links = ProjectLinkSerializer(many=True, read_only=True)
   project_images = ProjectImageSerializer(many=True, read_only=True)
   category = serializers.CharField(source='category.name', read_only=True)

   class Meta:
      model = Project
      fields = (
         'name', 'skills', 'client', 'start_date', 'end_date',
         'banner_image', 'description', 'distinct_features', 'category',
         'project_links', 'project_images', 'slug'
      )
