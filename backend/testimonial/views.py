import base64

# from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from testimonial.models import Testimonial, TestimonialRequest
from testimonial.serializers import TestimonialSerializer

class TestimonialCreateAPIView(GenericAPIView):
   serializer_class = TestimonialSerializer

   def get_queryset(self):
      return Testimonial.objects.all()

   def decode_ref(self, request, *args, **kwargs):
      encoded_data = request.query_params.get('ref', '')
      name, email = '', ''

      try:
         decoded = base64.urlsafe_b64decode(encoded_data).decode()
         name, email = decoded.split('|', 1)
      except Exception:
         pass
      return name.strip(), email.strip()


   def get(self, request, *args, **kwargs):
      name, email = self.decode_ref(request)

      return Response({
         "name": name,
         "email": email
      })

   def post(self, request, *args, **kwargs):
      name_ref, email_ref = self.decode_ref(request)

      if name_ref and email_ref:
         data = request.data.copy()
         data['name'] = name_ref
         data['email'] = email_ref
      else:
         data = request.data.copy()
         if not data.get('name') or not data.get('email'):
            return Response({
               "detail": "Name and Email are required, either from the referral URL or the form."
            }, status=400)

      serializer = self.get_serializer(data=data)
      if serializer.is_valid():
         serializer.save()
         return Response(serializer.data, status=201)
      return Response(serializer.errors, status=400)


class TestimonialListAPIView(GenericAPIView):
   serializer_class = TestimonialSerializer
   permission_classes = (AllowAny,)

   def get_queryset(self, *args, **kwargs):
      return Testimonial.objects.filter(to_publish=True, published=True)

   def get(self, request, *args, **kwargs):
      try:
         testimonials = self.get_queryset()
      except Testimonial.DoesNotExist:
         return Response(
            {'message': 'No Active testimonials'},
            status=404
         )

      serializer = self.serializer_class(testimonials, many=True, context={'request': request})
      return Response(
         serializer.data,
         status=200
      )
