from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from testimonial.models import TestimonialRequest

@shared_task
def send_testimonial_form_request(email, name, testimonial_url):
   subject = "Thank You for Believing in Me!"
   from_email = settings.EMAIL_HOST_USER
   recipient_list = [email]

   # Plain text fallback
   text_content = f"""
      Dear {name},

      It was great working with you recently and I hope you had a similar experience.

      I would truly appreciate it if you could take a moment to share your thoughts about our time working together.
      Your feedback helps me grow and motivates me to work more efficiently.

      Please fill out the testimonial here: {testimonial_url}

      Thank you!

      Best Regards,  
      Er. Riwaj Bhurtel
      """

   # HTML content
   html_content = f"""
      <html>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
         <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
         <tr>
            <td style="padding: 30px;">
               <h2 style="color: #2c3e50; font-size: 24px; margin-bottom: 10px;">Hello {name},</h2>
               <p style="color: #555; font-size: 16px; line-height: 1.6;">
               I hope you had a great experience working with me. I would truly appreciate your feedback — it helps me grow and stay motivated.
               </p>
               <p style="text-align: center; margin: 30px 0;">
               <a href="{testimonial_url}" style="background-color: #007BFF; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Share Your Testimonial
               </a>
               </p>
               <p style="color: #555; font-size: 16px; line-height: 1.6;">
               Thank you once again for the opportunity. Looking forward to staying in touch!
               </p>
               <p style="margin-top: 40px; color: #333;">
               Best regards,<br>
               <strong>Er. Riwaj Bhurtel</strong>
               </p>
            </td>
         </tr>
         </table>
      </body>
      </html>
      """

   msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
   msg.attach_alternative(html_content, "text/html")
   msg.send()
