from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.filters import OrderingFilter

from django_filters.rest_framework import DjangoFilterBackend

from projects.models import Project, ProjectCategory
from projects.serializers import (
   ProjectSerializer,
   ProjectCategorySerializer,
   ProjectDetailSerializer,
)


class ProjectCategoryListAPIView(ListAPIView):
   queryset = ProjectCategory.objects.prefetch_related('project_categories').all()
   serializer_class = ProjectCategorySerializer


class ProjectListAPIView(ListAPIView):
   serializer_class = ProjectSerializer
   filter_backends = [DjangoFilterBackend, OrderingFilter]
   filterset_fields = ('category__name', 'skills__name')
   ordering_fields = ('start_date', 'end_date')
   ordering = ('-start_date',)

   def get_queryset(self):
      return Project.objects.select_related('category').prefetch_related('project_images', 'project_links').filter(is_archive=False)


class ProjectDetailAPIView(RetrieveAPIView):
   queryset = Project.objects.select_related('category').prefetch_related(
      'project_links', 'project_images'
   )
   serializer_class = ProjectDetailSerializer
   lookup_field = 'slug'