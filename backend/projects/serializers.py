from rest_framework import serializers

from projects.models import Project, ProjectCategory
from skills.serializers import SkillNameSerializer


class ProjectSerializer(serializers.ModelSerializer):
   skills = SkillNameSerializer(many=True, read_only=True)

   class Meta:
      model = Project
      fields = ('name', 'skills', 'client', 'start_date', 'end_date', 'link', 'banner_image')


class ProjectCategorySerializer(serializers.ModelSerializer):
   class Meta:
      model = ProjectCategory
      fields = ('name',)