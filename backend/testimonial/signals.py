import base64

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from testimonial.models import TestimonialRequest
from testimonial.tasks import send_testimonial_form_request

@receiver(post_save, sender=TestimonialRequest)
def send_testimonial_request(sender, instance, **kwargs):
   if instance.email and instance.name:
      base_url = f"{settings.FRONTEND_URL}/testimonial/form/"

      data = f"{instance.name}|{instance.email}"
      encoded_data = base64.urlsafe_b64encode(data.encode()).decode()

      testimonial_url = f"{base_url}?ref={encoded_data}"

      send_testimonial_form_request.delay(
         email=instance.email,
         name=instance.name,
         testimonial_url=testimonial_url
      )