from rest_framework import serializers

from experience.models import Experience
from skills.models import Skill
from skills.serializers import SkillNameSerializer

class ExperienceSerializer(serializers.ModelSerializer):
   skills = SkillNameSerializer(read_only=True, many=True)
   
   class Meta:
      model = Experience
      fields = ('id', 'title', 'company', 'company_url',
               'start_date', 'end_date',
               'job_type', 'skills')