from rest_framework import serializers

from testimonial.models import Testimonial

class TestimonialSerializer(serializers.ModelSerializer):
   class Meta:
      model = Testimonial
      fields = (
         'name', 'email', 'image', 'company', 'position',
         'testimonial', 'to_publish'
      )
      extra_kwargs = {
         'name': {'required': False},
         'email': {'required': False},
      }
      ordering = ('order',)