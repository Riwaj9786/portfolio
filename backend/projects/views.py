from rest_framework.generics import ListAPIView
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.filters import OrderingFilter

from django_filters.rest_framework import DjangoFilterBackend

from projects.models import Project, ProjectCategory
from projects.serializers import ProjectSerializer, ProjectCategorySerializer


class ProjectCategoryViewSet(ReadOnlyModelViewSet):
   queryset = ProjectCategory.objects.prefetch_related('project_category').all()
   serializer_class = ProjectCategorySerializer


class ProjectListAPIView(ListAPIView):
   queryset = Project.objects.select_related('category').all()
   serializer_class = ProjectSerializer
   filter_backends = [DjangoFilterBackend, OrderingFilter]
   filterset_fields = ('category__name', 'skills__name')
   ordering_fields = ('start_date', 'end_date')
   ordering = ('-start_date',)