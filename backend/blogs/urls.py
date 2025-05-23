from django.urls import path
from rest_framework.routers import DefaultRouter

from blogs.views import BlogViewSets, FeaturedBlogViewSet

router = DefaultRouter()
router.register(r'blogs', BlogViewSets, basename='blogs')
router.register(r'featured_blog', FeaturedBlogViewSet, basename='featured-blog')

urlpatterns = router.urls
