from django.urls import path
from rest_framework.routers import DefaultRouter

from blogs.views import BlogListView, BlogDetailView, FeaturedBlogViewSet

router = DefaultRouter()
router.register(r'featured_blog', FeaturedBlogViewSet, basename='featured-blog')

urlpatterns = [
   path('blogs/', BlogListView.as_view(), name='blog-list'),
   path('blogs/<slug:slug>/', BlogDetailView.as_view(), name='blog-detail'),
]

urlpatterns += router.urls