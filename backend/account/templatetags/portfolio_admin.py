from django import template

from blogs.models import Blog
from contact.models import Message
from experience.models import Experience
from projects.models import Project, ProjectCategory
from skills.models import Skill
from testimonial.models import Testimonial

register = template.Library()


@register.simple_tag
def portfolio_dashboard():
    return {
        "projects": Project.objects.count(),
        "active_projects": Project.objects.filter(is_archive=False).count(),
        "archived_projects": Project.objects.filter(is_archive=True).count(),
        "project_categories": ProjectCategory.objects.count(),
        "blogs": Blog.objects.count(),
        "published_blogs": Blog.objects.filter(is_draft=False).count(),
        "draft_blogs": Blog.objects.filter(is_draft=True).count(),
        "experiences": Experience.objects.filter(to_display=True).count(),
        "skills": Skill.objects.count(),
        "testimonials": Testimonial.objects.filter(to_publish=True).count(),
        "messages": Message.objects.count(),
        "recent_messages": Message.objects.order_by("-created_at")[:5],
        "recent_projects": Project.objects.order_by("-updated_at")[:5],
    }
