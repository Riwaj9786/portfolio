from rest_framework.generics import ListAPIView
from rest_framework.viewsets import ReadOnlyModelViewSet
from django_filters.rest_framework import DjangoFilterBackend

from skills.models import Skill, SkillCategory
from skills.serializers import SkillSerializer, SkillCategorySerializer


class SkillsListAPIView(ListAPIView):
   queryset = Skill.objects.select_related('category').all()
   serializer_class = SkillSerializer
   filter_backends = [DjangoFilterBackend]
   filterset_fields = ('category__name',)


class SkillCategoryViewSet(ReadOnlyModelViewSet):
   queryset = SkillCategory.objects.prefetch_related('skills').all()
   serializer_class = SkillCategorySerializer