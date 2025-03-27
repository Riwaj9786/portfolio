from rest_framework import serializers

from skills.models import SkillCategory, Skill


class SkillNameSerializer(serializers.ModelSerializer):
   class Meta:
      model = Skill
      fields = ('name',)


class SkillSerializer(serializers.ModelSerializer):
   class Meta:
      model = Skill
      fields = ('name', 'level', 'logo',)


class SkillCategorySerializer(serializers.ModelSerializer):
   class Meta:
      model = SkillCategory
      fields = ('name',)