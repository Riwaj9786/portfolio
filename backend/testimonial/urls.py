from django.urls import path

from testimonial.views import TestimonialCreateAPIView, TestimonialListAPIView

urlpatterns = [
   path('testimonials/', TestimonialListAPIView.as_view(), name='testimonial_list'),
   path('testimonials/add/', TestimonialCreateAPIView.as_view(), name='add_testimonial'),
]