# Frontend database and content reference

Generated on 2026-10-17 from the backend models, serializers, routes, and `data.json`.
This is a snapshot of the local fixture, not a query against the live PostgreSQL database.
Backend runtime settings have not been changed. The frontend now reads the public
snapshot below at build time through its Vite content plugin.

## Deployment scope

The frontend reads the public snapshot in this file at build time through Vite.
All portfolio details, filters, and detail pages use bundled local data; no Django,
PostgreSQL, or API URL is required. Rebuild after editing the snapshot.

Images resolve locally under `/uploads/` and live in `frontend/public/uploads/`.
The original photos and project screenshots are not included. The resume PDF is
not generated; supply the real file and update `resume` before publishing its link.

Contact and testimonial forms display an unavailable notice and do not submit.
Live weather requests are removed; theme and time controls still work locally.
No backend environment variables are used by the frontend.

## Historical backend API contract

These routes document the original backend only; the frontend does not request them.
All paths below are relative to `/api/v1/`. GET list responses are JSON arrays under the
current settings (no global pagination configured). Detail responses are objects. Router
viewsets also provide GET detail routes using `/{pk}/` after the list path.

| Method | Path | Response fields / request fields |
| --- | --- | --- |
| GET | `information/profile/` | `name`, `title`, `short_bio`, `profile_pic` |
| GET | `information/description/` | `description` |
| GET | `information/resume/` | `resume` |
| GET | `information/media/` | `id`, `platform_name`, `link` |
| GET | `experience/experiences/` | `id`, `title`, `company`, `company_url`, `start_date`, `end_date`, `job_type`, `skills: [{name}]`, `category`, `description`, `logo`, `achievements`, `date_precision`; filter: `category` |
| GET | `skill/` | `name`, `level`, `logo`; filter: `category__name` |
| GET | `skill/categories/` | `name` |
| GET | `service/services/` | `title`, `icon`, `description` |
| GET | `projects/categories/` | `name` |
| GET | `projects/project/` | `name`, `skills: [{name}]`, `client`, `start_date`, `end_date`, `banner_image`, `slug` |
| GET | `projects/project/{slug}/` | List fields plus `description`, `distinct_features`, `category` (name), `project_links: [{name, link}]`, `project_images: [{image, caption}]` |
| GET | `blogs/blogs/` | `title`, `content`, `slug`, `banner_image`, `published_at`; search: `search` |
| GET | `blogs/blogs/{slug}/` | List fields plus `blog_images: [{image, caption}]` |
| GET | `blogs/featured_blog/` | `blog` containing the blog list fields |
| GET | `contact/information/` | `contact_banner`, `whatsapp`, `address` |
| POST | `contact/message/create/` | Required: `name`, `email`, `message` |
| GET | `testimonial/testimonials/` | `name`, `email`, `image`, `company`, `position`, `testimonial`, `to_publish` |
| GET | `testimonial/testimonials/add/?ref=...` | Decoded `name`, `email`; ref is URL-safe base64 of `name|email` |
| POST | `testimonial/testimonials/add/` | `name`, `email` (or matching referral), `company`, `position`, `testimonial`; optional `image`, `to_publish` |

Project list filters: `category__name`, `skills__name`; ordering: `start_date`, `end_date`
(prefix with `-` for descending). Experience defaults to descending start/end dates.
Blog lists exclude drafts and featured blogs; blog detail excludes drafts. The featured
endpoint currently does not filter drafts. Project lists exclude archives, but project
detail does not. Experiences require `to_display=True`. Testimonials require both
`to_publish=True` and `published=True`. Services and testimonials sort by `order`.
The static snapshot below applies public visibility checks, including to featured blogs.

Dates are `YYYY-MM-DD`; timestamps use ISO 8601. Nullable fields may be `null`.
Skills have levels from 0 to 10. Job types are `Onsite`, `Remote`, `Hybrid`.
Social platform codes are `fb`, `ig`, `be`, `lkin`, `x`, `gh`.
Descriptions, blog content, and project features are stored as HTML, not Markdown.
The existing testimonial API includes email; this document deliberately excludes testimonial
email from the public snapshot.

## Database model inventory

Tables use Django's default `<app>_<model>` naming. All concrete models have an implicit
`id` primary key. Models inheriting `TimeStampedModel` also have `updated_at`.
The field definitions below describe storage, not necessarily the frontend API response.
No stored private values appear in this inventory.

### `account.User`

Also inherits Django authentication fields (`password`, `last_login`, `is_superuser`, `groups`, `user_permissions`). These are backend-only.

```python
email = models.EmailField(unique=True)
name = models.CharField(max_length=150)
title = models.CharField(max_length=800)
short_bio = models.TextField(null=True, blank=True)
description = CKEditor5Field('Text', config_name='extends', null=True, blank=True)
profile_pic = models.ImageField(upload_to='uploads/profile_pic/', null=True, blank=True, validators=[validate_image_extension, validate_file_size])
resume = models.FileField(upload_to='uploads/resume/', null=True, blank=True, validators=[validate_file_size, validate_pdf])
is_active = models.BooleanField(default=True)
is_staff = models.BooleanField(default=True)
is_superuser = models.BooleanField(default=True)
```

### `account.MediaLinks`

```python
platform_name = models.CharField(max_length=12, unique=True, choices=PLATFORM_CHOICE)
link = models.URLField()
```

### `skills.SkillCategory`

```python
name = models.CharField(max_length=200)
```

### `skills.Skill`

```python
name = models.CharField(max_length=150)
level = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(10.0)])
logo = models.ImageField(upload_to='uploads/icons/skills/', validators=[validate_icon_size, validate_image_extension])
category = models.ForeignKey(SkillCategory, on_delete=models.PROTECT, related_name='skills')
```

### `services.Service`

```python
title = models.CharField(max_length=200)
icon = models.ImageField(upload_to='uploads/icons/services/', validators=[validate_icon_extension, validate_icon_size])
description = models.TextField(null=True, blank=True)
order = models.PositiveIntegerField(default=0, null=False, blank=False)
```

### `experience.Experience`

Supports `category` (`professional` by default or `leadership`), optional plain-text
`description`, image `logo`, string-list `achievements`, and `date_precision`
(`month` by default or `year`). Both categories share the same model and cards.
Job type and skills may be blank. Existing records remain professional.
Admin edits can be exported with `python manage.py export_experiences`, followed
by a frontend rebuild. Year-only roles store boundary dates but display only years.

```python
title = models.CharField(max_length=350)
company = models.CharField(max_length=1000)
company_url = models.URLField(null=True, blank=True)
start_date = models.DateField()
end_date = models.DateField(null=True, blank=True)
job_type = models.CharField(max_length=15, choices=JOB_TYPE_CHOICES)
skills = models.ManyToManyField(Skill, related_name='job_skills')
to_display = models.BooleanField(default=True)
```

### `projects.ProjectCategory`

```python
name = models.CharField(max_length=150)
```

### `projects.Project`

```python
name = models.CharField(max_length=200)
skills = models.ManyToManyField(
      Skill,
      related_name='project_skills'
   )
client = models.CharField(max_length=250, null=True, blank=True)
banner_image = models.ImageField(
      upload_to='uploads/projects/banner_images/',
      null=True, blank=True,
      validators=[validate_file_size, validate_image_extension]
   )
is_archive = models.BooleanField(default=False)
start_date = models.DateField(null=True, blank=True)
end_date = models.DateField(null=True, blank=True)
description = CKEditor5Field('Description', config_name='extends', null=True, blank=True)
distinct_features = CKEditor5Field('Distinct Features', config_name='extends', null=True, blank=True)
category = models.ForeignKey(
      ProjectCategory,
      on_delete=models.PROTECT,
      related_name='project_categories'
   )
slug = models.SlugField(unique=True, null=True)
```

### `projects.ProjectLink`

```python
project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='project_links')
name = models.CharField(max_length=115)
link = models.URLField()
```

### `projects.ProjectImage`

```python
project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='project_images')
image = models.ImageField(
      upload_to='uploads/projects/',
      null=True, blank=True,
      validators=[validate_file_size, validate_image_extension]
   )
caption = models.CharField(max_length=500, null=True, blank=True)
```

### `blogs.Blog`

```python
title = models.CharField(max_length=500)
content = CKEditor5Field('Text')
slug = models.SlugField(unique=True, blank=True)
banner_image = models.ImageField(upload_to='blog/banner_image/', validators=[validate_icon_size, validate_image_extension])
published_at = models.DateTimeField()
is_draft = models.BooleanField(default=True)
```

### `blogs.BlogImage`

```python
blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='blog_images')
image = models.ImageField(upload_to='blog/images/', validators=[validate_image_extension, validate_icon_size])
caption = models.CharField(max_length=255, blank=True, null=True)
```

### `blogs.FeaturedBlog`

```python
blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='featured_blog')
```

### `contact.Message`

```python
name = models.CharField(max_length=250)
email = models.EmailField()
message = models.TextField()
created_at = models.DateTimeField(auto_now_add=True)
```

### `contact.ContactInformation`

```python
contact_banner = models.ImageField(
      upload_to='uploads/contact_banner/',
      null=True, blank=True,
      validators=[validate_file_size, validate_image_extension]
   )
whatsapp = models.CharField(max_length=15, null=True, blank=True)
address = models.CharField(max_length=500, null=True, blank=True)
```

### `testimonial.TestimonialRequest`

```python
name = models.CharField(max_length=255)
email = models.EmailField(unique=True)
```

### `testimonial.Testimonial`

```python
name = models.CharField(max_length=255)
email = models.EmailField(unique=True)
image = models.ImageField(
      upload_to='uploads/testimonials/image/',
      null=True, blank=True,
      validators=(validate_image_extension, validate_file_size)
   )
company = models.CharField(max_length=1000)
position = models.CharField(max_length=550)
testimonial = models.TextField()
to_publish = models.BooleanField(default=False)
order = models.PositiveIntegerField(default=0, null=False, blank=False, db_index=True)
published = models.BooleanField(default=False)
created_at = models.DateTimeField(auto_now_add=True)
```

Django also maintains authentication permissions/groups, content types, sessions, admin
logs, migration history, and implicit many-to-many join tables (user groups/permissions,
project skills, experience skills). These are backend infrastructure, not frontend content.
Private messages and testimonial requests are recorded in the model inventory only.

## Public content snapshot

The following JSON blocks contain actual public content from `data.json`. Every section
is an array, including empty sections. IDs are retained so foreign keys and skill ID
arrays can be resolved across sections. Unlike API responses, related records are not
nested here. Media values retain fixture-relative storage paths; resolve these against
the media location when integrating later. Both normal and featured published blogs are
included in `blogs.blog`; use `blogs.featuredblog` to identify featured ones.

Passwords, account email/permissions, sessions, admin logs, contact messages, testimonial
requests, testimonial email, hidden experiences, archived projects, drafts, and unpublished
or non-consenting testimonials are omitted. This is not a complete database backup and
cannot replace a Django fixture for restoration.

### `account.user` (1 records)

```json
[
  {
    "id": 1,
    "name": "Er. Riwaj Bhurtel",
    "title": "Computer Engineer | Full Stack Developer | Graphics Designer",
    "short_bio": "Full-Stack & Backend Developer (Django, DRF, React & Vue) | Graphic Designer with 4+ years of experience. Passionate about building scalable applications, exploring AI-powered solutions, and crafting impactful digital experiences.",
    "description": "<p>I am a <strong>Computer Engineer</strong> and <strong>Full Stack Developer</strong> specializing in <strong>Django</strong> and <strong>Vue.js</strong>, with a strong focus on building scalable, efficient, and intuitive web applications. With over <strong>four years of experience in Graphic Design</strong>, I also bring a creative edge to my work, crafting visually engaging brand identities and digital assets that elevate user experiences.</p><p>&nbsp;</p><p>In addition to my technical and design capabilities, I have a proven track record of <strong>leadership</strong> and <strong>community involvement</strong>. I am passionate about leveraging the power of technology and design to develop impactful, user-centric solutions that address real-world challenges. By bridging the gap between functionality and aesthetics, I strive to create digital experiences that are not only effective but meaningful.</p>",
    "profile_pic": "uploads/account/user/Riwaj_profile_pic-700x700.jpg",
    "resume": "uploads/resume/Resume.pdf"
  }
]
```

### `account.medialinks` (6 records)

```json
[
  {
    "id": 1,
    "platform_name": "fb",
    "link": "https://www.facebook.com/riwaj.bhurtel/"
  },
  {
    "id": 2,
    "platform_name": "ig",
    "link": "https://www.instagram.com/guns_n_mercury/"
  },
  {
    "id": 3,
    "platform_name": "be",
    "link": "https://www.behance.net/riwajbhurtel"
  },
  {
    "id": 4,
    "platform_name": "lkin",
    "link": "https://www.linkedin.com/in/riwaj-bhurtel/"
  },
  {
    "id": 5,
    "platform_name": "gh",
    "link": "https://github.com/Riwaj9786"
  },
  {
    "id": 6,
    "platform_name": "x",
    "link": "https://x.com/Riwaj9786"
  }
]
```

### `skills.skillcategory` (6 records)

```json
[
  {
    "id": 1,
    "name": "Software Development"
  },
  {
    "id": 2,
    "name": "Databases & Storage"
  },
  {
    "id": 3,
    "name": "Cloud & DevOps"
  },
  {
    "id": 4,
    "name": "Data Science & AI"
  },
  {
    "id": 5,
    "name": "Design & Creative"
  },
  {
    "id": 6,
    "name": "Project Management"
  }
]
```

### `skills.skill` (53 records)

```json
[
  {
    "id": 1,
    "name": "Python",
    "level": 8,
    "logo": "uploads/skills/skill/python-256a6baa.svg",
    "category": 1
  },
  {
    "id": 2,
    "name": "Django",
    "level": 8,
    "logo": "uploads/skills/skill/django-32f8343b.svg",
    "category": 1
  },
  {
    "id": 3,
    "name": "Django Channels",
    "level": 6,
    "logo": "uploads/skills/skill/django-channels-b4db76f2.svg",
    "category": 1
  },
  {
    "id": 4,
    "name": "Celery",
    "level": 8,
    "logo": "uploads/skills/skill/celery-92139afd.svg",
    "category": 1
  },
  {
    "id": 5,
    "name": "HTML 5",
    "level": 9,
    "logo": "uploads/skills/skill/html-5-6ca2bd08.svg",
    "category": 1
  },
  {
    "id": 6,
    "name": "CSS 3",
    "level": 8,
    "logo": "uploads/skills/skill/css-3-4ba134fb.svg",
    "category": 1
  },
  {
    "id": 7,
    "name": "Javascript",
    "level": 7,
    "logo": "uploads/skills/skill/javascript-82fad236.svg",
    "category": 1
  },
  {
    "id": 8,
    "name": "TailwindCSS",
    "level": 8,
    "logo": "uploads/skills/skill/tailwindcss-defd551a.svg",
    "category": 1
  },
  {
    "id": 9,
    "name": "Bootstrap",
    "level": 7,
    "logo": "uploads/skills/skill/bootstrap-aed2d7b6.svg",
    "category": 1
  },
  {
    "id": 10,
    "name": "Redis",
    "level": 6,
    "logo": "uploads/skills/skill/redis-a2e2db02.svg",
    "category": 2
  },
  {
    "id": 11,
    "name": "MySQL",
    "level": 7,
    "logo": "uploads/skills/skill/mysql-e95bdd3c.svg",
    "category": 2
  },
  {
    "id": 12,
    "name": "MongoDB",
    "level": 6,
    "logo": "uploads/skills/skill/mongodb-1fd4fa80.svg",
    "category": 2
  },
  {
    "id": 13,
    "name": "PostgreSQL",
    "level": 8,
    "logo": "uploads/skills/skill/postgresql-a8324165.svg",
    "category": 2
  },
  {
    "id": 14,
    "name": "Docker",
    "level": 7,
    "logo": "uploads/skills/skill/docker-d6e7ad33.svg",
    "category": 3
  },
  {
    "id": 15,
    "name": "NGINX",
    "level": 7,
    "logo": "uploads/skills/skill/nginx-be4a9e96.svg",
    "category": 3
  },
  {
    "id": 16,
    "name": "Adobe Photoshop",
    "level": 9,
    "logo": "uploads/skills/skill/adobe-photoshop-1ce7abbb.svg",
    "category": 5
  },
  {
    "id": 17,
    "name": "Adobe Illustrator",
    "level": 8,
    "logo": "uploads/skills/skill/adobe-illustrator-a511363e.svg",
    "category": 5
  },
  {
    "id": 18,
    "name": "Adobe Premiere Pro",
    "level": 7,
    "logo": "uploads/skills/skill/adobe-premiere-pro-c04839a7.svg",
    "category": 5
  },
  {
    "id": 19,
    "name": "Canva",
    "level": 8,
    "logo": "uploads/skills/skill/canva-97bef3f5.svg",
    "category": 5
  },
  {
    "id": 20,
    "name": "Logo Design",
    "level": 8,
    "logo": "uploads/skills/skill/logo-design-fccc5fcf.svg",
    "category": 5
  },
  {
    "id": 21,
    "name": "Vue.js",
    "level": 8,
    "logo": "uploads/skills/skill/vue-js-569f1a26.svg",
    "category": 1
  },
  {
    "id": 22,
    "name": "NumPy",
    "level": 7,
    "logo": "uploads/skills/skill/numpy-24b72304.svg",
    "category": 4
  },
  {
    "id": 23,
    "name": "Pandas",
    "level": 6.5,
    "logo": "uploads/skills/skill/pandas-a5dd47e9.svg",
    "category": 4
  },
  {
    "id": 24,
    "name": "Matplotlib",
    "level": 6,
    "logo": "uploads/skills/skill/matplotlib-68203ac3.svg",
    "category": 4
  },
  {
    "id": 25,
    "name": "Jira",
    "level": 7,
    "logo": "uploads/skills/skill/jira-d79fd586.svg",
    "category": 6
  },
  {
    "id": 26,
    "name": "REST APIs",
    "level": 9,
    "logo": "uploads/skills/skill/rest-apis-719d642d.svg",
    "category": 1
  },
  {
    "id": 27,
    "name": "Node.js",
    "level": 6,
    "logo": "uploads/skills/skill/node-js-c26a2f62.svg",
    "category": 1
  },
  {
    "id": 28,
    "name": "Meta Business Suite",
    "level": 7,
    "logo": "uploads/skills/skill/meta-business-suite-d7416f5e.svg",
    "category": 5
  },
  {
    "id": 30,
    "name": "Microsoft Excel",
    "level": 7.5,
    "logo": "uploads/skills/skill/microsoft-excel-67381424.svg",
    "category": 4
  },
  {
    "id": 31,
    "name": "Seaborn",
    "level": 6.5,
    "logo": "uploads/skills/skill/seaborn-a74fd14a.svg",
    "category": 4
  },
  {
    "id": 32,
    "name": "SQLite",
    "level": 8,
    "logo": "uploads/skills/skill/sqlite-b62cdd18.svg",
    "category": 2
  },
  {
    "id": 33,
    "name": "AWS EC2",
    "level": 6,
    "logo": "uploads/skills/skill/aws-ec2-e83663f6.svg",
    "category": 3
  },
  {
    "id": 34,
    "name": "Figma",
    "level": 7,
    "logo": "uploads/skills/skill/figma-d12d077a.svg",
    "category": 5
  },
  {
    "id": 35,
    "name": "WordPress",
    "level": 8,
    "logo": "uploads/skills/skill/wordpress-e762a678.svg",
    "category": 1
  },
  {
    "id": 36,
    "name": "Linux (Ubuntu)",
    "level": 7,
    "logo": "uploads/skills/skill/linux-ubuntu-5d6082f0.svg",
    "category": 3
  },
  {
    "id": 37,
    "name": "Django REST Framework (DRF)",
    "level": 8,
    "logo": null,
    "category": 1
  },
  {
    "id": 38,
    "name": "React",
    "level": 6,
    "logo": null,
    "category": 1
  },
  {
    "id": 39,
    "name": "TypeScript",
    "level": 7,
    "logo": null,
    "category": 1
  },
  {
    "id": 40,
    "name": "React Router",
    "level": 6,
    "logo": null,
    "category": 1
  },
  {
    "id": 42,
    "name": "Vite",
    "level": 7,
    "logo": null,
    "category": 1
  },
  {
    "id": 43,
    "name": "PostGIS",
    "level": 6,
    "logo": null,
    "category": 2
  },
  {
    "id": 44,
    "name": "Docker",
    "level": 7,
    "logo": null,
    "category": 3
  },
  {
    "id": 45,
    "name": "Gunicorn",
    "level": 7,
    "logo": null,
    "category": 3
  },
  {
    "id": 46,
    "name": "Certbot / SSL",
    "level": 8,
    "logo": null,
    "category": 3
  },
  {
    "id": 47,
    "name": "Retrieval-Augmented Generation (RAG)",
    "level": 6,
    "logo": null,
    "category": 4
  },
  {
    "id": 51,
    "name": "Transformers",
    "level": 7,
    "logo": null,
    "category": 4
  },
  {
    "id": 52,
    "name": "Pinecone",
    "level": 6,
    "logo": null,
    "category": 4
  },
  {
    "id": 53,
    "name": "Project Coordination",
    "level": 8,
    "logo": null,
    "category": 6
  },
  {
    "id": 54,
    "name": "Team Leadership",
    "level": 7,
    "logo": null,
    "category": 6
  },
  {
    "id": 55,
    "name": "Project Planning",
    "level": 7,
    "logo": null,
    "category": 6
  },
  {
    "id": 56,
    "name": "Sprint Management",
    "level": 7,
    "logo": null,
    "category": 6
  },
  {
    "id": 57,
    "name": "Slack",
    "level": 8,
    "logo": null,
    "category": 6
  },
  {
    "id": 58,
    "name": "Notion",
    "level": 7,
    "logo": null,
    "category": 6
  }
]
```

### `services.service` (4 records)

```json
[
  {
    "id": 1,
    "title": "Full Stack Development",
    "icon": "uploads/services/fullstack.png",
    "description": "Building scalable, responsive, and user-friendly web applications with modern technologies like React, Django, and REST APIs.",
    "order": 0
  },
  {
    "id": 2,
    "title": "Creative Design & Branding",
    "icon": "uploads/services/creative branding.png",
    "description": "Transforming ideas into compelling visual experiences through graphic design, branding, and intuitive user interfaces.",
    "order": 0
  },
  {
    "id": 3,
    "title": "Data & AI Exploration",
    "icon": "uploads/services/ai exploration.png",
    "description": "Leveraging data analysis, visualization, and machine learning concepts to uncover insights and develop intelligent solutions.",
    "order": 0
  },
  {
    "id": 4,
    "title": "Leadership & Collaboration",
    "icon": "uploads/services/leadership collaboration.png",
    "description": "Combining technical expertise with leadership, teamwork, and creative problem-solving to turn ambitious ideas into meaningful outcomes.",
    "order": 0
  }
]
```

### `experience.experience` (14 records)

```json
[
  {
    "id": 1,
    "title": "Backend Developer",
    "company": "Youth Innovation Lab",
    "company_url": "https://youthinnovationlab.org/",
    "start_date": "2024-11-18",
    "end_date": "2025-05-30",
    "job_type": "Onsite",
    "skills": [
      1,
      2,
      3,
      4,
      10,
      13,
      14,
      15,
      26
    ],
    "category": "professional",
    "description": "Developed scalable backend applications using Python, Django, REST APIs, and PostgreSQL, focusing on system architecture, integration, testing, and deployment.",
    "logo": null,
    "achievements": [],
    "date_precision": "month"
  },
  {
    "id": 2,
    "title": "Project Associate",
    "company": "Youth Innovation Lab",
    "company_url": "https://youthinnovationlab.org/",
    "start_date": "2025-06-01",
    "end_date": "2026-07-30",
    "job_type": "Onsite",
    "skills": [
      1,
      2,
      3,
      4,
      10,
      13,
      14,
      15,
      26
    ],
    "category": "professional",
    "description": "Supported national disaster information systems, including Bipad Portal, through stakeholder coordination, system improvements, testing, deployment, and capacity-building initiatives.",
    "logo": null,
    "achievements": [],
    "date_precision": "month"
  },
  {
    "id": 3,
    "title": "Project Officer",
    "company": "Youth Innovation Lab",
    "company_url": null,
    "start_date": "2026-08-01",
    "end_date": null,
    "job_type": "Onsite",
    "skills": [
      1,
      2,
      3,
      4,
      7, 
      8,
      10,
      13,
      14,
      15,
      26,
      36,
      37,
      42,
      43,
      44,
      53,
      55
    ],
    "category": "professional",
    "description": "Leading national disaster management digital projects, overseeing implementation, technical teams, stakeholder coordination, system enhancements, and strategic project delivery at NDRRMA.",
    "logo": null,
    "achievements": [],
    "date_precision": "month"
  },
  {
    "id": 7,
    "title": "Qualification Compliance Associate",
    "company": "Queensford College, Australia",
    "company_url": "https://queensford.edu.au/",
    "start_date": "2022-10-01",
    "end_date": "2023-12-30",
    "job_type": "Remote",
    "skills": [
      25,
      29,
      30
    ],
    "category": "professional",
    "description": "Managed student records, academic results, and statistical data using Microsoft Sandbox, ensuring data accuracy, system integrity, compliance, and efficient reporting.",
    "logo": null,
    "achievements": [],
    "date_precision": "month"
  },
  {
    "id": 8,
    "title": "ICT Assistant",
    "company": "Ambirise IT Solution",
    "company_url": null,
    "start_date": "2020-10-01",
    "end_date": "2023-08-31",
    "job_type": "Hybrid",
    "skills": [
      5,
      6,
      7,
      9,
      11,
      12,
      16,
      17,
      18,
      19,
      28
    ],
    "category": "professional",
    "description": "Provided IT support, managed domains, databases, and applications, maintained digital systems, and supported web operations, troubleshooting, graphic design, and branding.",
    "logo": null,
    "achievements": [],
    "date_precision": "month"
  },
  {
    "id": 9,
    "title": "President",
    "company": "Rotaract Club of Pokhara University",
    "company_url": null,
    "category": "leadership",
    "description": "Led club operations, strategic planning, community service initiatives, and team management while fostering partnerships, member engagement, and impactful community development projects.",
    "logo": null,
    "achievements": [],
    "date_precision": "month",
    "start_date": "2023-07-01",
    "end_date": "2024-06-30",
    "job_type": "",
    "skills": [
      25,
      28,
      30,
      53,
      54,
      55,
      57
    ]
  },
  {
    "id": 10,
    "title": "Campus Director",
    "company": "Hult Prize at Pokhara University",
    "company_url": null,
    "category": "leadership",
    "description": "Led campus-wide entrepreneurship initiatives, overseeing strategic planning, team coordination, event execution, stakeholder engagement, and operations to foster innovation and student participation.",
    "logo": null,
    "achievements": [],
    "date_precision": "month",
    "start_date": "2023-08-01",
    "end_date": "2024-07-31",
    "job_type": "",
    "skills": [
      25,
      30,
      53,
      54,
      55,
      57
    ]
  },
  {
    "id": 11,
    "title": "The Rotary Foundation Chair",
    "company": "Rotaract Club of Pokhara University",
    "company_url": null,
    "category": "leadership",
    "description": "Coordinated Rotary Foundation initiatives, supported fundraising and service activities, promoted foundation awareness, and collaborated with club members to strengthen community impact.",
    "logo": null,
    "achievements": [],
    "date_precision": "month",
    "start_date": "2022-07-01",
    "end_date": "2023-06-30",
    "job_type": "",
    "skills": [
      30,
      53,
      54,
      57
    ]
  },
  {
    "id": 12,
    "title": "Deputy Campus Director",
    "company": "Hult Prize at Pokhara University",
    "company_url": null,
    "category": "leadership",
    "description": "Supported campus leadership in planning entrepreneurship events, coordinating teams, managing project timelines, and facilitating collaboration to ensure successful execution of initiatives.",
    "logo": null,
    "achievements": [],
    "date_precision": "month",
    "start_date": "2022-08-01",
    "end_date": "2023-07-31",
    "job_type": "",
    "skills": [
      25,
      30,
      53,
      54,
      55,
      57
    ]
  },
  {
    "id": 13,
    "title": "General Manager",
    "company": "Hult Prize at Pokhara University",
    "company_url": null,
    "category": "leadership",
    "description": "Managed operational activities, coordinated event logistics, supported promotional campaigns, and facilitated team communication to strengthen campus engagement and entrepreneurship initiatives.",
    "logo": null,
    "achievements": [],
    "date_precision": "month",
    "start_date": "2021-08-01",
    "end_date": "2022-07-31",
    "job_type": "",
    "skills": [
      25,
      28,
      30,
      53,
      57
    ]
  },
  {
    "id": 14,
    "title": "International Service Director",
    "company": "Rotaract Club of Pokhara University",
    "company_url": null,
    "category": "leadership",
    "description": "Facilitated international collaboration, coordinated cross-cultural service initiatives, strengthened partnerships with Rotaract clubs, and promoted global understanding through meaningful community engagement activities.",
    "logo": null,
    "achievements": [],
    "date_precision": "month",
    "start_date": "2021-07-01",
    "end_date": "2022-06-30",
    "job_type": "",
    "skills": [
      53,
      54,
      57
    ]
  },
  {
    "id": 15,
    "title": "Charter IT Officer",
    "company": "Rotaract Club of Pokhara University",
    "company_url": null,
    "category": "leadership",
    "description": "Managed digital platforms, website content, branding materials, and social media activities while providing technical support and strengthening the club's online presence.",
    "logo": null,
    "achievements": [],
    "date_precision": "month",
    "start_date": "2020-08-01",
    "end_date": "2021-06-30",
    "job_type": "",
    "skills": [
      35,
      30,
      28,
      20,
      19,
      18,
      17,
      16
    ]
  },
  {
    "id": 16,
    "title": "Graphics Designer",
    "company": "Hult Prize Nepal Community",
    "company_url": null,
    "category": "leadership",
    "description": "Designed promotional graphics, branding assets, and social media content using Adobe Creative Suite and Canva, supporting visual communication and digital engagement campaigns.",
    "logo": null,
    "achievements": [],
    "date_precision": "year",
    "start_date": "2020",
    "end_date": "2021",
    "job_type": "",
    "skills": [
      28,
      20,
      19,
      18,
      17,
      16
    ]
  },
  {
    "id": 17,
    "title": "Promotions Manager",
    "company": "Hult Prize Nepal Community",
    "company_url": null,
    "category": "leadership",
    "description": "Led promotional strategies, coordinated creative teams, managed digital campaigns, and developed engaging content to increase awareness, participation, and visibility of entrepreneurship initiatives.",
    "logo": null,
    "achievements": [],
    "date_precision": "year",
    "start_date": "2021",
    "end_date": "2022",
    "job_type": "",
    "skills": [
      28,
      20,
      19,
      18,
      17,
      16,
      35,
      53,
      54,
      57
    ]
  },
]
```

### `projects.projectcategory` (3 records)

```json
[
  {
    "id": 1,
    "name": "Web Development"
  },
  {
    "id": 2,
    "name": "Graphic & Digital Marketing"
  },
  {
    "id": 3,
    "name": "Logo Design"
  }
]
```

### `projects.project` (18 records)

```json
[
  {
    "id": 1,
    "name": "Real-Time End-to-End Encrypted Chat API Using Signal Protocol",
    "skills": [
      1,
      2,
      3,
      4,
      10,
      13,
      14,
      26
    ],
    "client": null,
    "banner_image": "uploads/projects/project/real-time-chat-application-with-django-channels-knox-au-b092ed0e.svg",
    "start_date": "2025-02-01",
    "end_date": "2025-03-01",
    "description": "<p>Building a secure real-time chat application implementing the <strong>Signal E2EE Workflow</strong> along with <strong>Django Channels</strong> and <strong>Knox Authentication</strong> addresses the growing need for instant communication in platforms such as team collaboration, community interaction, and customer support. Real-time chat features are now integral to many platforms, making this project highly relevant.</p><p>&nbsp;</p><p>The journey begins with setting up a custom user model using Django’s <strong>AbstractBaseUser</strong>. Instead of relying on the default user model, this custom model includes an email as the unique identifier for login, a required name field to personalize the chat experience, and an optional avatar field for storing user profile pictures. This early customization ensures the authentication system fits seamlessly with the overall application.</p><p>&nbsp;</p><p>At the heart of the chat app are two main models: <strong>ChatRoom</strong> and <strong>Message</strong>. The ChatRoom model includes a name, members represented by a many-to-many relationship with the custom user model, and a unique slug generated using slugify combined with random characters. The Message model links to a ChatRoom and a sender (the user who sent the message), storing the actual message content as a CharField. This design allows efficient message storage and retrieval, while also restricting room access to authorized members.</p><p>&nbsp;</p><p>To enable real-time messaging, Django Channels is integrated into the project. By installing packages like channels, channels-redis, and daphne, and updating settings such as <strong>ASGI_APPLICATION</strong>, the app can handle <strong>WebSocket connections</strong>. During development, an <strong>InMemoryChannelLayer</strong> is used for convenience, though a Redis-backed channel layer is recommended for production environments for better performance and reliability.</p><p>&nbsp;</p><p>Security is a major focus, especially since chat applications handle constant user data exchange. <strong>Knox Authentication</strong> is used to secure WebSocket connections via a custom middleware called <strong>KnoxAuthMiddleware</strong>. This middleware ensures that only users with valid Knox tokens can open WebSocket connections, effectively preventing unauthorized access and safeguarding real-time data.</p><p>&nbsp;</p><p>The <strong>ChatConsumer</strong> class is the core WebSocket handler. It manages user connections and disconnections, receives messages from clients, broadcasts messages to chat groups, and persists messages to the database. By overriding methods like connect, disconnect, and receive_json, the consumer delivers smooth and responsive chat interactions.</p><p>&nbsp;</p><p>Finally, WebSocket routing and ASGI configuration are set up using <strong>ProtocolTypeRouter, AuthMiddlewareStack,</strong> and the custom <strong>KnoxAuthMiddleware</strong>, ensuring all incoming WebSocket requests are authenticated and correctly routed to the chat consumer. Testing the implementation with Postman confirmed that messages flow properly with valid Knox tokens, and that messages are saved correctly in the database.</p><p>&nbsp;</p><p>In summary, this project combines real-time WebSocket communication with secure token-based authentication within Django. Using Django Channels, Knox, and a custom user model, it builds a scalable and production-ready chat app architecture, ready to be enhanced with <strong>Redis</strong> for channel layers. Whether you’re building a social platform, collaboration tool, or support system, this approach provides a robust foundation for secure, real-time communication.</p>",
    "distinct_features": "<ul><li>Real-time messaging via <strong>Django Channels</strong>.</li><li>Token-based authentication using <strong>Knox</strong>.</li><li>Custom User Model.</li><li>Secure <strong>WebSocket connections</strong> restricted to authenticated users.</li><li>Production-ready with <code><strong>RedisChannelLayer</strong></code>.</li></ul>",
    "category": 1,
    "slug": "chat-api-signal-protocol"
  },
  {
    "id": 3,
    "name": "Brand Identity & Logo Design for Before Education Consultancy",
    "skills": [
      16,
      17,
      19
    ],
    "client": "Before Education Consultancy",
    "banner_image": "uploads/projects/project/brand-identity-logo-design-for-before-education-consult-1cf53363.svg",
    "start_date": "2022-06-01",
    "end_date": null,
    "description": "<p>For <strong>Before Education Consultancy</strong>, I designed a logo that reflects both <strong>academic excellence</strong> and a <strong>modern, trustworthy brand identity</strong>.</p><p>&nbsp;</p><p>The logo concept is built around meaningful symbolism:</p><ul><li><strong>Graduation Hat on Top</strong>: Represents academic achievement and the consultancy’s core focus on education.</li><li><strong>Books Under the Hat</strong>: Symbolizes knowledge, learning, and the foundational support the consultancy offers students.</li><li><p><strong>Pillar Structures Forming 'B4'</strong>: A creative abbreviation of “Before,” subtly integrated into the design as structural elements that stand for strength, guidance, and progress.</p><p>&nbsp;</p></li></ul><p>The color palette leans toward a <strong>fresh lime tone</strong>, evoking <strong>growth, energy, and clarity</strong>, which aligns with the brand's mission to prepare students for their educational journey.</p><p>&nbsp;</p><p>Typography is set in a <strong>clean sans-serif style</strong>:</p><ul><li><strong>“Before”</strong> is prominently displayed in bold, uppercase letters to establish strong brand recall.</li><li><p><strong>“Education Consultancy”</strong> is placed below in smaller, minimalist text to maintain clarity without overpowering the main name.</p><p>&nbsp;</p></li></ul><p>The result is a <strong>modern, academic, and approachable logo</strong> that visually communicates the consultancy's purpose: guiding students with confidence and clarity — <i>before</i> they take the next big step.</p>",
    "distinct_features": "<ul><li><strong>Graduation hat symbol</strong> to represent academic success</li><li><strong>Books under the hat</strong> symbolizing knowledge and guidance</li><li><strong>Pillars form 'B4'</strong> creatively referencing \"Before\"</li><li><strong>Lime color palette</strong> for freshness, growth, and clarity</li><li><strong>Sans-serif typography</strong> for a clean, modern look</li><li><strong>Clear hierarchy</strong>: “Before” bold and large, tagline subtle and supportive</li></ul>",
    "category": 3,
    "slug": "billboard-design-PwzaT"
  },
  {
    "id": 4,
    "name": "Powering Sarbam Foods with Django: A Complete Backend for Stock, Orders, and Authentication",
    "skills": [
      1,
      2,
      4,
      5,
      6,
      10,
      13,
      14,
      15,
      26
    ],
    "client": "Sarbam Foods",
    "banner_image": "uploads/projects/project/powering-sarbam-foods-with-django-a-complete-backend-fo-193d1ea1.svg",
    "start_date": "2024-12-01",
    "end_date": "2025-02-28",
    "description": "<p>In today’s digital landscape, even local businesses need reliable and scalable software to handle operations like inventory management and online sales. I recently had the opportunity to build a complete backend system for <strong>Sarbam Foods</strong>, a growing food company, using <strong>Django</strong>, a high-level Python web framework. This project empowered the business to streamline its stock management, online ordering, and user authentication — all in one place.</p><p>&nbsp;</p><h3><strong>Project Overview</strong></h3><p>&nbsp;</p><p>The Sarbam Foods backend is built with <strong>Django REST Framework (DRF)</strong> and is designed to serve both internal staff and customers via APIs. From managing live stock to placing product orders and handling secure user sessions, this backend acts as the backbone of Sarbam Foods' digital operations.</p><p>&nbsp;</p><p>Whether a customer wants to order a product online, or an admin needs to track product availability, this system provides seamless support.</p><p>&nbsp;</p><h3><strong>Key Features</strong></h3><p>Here are the distinct features of the project:</p><ul><li><strong>Stock Management System</strong><ul><li>Tracks inventory of all food products.</li><li>Automatic stock deduction upon order placement.</li><li><p>Admin panel for adding/updating/removing products and quantities.</p><p>&nbsp;</p></li></ul></li><li><strong>Online Product Ordering</strong><ul><li>RESTful API for browsing and placing orders.</li><li>Cart management and order tracking functionalities.</li><li><p>Order confirmation via email.</p><p>&nbsp;</p></li></ul></li><li><strong>JWT-Based Authentication</strong><ul><li>Secure login and signup using <strong>JSON Web Tokens (JWT)</strong>.</li><li>Token refresh and access endpoints for protected resources.</li><li><p>Role-based access for admins and regular users.</p><p>&nbsp;</p></li></ul></li><li><strong>Email Integration</strong><ul><li>Sends confirmation emails on registration and order placement.</li><li>Password reset and email verification functionality.</li><li><p>Integrated with Django’s email backend for production readiness.</p><p>&nbsp;</p></li></ul></li><li><strong>Admin Dashboard</strong><ul><li>Built-in Django admin panel customized for managing users, products, and orders.</li><li><p>Filter, search, and bulk actions for faster admin workflow.</p><p>&nbsp;</p></li></ul></li><li><strong>Mobile-Friendly API</strong><ul><li>Designed to be consumed by mobile and web frontends.</li><li><p>Well-structured, versioned endpoints using Django REST Framework.</p><p>&nbsp;</p></li></ul></li><li><p><strong>Tested and Documented</strong></p><ul><li>API tested via <strong>Postman</strong> and thoroughly documented.</li><li>Modular design ready for deployment and further expansion.</li></ul><p>&nbsp;</p></li></ul><p>The flexibility of Django and DRF made it easy to scale and adapt the backend to match Sarbam Foods’ growing requirements.</p><p>&nbsp;</p><p>If you’re working on a similar project or planning to build a backend for your business, feel free to reach out or explore Django — it’s powerful, secure, and developer-friendly.</p>",
    "distinct_features": "<ul><li>Real-time stock management with auto-deduction on orders</li><li>Online product ordering via <strong>RESTful APIs</strong></li><li>Secure authentication using <strong>JWT</strong></li><li>Email verification, password reset, and order confirmations</li><li>Admin panel for managing products, users, and orders</li></ul>",
    "category": 1,
    "slug": "sarbam-foods-backend-Po0tg"
  },
  {
    "id": 5,
    "name": "Rebranding the Sweet Life Partner Logo",
    "skills": [
      16,
      17,
      19
    ],
    "client": "Sweet Life Partner",
    "banner_image": "uploads/projects/project/rebranding-the-sweet-life-partner-logo-c8fbaece.svg",
    "start_date": "2021-08-01",
    "end_date": null,
    "description": "<p><strong>Sweet Life Partner (SLP)</strong> is a matrimonial service based in <strong>Australia</strong>, dedicated to connecting individuals in meaningful, lifelong relationships. The rebranding project focused on redefining their visual identity to better align with their mission: bringing love, trust, and commitment together under a modern, emotionally resonant brand.</p><p>&nbsp;</p><p>The new <strong>logo design</strong> is symbolic, minimal, and emotionally expressive:</p><ul><li><strong>Two Intertwined Rings</strong> – A silver ring on the <strong>left</strong> and a gold ring on the <strong>right</strong> symbolize the sacred union of two individuals. Their intertwined form represents unity, balance, and the lifelong bond of marriage.</li><li><strong>Heart Symbol Above the Rings</strong> ❤️ – Placed delicately above the point where the rings connect, the heart conveys the central emotion behind SLP's services — love, care, and partnership.</li><li><strong>Embedded Initials (S-L-P)</strong> – Each section of the rings subtly features a letter: <strong>‘S’ in the silver ring</strong>, <strong>‘L’ in the overlap</strong>, and <strong>‘P’ in the gold ring</strong>. This adds a unique layer of identity while maintaining aesthetic simplicity.</li></ul><p>&nbsp;</p><p>The color contrast of <strong>silver and gold</strong> was chosen not only for elegance but also to symbolize <strong>diversity, value, and timeless commitment</strong>. These precious metals reflect the uniqueness of each partner and the lasting value of marriage.</p><p>&nbsp;</p><p>To complement the logo, a clean and balanced visual style was established, ensuring the new identity is both <strong>modern and emotionally engaging</strong> across digital and print platforms.</p><p><br><br>This rebranding not only modernizes the visual identity of Sweet Life Partner but also reinforces its core message:</p><p><strong>“Helping two hearts find one sweet life.”</strong></p>",
    "distinct_features": "<ul><li><strong>Intertwined silver and gold rings</strong> symbolizing unity and commitment</li><li><strong>Heart icon above the rings</strong> representing love and emotional connection</li><li><strong>Letters S, L, P embedded</strong> into the ring sections for brand identity</li><li><strong>Silver (left) and gold (right)</strong> for elegance, value, and balance</li><li><strong>Modern, clean, and emotionally resonant design</strong> across platforms</li></ul>",
    "category": 3,
    "slug": "digital-marketing-5Z3Dv"
  },
  {
    "id": 6,
    "name": "Tournament Digital Support for Kandel Consultancy Cup",
    "skills": [
      16,
      17,
      18,
      19,
      20,
      28
    ],
    "client": "Yeti Football Club, Australia",
    "banner_image": "uploads/projects/project/tournament-digital-support-for-kandel-consultancy-cup-d1f480aa.svg",
    "start_date": "2022-12-01",
    "end_date": "2024-04-30",
    "description": "<p>For the <i>Kandel Consultancy Cup</i> organized by Yeti Football Club Australia, I was deeply involved in the Graphic and Digital Marketing efforts that supported the event from its inception to completion. My responsibilities spanned a wide range of creative and technical tasks aimed at ensuring the event had a strong and cohesive <strong>visual presence across all platforms and materials.</strong></p><p>&nbsp;</p><p>I began by designing the official <strong>event logo</strong>, which served as the foundation for the entire tournament’s branding. This logo was used consistently across promotional materials, social media campaigns, and physical assets to create a recognizable identity for the competition. Beyond the logo, I crafted specialized designs tailored for key moments and aspects of the tournament, such as s<strong>ocial media graphics, event posters, and banners</strong>, to effectively capture attention and generate excitement among participants and fans alike.</p><p>&nbsp;</p><p>My role also extended into the operational side of the tournament, where I provided <strong>technical support</strong> by managing the creation of team draws and ensuring that the league tables were accurately updated throughout the competition. This involved close coordination with the event organizers to maintain the integrity and flow of the matches, helping to keep both players and audiences informed in real time.</p><p>&nbsp;</p><p>In addition, I designed various physical materials critical to the <strong>event’s presentation and professionalism</strong>. These included custom team certificates recognizing participants’ efforts, detailed scorecards used during matches to track performance, and visually appealing props such as large-format cash prize cheques for the winners. These props added a ceremonial aspect to the event’s conclusion and were key in creating memorable photo opportunities that further boosted the tournament’s visibility.</p><p>&nbsp;</p><p>Overall, my contributions ensured that the Kandel Consultancy Cup was not only well-organized behind the scenes but also presented in a visually engaging and professional manner, enhancing the overall experience for players, fans, and organizers alike.</p>",
    "distinct_features": "<ul><li>Designed <strong>event branding assets</strong> including logos, posters, certificates, and scorecards.</li><li>Created matchday graphics, winner cheques, and event props for presentation.</li><li>Provided technical support for fixtures, draws, and live league table updates.</li><li><strong>Boosted social media </strong>engagement through timely and professional visual content.</li></ul>",
    "category": 2,
    "slug": "tournament-digital-support-I35dl"
  },
  {
    "id": 7,
    "name": "Advanced Assignment and Student Management System with Plagiarism Checker",
    "skills": [
      1,
      2,
      5,
      6,
      7,
      9,
      11,
      19
    ],
    "client": null,
    "banner_image": "uploads/projects/project/advanced-assignment-and-student-management-system-with--3afaae0b.svg",
    "start_date": "2023-12-01",
    "end_date": "2024-08-25",
    "description": "<p>In an era of increasing digitization in education, managing academic processes efficiently has become critical for institutions. This project — an <strong>Academic Management System</strong> — was developed to streamline and automate key academic workflows such as internal mark uploads, assignment submissions, plagiarism detection, and MCQ grading through OMR technology. The goal was to create a platform that enhances transparency, accountability, and academic integrity while improving the user experience for students, teachers, and administrators alike.</p><p>&nbsp;</p><h3><strong>Objectives</strong></h3><ul><li>Simplify the internal mark uploading process for faculty.</li><li>Enable students to submit assignments online with deadline enforcement.</li><li>Integrate an automated plagiarism detection module.</li><li>Introduce an OMR-based grading system for MCQ evaluations.</li><li>Build a scalable and secure platform that can be integrated with other educational tools in the future.</li></ul><p>&nbsp;</p><p><strong>Plagiarism Detection Workflow:</strong></p><ul><li>File Upload: Accepts DOCX and PDF files.</li><li>File Reader (<code>read_file</code>): Extracts text from the uploaded document.</li><li>Text Preprocessor (<code>preprocessor_text</code>): Cleans and standardizes content for analysis.</li><li>Sentence Splitter (<code>split_sentences</code>): Breaks the content into analyzable sentences.</li><li>Plagiarism Checker (<code>check_plagiarism</code>): Compares the document against existing assignments and flags matching text.</li><li><p>Output Generator: Displays detailed plagiarism reports with highlighted matches.</p><p>&nbsp;</p></li></ul><p>This ensures authenticity, promotes original work, and helps both students and teachers maintain ethical academic standards.</p><p>&nbsp;</p><p><strong>OMR System for MCQ Grading</strong></p><p>The system automates MCQ assessment by enabling instructors to scan and grade OMR sheets. This significantly reduces manual effort and increases grading accuracy.</p><p>&nbsp;</p><h3><strong>Tools and Technologies Used</strong></h3><figure class=\"table\"><table><thead><tr><th>Category</th><th>Technology/Tool</th><th>Purpose</th></tr></thead><tbody><tr><td><strong>Frontend</strong></td><td>Bootstrap</td><td>Responsive UI across devices</td></tr><tr><td><strong>Backend</strong></td><td>Django</td><td>Secure, scalable web application framework</td></tr><tr><td><strong>Database</strong></td><td>SQLite</td><td>Lightweight, file-based data storage</td></tr><tr><td><strong>API Development</strong></td><td>Django REST Framework</td><td>Creation of RESTful APIs for integration</td></tr><tr><td><strong>File Handling</strong></td><td>Python File I/O, docx, PyPDF2</td><td>To read and process uploaded documents</td></tr><tr><td><strong>Plagiarism Check</strong></td><td>Custom Python Scripts</td><td>Text processing and comparison logic</td></tr><tr><td><strong>OMR Integration</strong></td><td>Image processing libs</td><td>Scanning and reading OMR sheets (future extension)</td></tr></tbody></table></figure><p>&nbsp;</p><h3><strong>Outcomes</strong></h3><ul><li>Mark uploading became significantly more efficient.</li><li>Assignment deadlines are enforced digitally, ensuring timely submissions.</li><li>Academic integrity is protected through automatic plagiarism checking.</li><li>MCQ grading is now faster and less prone to human error.</li><li>Educators gain more control, and students enjoy greater transparency in academic records.</li></ul>",
    "distinct_features": "<ul><li><strong>Internal Mark Upload</strong>: Instructors can easily add or update grades; students get instant access to their marks.</li><li><strong>Assignment Submission</strong>: Students submit work online; system tracks deadlines, sends alerts, and blocks late submissions.</li><li><strong>Plagiarism Detection</strong>: Checks student submissions for copied content to ensure originality and uphold academic integrity.</li></ul>",
    "category": 1,
    "slug": "advanced-assignment-and-student-manageme-M7b9z"
  },
  {
    "id": 8,
    "name": "A Complete Branding Journey: Spark International Education Consultancy",
    "skills": [
      5,
      6,
      16,
      17,
      19,
      20,
      28,
      35
    ],
    "client": "Spark International Education Consultancy",
    "banner_image": "uploads/projects/project/a-complete-branding-journey-spark-international-educati-9438e5d3.svg",
    "start_date": "2024-11-01",
    "end_date": "2025-01-30",
    "description": "<p>Spark International Education Consultancy aimed to establish a distinctive identity in the competitive education consulting industry. My responsibility was to create a complete branding and marketing foundation that would make the organization stand out and connect effectively with its target audience — students seeking guidance for international studies.</p><p>&nbsp;</p><h3><strong>Roles &amp; Responsibilities</strong></h3><ul><li><strong>Brand Development</strong><br>I worked closely with the company’s leadership to understand their mission and values. Based on this insight, I created a complete visual identity system:<ul><li>Designed a <strong>modern and meaningful logo</strong> that resonates with trust, guidance, and global opportunity.</li><li>Selected a brand <strong>color palette</strong> and <strong>typography system</strong> that reflects professionalism and approachability.</li><li><p>Developed brand consistency across digital and print media.</p><p>&nbsp;</p></li></ul></li><li><strong>Social Media Marketing</strong><br>Built and executed a social media strategy to increase visibility, attract leads, and engage the audience:<ul><li>Designed <strong>branded post templates</strong> for platforms like Facebook and Instagram.</li><li>Managed campaign content calendars.</li><li><p>Focused on <strong>audience growth and retention</strong>, leading to improved online presence and inquiries.</p><p>&nbsp;</p></li></ul></li><li><strong>Company Profile Creation</strong><ul><li>Drafted and designed a compelling <strong>company profile</strong> for both online and offline use, showcasing services, success stories, and core values.</li><li><p>Ensured all profile materials reflected a <strong>consistent tone and design</strong>.</p><p>&nbsp;</p></li></ul></li><li><strong>Website Design &amp; Development</strong><br>Using <strong>WordPress</strong>, I designed a <strong>responsive</strong>, SEO-ready website:<ul><li>Optimized for both mobile and desktop users.</li><li>Structured with easy-to-navigate content, service listings, contact forms, and blog sections.</li><li>Embedded key <strong>branding elements</strong> to ensure brand recognition and trust.</li></ul></li></ul><p>&nbsp;</p><h3><strong>Outcome &amp; Impact</strong></h3><ul><li>Established a <strong>recognizable brand identity</strong> across all mediums.</li><li>Increased <strong>social media engagement and followers</strong> organically through consistent content.</li><li>Built a <strong>professional online presence</strong> that led to increased inquiries and trust from clients.</li><li>Delivered all assets with scalability in mind — enabling Spark to expand its marketing activities without rebranding.</li></ul>",
    "distinct_features": "<ul><li><strong>Logo &amp; Branding</strong>: Designed logo and brand identity</li><li><strong>Social Media</strong>: Managed and created marketing content</li><li><strong>Company Profile</strong>: Designed professional company profile</li><li><strong>Website</strong>: Built responsive WordPress site</li><li><strong>Growth</strong>: Boosted online presence and engagement</li></ul>",
    "category": 2,
    "slug": "a-complete-branding-journey-for-spark-in-3ZkQI"
  },
  {
    "id": 9,
    "name": "Full-Stack Developer Portfolio – Django, Vue & AWS",
    "skills": [
      1,
      2,
      3,
      4,
      7,
      8,
      10,
      13,
      15,
      21,
      26,
      36
    ],
    "client": null,
    "banner_image": "uploads/projects/projectimage/web-responsive-frontend.png",
    "start_date": "2025-03-01",
    "end_date": "2025-07-08",
    "description": "<p>This portfolio website is a full-fledged <strong>personal branding platform</strong> built from scratch using a modern full-stack architecture. It serves as a central hub for showcasing my projects, technical skills, blog posts, and real-world experience. Every part of the system — from API design and database schema to frontend rendering and server deployment — was carefully crafted to ensure performance, scalability, and maintainability.</p><p>&nbsp;</p><p>The goal of this project was not just to build a website, but to simulate a <strong>production-grade system</strong> similar to what’s used in real startups or enterprise apps. It reflects my hands-on experience with a complete development workflow — from backend logic to frontend UI, from containerization to cloud deployment.</p><p>&nbsp;</p><h3><strong>Technology Stack</strong></h3><p><strong>a. Backend</strong></p><ul><li><strong>Django</strong>: A robust and secure Python web framework used to handle the server-side logic, user authentication, and data modeling.</li><li><strong>Django Rest Framework (DRF)</strong>: Used to build a scalable, clean, and versioned RESTful API that the frontend consumes.</li><li><strong>PostgreSQL</strong>: The primary relational database system — chosen for its reliability, performance, and advanced querying capabilities.</li><li><p><strong>Redis</strong>: Integrated as a caching layer for API responses and session data, dramatically improving performance under load.</p><p>&nbsp;</p></li></ul><p><strong>b. Frontend</strong></p><ul><li><p><strong>VueJS (Composition API + Script Setup)</strong>: Enables a modern reactive UI with a component-based architecture. Vue provides a seamless single-page application (SPA) experience with smooth transitions, reactivity, and interactivity.</p><p>&nbsp;</p></li><li><p><strong>TailwindCSS</strong>: Utility-first CSS framework that helped build a responsive and custom-designed interface with minimal custom CSS. Ensures consistent styling across the app and rapid prototyping.</p><p>&nbsp;</p></li></ul><p><strong>c. DevOps &amp; Infrastructure</strong></p><ul><li><strong>Docker</strong>: Every component of the app is containerized for consistency, portability, and scalability. I’ve created separate containers for the backend, frontend, Redis, PostgreSQL, and Nginx.</li><li><strong>Nginx</strong>: Acts as a reverse proxy and static file server, managing traffic efficiently and securely between services.</li><li><strong>Linux (Ubuntu)</strong>: The server OS running on the EC2 instance, providing a secure and lightweight environment for production workloads.</li><li><strong>AWS EC2 Instance</strong>: The entire application stack is deployed on a virtual machine running on <strong>Amazon Web Services (AWS)</strong>. This gave me hands-on experience with cloud infrastructure, SSH configuration, firewall rules, SSL certification, and uptime monitoring.</li><li><strong>Gunicorn</strong>: Used as the Python WSGI HTTP server to serve the Django application in production.</li><li><strong>Certbot + Let's Encrypt</strong>: Configured SSL certificates for HTTPS support, ensuring encrypted and secure communication.</li></ul><p>&nbsp;</p><p><strong>d. UI/UX Design</strong></p><ul><li><strong>Figma</strong>: designed the entire UI/UX of the portfolio website before development. This included:<ul><li>Creating wireframes and high-fidelity mockups</li><li>Planning responsive layouts for desktop and mobile</li><li>Designing reusable components like buttons, cards, and modals</li><li>Collaborating visually with layout ideas before writing any code</li><li>Using Figma helped ensure a <strong>user-friendly, visually consistent</strong> frontend that translated seamlessly into TailwindCSS and Vue components.<strong>&nbsp;</strong></li></ul></li></ul><p>&nbsp;</p><h3><strong>Version 2 Enhancements (v2)</strong></h3><p>The current version of the site (v2) introduces <strong>major architectural and UX enhancements</strong>, designed to improve performance, maintainability, and user engagement.</p><ul><li><strong>Feature Flag System</strong>: Integrated a flexible flag system that allows specific features (like experience tab, or project drafts) to be enabled/disabled dynamically — without deploying new code.</li><li><strong>Individual Project Pages</strong>: Each project now links to a detailed description page, including:<ul><li>Overview and purpose</li><li>Tech stack and architecture</li><li>Images related to the projects</li></ul></li><li><strong>Improved State Management</strong>: Leveraged Vue’s reactivity system to enhance UX, including image sliders, modals, and animations.</li><li><p><strong>Responsive Image Slider</strong>: Built a lightweight, responsive image slider using Vue transitions, supporting full-screen previews and smooth animations.</p><p>&nbsp;</p></li></ul>",
    "distinct_features": "<ul><li><strong>Built with Django &amp; Django REST Framework</strong> for a modular, secure backend and clean API design</li><li><strong>Vue 3 SPA with TailwindCSS</strong> for a fast, responsive, and modern frontend experience</li><li><strong>Fully Dockerized Architecture</strong>, including frontend, backend, Redis, PostgreSQL, and Nginx</li><li><p><strong>Deployed on AWS EC2</strong> (Ubuntu) with Nginx reverse proxy, Gunicorn, and SSL via Let’s Encrypt</p><p>&nbsp;</p></li></ul>",
    "category": 1,
    "slug": "portfolio-website-tlqdr"
  },
  {
    "id": 10,
    "name": "Digital Marketing and Graphic Design: Sweet Life Partner",
    "skills": [
      16,
      17,
      18,
      19,
      20,
      28
    ],
    "client": "Sweet Life Partner",
    "banner_image": "uploads/projects/project/digital-marketing-and-graphic-design-sweet-life-partner-e292270e.svg",
    "start_date": "2021-08-01",
    "end_date": "2022-11-30",
    "description": "<p>This project highlights an ongoing creative collaboration with <strong>Sweet Life Partner (SLP)</strong> — a premium matrimony service based in Australia. The project focuses on establishing and strengthening <strong>visual brand identity</strong>, enhancing <strong>social media engagement</strong>, and aligning the company’s communication with <strong>emotional, cultural, and seasonal narratives</strong>.</p><p>&nbsp;</p><p>At the heart of this project is the brand’s refined visual identity, symbolized by its <strong>rebranded logo</strong>—featuring <strong>entwined gold and silver rings</strong> marked with the letters <strong>S, L, and P</strong>, topped with a heart. This core design language inspired a wide variety of complementary visuals that were used across campaigns and platforms.</p><p>&nbsp;</p><p><strong>Key Design Deliverables:</strong></p><ul><li><strong>Logo Variants and Themed Visuals</strong>: Including the <strong>3D Finish Logo</strong>, <strong>Christmas-themed adaptations</strong>, and multiple occasion-based designs (e.g., Dashain kites, Purnima celebration) to keep the brand contextually relevant and emotionally resonant throughout the year.</li><li><strong>Social Media Campaigns</strong>: Graphics such as <i>“It’s always better with your love”</i> and <i>“Unique Design to match the partner with same preferences”</i> were tailored to reflect the brand’s core message of love, connection, and compatibility. These visuals were carefully designed to build trust and relatability with the target audience.</li><li><strong>Trend-Driven Creatives</strong>: Designs such as <i>“Chowk Tira”</i> and <i>“Sapana Ko Mayalu”</i> embraced viral cultural moments and online trends to keep the brand lively, youthful, and highly shareable. These pieces not only increased engagement but also helped the brand become part of larger social conversations.</li><li><strong>Brand Consistency Across Channels</strong>: Every visual element—whether a story post, a profile banner, or a feed update—was crafted using a consistent color palette, typography, and theme, reinforcing brand recognition and trust.</li></ul><p>&nbsp;</p><p>This project was not only a showcase of graphic design skills but also a strategic exercise in <strong>emotional branding</strong> and <strong>digital storytelling</strong>. The goal was to move beyond aesthetics and create designs that <strong>speak to the heart</strong>, making Sweet Life Partner a more relatable and memorable name in the online matchmaking space.</p><p>&nbsp;</p><p>As a result, the brand witnessed improved <strong>engagement metrics</strong>, increased <strong>follower base</strong>, and a more cohesive visual identity across its platforms. The continuous adaptation of themes, festivals, and trends has allowed Sweet Life Partner to remain dynamic and culturally connected—an essential factor in the world of digital matrimony.</p>",
    "distinct_features": "<ul><li><strong>Brand Identity Design</strong> – Created a premium logo and visual system using symbolic elements (rings, heart, initials).</li><li><strong>Trend-Based Campaigns</strong> – Designed graphics aligned with cultural events and viral social media trends (e.g., Dashain, Purnima).</li><li><strong>Emotional Storytelling</strong> – Used captions and visuals that reflect love, connection, and shared preferences.</li><li><strong>Platform Consistency</strong> – Maintained cohesive brand aesthetics across all social media channels.</li><li><strong>Engagement-Focused Strategy</strong> – Boosted interaction and follower growth through relatable, shareable creatives.</li></ul>",
    "category": 2,
    "slug": "digital-marketing-and-graphic-design-swe-Da8Vl"
  },
  {
    "id": 11,
    "name": "Brand Identity and Logo Design: Spark International Education Consultancy",
    "skills": [
      16,
      17,
      19,
      20
    ],
    "client": "Spark International Education Consultancy",
    "banner_image": "uploads/projects/projectimage/spark-final.jpg",
    "start_date": "2024-08-01",
    "end_date": null,
    "description": "<p>I created the logo for <strong>Spark International Education Consultancy</strong> to visually represent its mission of guiding students toward higher education and success. The design thoughtfully integrates multiple symbolic elements that together tell a story of knowledge, inspiration, and growth.</p><p>&nbsp;</p><p>At the heart of the logo is a <strong>student figure</strong>, depicted wearing a graduation cap, symbolizing achievement and academic accomplishment. This figure is holding a bright <strong>spark</strong> above their head, which represents the ignition of curiosity, motivation, and the pursuit of knowledge. The spark conveys the idea of inspiration—lighting the way forward for students as they navigate their educational journey.</p><p>&nbsp;</p><p>The <strong>diyo</strong> (a traditional lamp) is another key element in the logo, symbolizing enlightenment and guidance. It reflects the consultancy’s role as a beacon of hope and support, illuminating the path for students in their quest for education abroad or higher learning opportunities. This traditional element connects cultural heritage with modern aspirations, emphasizing that education is both a timeless and transformative force.</p><p>&nbsp;</p><p>Books are also incorporated into the design to signify the <strong>foundation of learning</strong> and the <strong>accumulation of knowledge</strong>. These books emphasize academic rigor, intellectual growth, and the resources that Spark International Education Consultancy provides to help students succeed.</p><p>&nbsp;</p><p>The color palette of the logo plays an important role in reinforcing these themes. The <strong>blue</strong> hues convey <strong>trust, professionalism, and stability</strong>—qualities essential in an education consultancy that students and parents rely on for guidance and support. Meanwhile, the <strong>orange</strong> tones introduce <strong>warmth, enthusiasm, and energy, capturing the spark of creativity and optimism</strong> that drives students toward their goals.</p><p>&nbsp;</p><p>Together, the blue and orange colors balance each other to create a vibrant yet dependable identity, illustrating that Spark International Education Consultancy is both a <strong>steady guide and an inspiring force.</strong> The combination of symbolic elements and meaningful colors creates a logo that is not only visually appealing but also deeply representative of the consultancy’s commitment to empowering students on their educational journey.</p>",
    "distinct_features": "<ul><li>Combines traditional <strong>diyo</strong> and books to symbolize guidance and knowledge.</li><li>Features a student with a graduation cap holding a spark, representing inspiration and achievement.</li><li>Uses <strong>blue</strong> for trust and professionalism, and <strong>orange</strong> for energy and creativity.</li><li>Balances cultural heritage with modern educational aspirations.</li></ul>",
    "category": 3,
    "slug": "brand-identity-and-logo-design-spark-int-RLg4Y"
  },
  {
    "id": 12,
    "name": "Building a Brand Logo for Retic Films",
    "skills": [
      16,
      17,
      20,
      28
    ],
    "client": "Retic Films",
    "banner_image": "uploads/projects/project/building-a-brand-logo-for-retic-films-0bf59f59.svg",
    "start_date": "2022-01-15",
    "end_date": null,
    "description": "<p>The logo for <strong>Retic Films</strong>, a photography and videography company based in Pokhara, is a visually striking and conceptually rich design that cleverly incorporates multiple symbolic elements related to filmmaking and visual storytelling. Here's a detailed description and interpretation:</p><p>&nbsp;</p><h3><strong>Logo Structure &amp; Symbolism</strong></h3><p><strong>1. Letterform Integration (R &amp; F)</strong></p><ul><li>The design smartly fuses the letters <strong>\"R\"</strong> and <strong>\"F\"</strong>—the initials of <strong>Retic Films</strong>—into a single, cohesive symbol.</li><li>The <strong>\"R\"</strong> forms the main body and outline of the design, crafted with smooth, rounded edges. This gives the logo a modern, minimalist look.</li><li>The <strong>\"F\"</strong> is embedded within the \"R\", styled with a film reel motif—highlighted by diagonal filmstrip perforations on the horizontal lines of the \"F\".</li></ul><p><strong>2. Film Reel Motif</strong></p><ul><li>The <strong>grey filmstrip elements</strong> not only form the arms of the \"F\" but also serve as a clear reference to the <strong>film reel</strong>, which is integral to videography and photography.</li><li>These details communicate the brand’s core services—cinematography, video production, and photography—instantly and effectively.</li></ul><p><strong>3. Jellyfish-like Shape</strong></p><ul><li>The overall silhouette subtly resembles a <strong>jellyfish</strong>, a clever nod to fluid motion and the underwater elegance often associated with creative flow and camera movement.</li><li>This organic form may also suggest flexibility, creativity, and the natural artistry involved in visual storytelling.</li></ul><p><strong>4. Shutter Button Representation</strong></p><ul><li>A <strong>white dot</strong> near the top of the \"R\" can be interpreted as a <strong>shutter button</strong>, an iconic symbol in photography.</li><li>This small but important detail connects the viewer immediately to the act of capturing a moment—a core part of Retic Films’ identity.</li></ul><p>&nbsp;</p><h3><strong>Typography &amp; Color Palette</strong></h3><p><strong>a. Text:</strong></p><ul><li><strong>\"RETIC\"</strong> is presented in bold, uppercase white letters, ensuring strong visibility and emphasis.</li><li><strong>\"FILMS\"</strong> is written in a lighter, gray tone, providing visual contrast and hierarchy between the brand name and its industry.</li></ul><p><strong>b. Color Scheme:</strong></p><ul><li>The background is a <strong>deep navy blue</strong> with subtle dot patterns, giving a cinematic and professional vibe.</li><li>The combination of <strong>white, gray, and blue</strong> projects trust, creativity, and clarity—values that align with a professional production house.</li></ul><p>&nbsp;</p><h3><strong>Design Aesthetic</strong></h3><ul><li><strong>Modern, minimal, and meaningful</strong>, the design balances clarity with creativity.</li><li>It is versatile and scalable—ideal for digital platforms, business cards, merchandise, and video watermarks.</li><li>The thoughtful layering of elements ensures that even when simplified or viewed from afar, the essence of the brand remains clear.</li></ul>",
    "distinct_features": "<ul><li><strong>R &amp; F Integration</strong> – Cleverly combines initials into one form.</li><li><strong>Film Reel Elements</strong> – Grey lines mimic filmstrips.</li><li><strong>Jellyfish Shape</strong> – Abstract form suggests creativity and flow.</li><li><strong>Shutter Button Dot</strong> – Symbolizes photography function.</li><li><strong>Bold Typography</strong> – \"RETIC\" stands out; \"FILMS\" complements subtly.</li><li><strong>Cinematic Colors</strong> – Deep blue, white, and grey reflect professionalism.</li><li><strong>Modern &amp; Minimal</strong> – Clean, scalable design for versatile use.</li></ul>",
    "category": 3,
    "slug": "building-a-brand-logo-for-retic-films-AOI59"
  },
  {
    "id": 14,
    "name": "Logo Design Project: Rotaract Club of Tribhuvan University",
    "skills": [
      16,
      17,
      20
    ],
    "client": "Rotaract Club of Tribhuvan University",
    "banner_image": "uploads/projects/project/logo-design-project-rotaract-club-of-tribhuvan-universi-0aade58b.svg",
    "start_date": "2023-07-01",
    "end_date": null,
    "description": "<h3><strong>Project Overview</strong></h3><p>The objective of this design project was to create a <strong>distinctive and meaningful logo</strong> for the <strong>Rotaract Club of Tribhuvan University</strong>, reflecting both the identity of the Rotaract movement and the unique cultural and academic heritage of Tribhuvan University. The logo had to be modern yet respectful of the legacy of both institutions, using official colors and symbols to ensure visual authenticity and brand consistency.</p><p>&nbsp;</p><h3><strong>Design Concept &amp; Elements</strong></h3><ol><li><strong>Rotaract Wheel Foundation</strong><ul><li>The outer gear-like structure is inspired by the <strong>official Rotaract wheel</strong>, symbolizing movement, teamwork, and service.</li><li><p>It serves as the structural backbone of the logo, representing the club’s alignment with global Rotaract values.</p><p>&nbsp;</p></li></ul></li><li><strong>Tribhuvan University Emblem Integration</strong><ul><li>At the core, the logo integrates a <strong>stylized blend of Tribhuvan University's emblem</strong>, specifically incorporating the <strong>lotus</strong> motif from the original logo.</li><li><p>The lotus symbolizes purity, wisdom, and knowledge—key pillars of the university's academic mission.</p><p>&nbsp;</p></li></ul></li><li><p><strong>Typography and Circular Layout</strong></p><ul><li>The text <strong>“Rotaract Club of Tribhuvan University”</strong> is carefully wrapped in a circular path around the inner wheel.</li><li>This technique emphasizes unity, wholeness, and community—fundamental principles of both the university and Rotaract.</li></ul><p>&nbsp;</p></li><li><strong>Color Palette</strong><ul><li><strong>Rotary Royal Blue</strong> is used for the outer gear and text, maintaining alignment with the <strong>Rotary International brand identity</strong>.</li><li><strong>Rotaract Pink</strong> is used in the central lotus and text highlights, representing the youthful, vibrant spirit of Rotaract clubs.</li><li><p>These two tones create a strong contrast while staying true to their respective organizations.</p><p>&nbsp;</p></li></ul></li></ol><h3><strong>Design Journey &amp; Challenges</strong></h3><ul><li><strong>Research Phase:</strong> I studied the official brand guidelines of Rotary International and examined various academic logos, particularly those of Tribhuvan University, to find symbolic synergy.</li><li><strong>Concept Development:</strong> I explored multiple sketches and vector compositions before deciding on a layout that could accommodate both logos without overpowering each other.</li><li><strong>Symbolic Integration:</strong> One of the main creative challenges was integrating the <strong>lotus from Tribhuvan University</strong> seamlessly into the <strong>Rotaract gear wheel</strong> while preserving both identities.</li><li><strong>Color Harmony:</strong> Careful consideration went into selecting the exact hex codes of Royal Blue and Rotaract Pink to ensure brand consistency.</li><li><strong>Typography:</strong> I chose a clean, bold typeface that is easily readable and balances the intricate design elements of the lotus and gear.</li></ul><p>&nbsp;</p><h3>Final Outcome</h3><p>The final logo is a harmonious blend of tradition and service:</p><ul><li>It <strong>visually connects the global Rotaract mission</strong> with the <strong>local academic pride of Tribhuvan University</strong>.</li><li>The logo is versatile and suitable for use on <strong>banners, official documents, social media, merchandise</strong>, and other digital/print media.</li><li>The symbolic and color choices make it <strong>instantly recognizable</strong>, giving the Rotaract Club of Tribhuvan University a professional and dignified identity.</li></ul><p>&nbsp;</p><h3>Tools Used</h3><ul><li><strong>Adobe Illustrator</strong> for vector design and precision.</li><li><strong>Figma/Photoshop</strong> (optional) for mockups and presentation.</li><li><strong>Color Picker &amp; Brand Guidelines</strong> for official color matching.</li></ul>",
    "distinct_features": "<ul><li><strong>Rotaract Wheel Base</strong> – Represents service, unity, and the global Rotaract identity.</li><li><strong>Lotus Blend with TU Emblem</strong> – Symbolizes wisdom and the essence of Tribhuvan University.</li><li><strong>Rotary Royal Blue</strong> – Reflects Rotary’s official branding and trust.</li><li><strong>Rotaract Pink Highlights</strong> – Adds vibrance and youthfulness tied to Rotaract spirit.</li><li><strong>Circular Text Layout</strong> – Encircles the logo to signify inclusiveness and community.</li></ul>",
    "category": 3,
    "slug": "logo-design-project-rotaract-club-of-tri-PFlg1"
  },
  {
    "id": 15,
    "name": "Building Trust Through Bold Design: The BBT Logo Project",
    "skills": [
      16,
      17,
      19,
      20
    ],
    "client": "BBT",
    "banner_image": "uploads/projects/projectimage/BBT Final.png",
    "start_date": "2025-03-01",
    "end_date": null,
    "description": "<p>The logo for <strong>BBT (Business Built on Trust)</strong> was created to visually represent the company’s identity as a <strong>Pokhara-based, one-stop wholesale destination</strong> for <strong>pellet feed, agricultural supplies, and grocery items</strong>.</p><p>&nbsp;As a <strong>growing group of companies</strong>, including <strong>BBT Agro Pvt. Ltd.</strong> and <strong>BBT General Stores and Suppliers Pvt. Ltd.</strong>, the brand required a <strong>bold, clean, and unified identity</strong> that reflects <strong>trust, professionalism, and sectoral diversity</strong>.</p><p>&nbsp;</p><h3><strong>Design Concept</strong></h3><p>The logo design follows a <strong>geometric and abstract minimalist approach</strong>, integrating meaning into both form and structure:</p><ul><li><strong>Geometric Custom Emblem</strong>: The symbol is meticulously constructed using balanced geometric shapes to form a cohesive, modern visual identity.</li><li><strong>Hidden Initials (B, B, T)</strong>: The emblem creatively incorporates the letters <strong>B, B, and T</strong>, subtly woven into the negative and positive spaces, inviting curiosity and engagement.</li><li><strong>Leaf/Sprout Motif</strong>: The abstract shape hints at a <strong>leaf or a growing field</strong>, representing <strong>sustainability, agriculture, and organic growth</strong>—core themes across BBT’s businesses.</li><li><strong>Scalable Identity</strong>: Designed to adapt across BBT’s companies and services while maintaining strong brand recognition in both digital and physical formats.</li></ul><p>&nbsp;</p><h3><strong>Color Theory</strong></h3><p><strong>1. Teal Green (#00A89D)</strong></p><ul><li>Represents <strong>freshness, stability</strong>, and <strong>agricultural connection</strong>.</li><li>Conveys trust and vitality—key values in BBT’s agro and feed operations.</li></ul><p><strong>2. Golden Yellow (#FFD400)</strong></p><ul><li>Symbolizes <strong>energy, optimism</strong>, and <strong>abundance</strong>.</li><li>Highlights BBT’s product diversity and dynamic business outlook.</li></ul><p><strong>3. Deep Navy Blue (#001F4D)</strong></p><ul><li>Used for the text and core acronym.</li><li><p>Signifies <strong>corporate strength, trustworthiness, and professionalism</strong>, reinforcing the brand promise in the tagline.</p><p>&nbsp;</p></li></ul><p>Together, these colors reflect a <strong>strategic balance</strong>:</p><ul><li><strong>Blue</strong> for trust and authority</li><li><strong>Green</strong> for sustainability and growth</li><li><strong>Yellow</strong> for energy and positivity</li></ul><p>&nbsp;</p><h3><strong>Typography</strong></h3><ul><li>The <strong>BBT acronym</strong> uses a <strong>bold, custom sans-serif font</strong> with clean geometry to ensure <strong>strength and simplicity</strong>.</li><li>The tagline “<strong>BUSINESS BUILT ON TRUST</strong>” is rendered in an <strong>uppercase, minimalist typeface</strong> that complements the bold logo while offering clarity and structure.</li><li>Typography aligns with BBT’s <strong>efficient, modern, and honest communication style</strong>.</li></ul><p>&nbsp;</p><h3><strong>Brand Extension &amp; Subsidiaries</strong></h3><p>This master brand identity flexibly extends to its two subsidiaries:</p><ul><li><strong>BBT Agro Pvt. Ltd.</strong> – Focused on <strong>livestock feed, fertilizers, and farm essentials</strong>.</li><li><strong>BBT General Stores and Suppliers Pvt. Ltd.</strong> – A trusted name for <strong>grocery and wholesale retail</strong>.</li></ul><p>&nbsp;</p><p>The unified identity system allows BBT to maintain a <strong>cohesive brand language</strong> across all entities while respecting their <strong>individual market roles</strong>.</p><p>&nbsp;</p><h3>Final Outcome</h3><p>The final logo delivers:</p><ul><li>A <strong>professional, modern, and scalable visual identity</strong>.</li><li>Strong visual storytelling through <strong>custom shapes and hidden symbolism</strong>.</li><li>Brand alignment for both <strong>BBT Agro Pvt. Ltd.</strong> and <strong>BBT General Stores and Suppliers Pvt. Ltd.</strong></li><li><p>Effective usability across <strong>store signage, packaging, uniforms, business cards, websites, and social media</strong>.</p><p>&nbsp;</p></li></ul><p>This logo confidently communicates <strong>BBT’s vision of trust, growth, and diversity</strong>, solidifying its position as a leading group in Pokhara’s wholesale and agricultural sectors.</p>",
    "distinct_features": "<ul><li><strong>Geometric abstract logo</strong> with hidden letters <strong>B, B, and T</strong>.</li><li><strong>Symbolic leaf/sprout form</strong> representing growth and agriculture.</li><li><strong>Color trio</strong> (Teal, Yellow, Navy) for trust, energy, and sustainability.</li><li><strong>Unified brand identity</strong> for BBT Agro &amp; General Stores subsidiaries.</li></ul>",
    "category": 3,
    "slug": "building-trust-through-bold-design-the-b-8zu9U"
  },
  {
    "id": 16,
    "name": "Web Development and System Enhancement for NDRRMA (National Disaster Risk Reduction and Management Authority)",
    "skills": [
      1,
      2,
      34,
      4,
      10,
      11,
      14,
      15,
      26
    ],
    "client": "National Disaster Risk Reduction and Management Authority",
    "banner_image": "uploads/projects/projectimage/ndrrma.png",
    "start_date": "2025-03-18",
    "end_date": "2025-07-31",
    "description": "<p>The project involved ongoing development and maintenance of the official platform for the National Disaster Risk Reduction and Management Authority (NDRRMA), Nepal. The platform serves as a centralized digital system to manage, monitor, and disseminate disaster-related data, reports, and updates. As part of the Youth Innovation Lab’s technical team, I contributed as a backend developer and played a collaborative role in project coordination between government stakeholders and the development team.</p><p>&nbsp;</p><p><strong>Key Contributions and Responsibilities:</strong></p><ul><li><strong>Backend Feature Enhancements:</strong><ul><li>Worked on a Django-based backend to implement and update core features such as <strong>model signals</strong> for automated field population and logging.</li><li>Managed <strong>database schema migrations</strong>, ensuring backward compatibility and safe deployment during live updates.</li><li>Customized the <strong>Django admin panel</strong> to streamline data management for internal users, including custom filters, inlines, and admin actions tailored to NDRRMA's workflows.</li></ul></li><li><strong>Serializer and API Updates:</strong><ul><li>Updated and optimized <strong>Django REST Framework serializers</strong> to support new frontend features and improve API performance.</li><li>Collaborated closely with frontend developers to ensure accurate data serialization/deserialization for seamless UI integration.</li></ul></li><li><strong>Cross-functional Coordination:</strong><ul><li>Acted as a <strong>bridge between the NDRRMA officials and the development team</strong>, ensuring that technical solutions were aligned with institutional expectations and functional requirements.</li><li>Participated in <strong>requirement gathering meetings</strong>, translated non-technical input into actionable development tasks, and regularly provided feedback to stakeholders on progress and implementation.</li></ul></li><li><strong>Quality Assurance and Flow Management:</strong><ul><li>Carefully studied and documented the existing codebase and project structure to maintain continuity and reduce risks during feature additions.</li><li><p>Ensured a <strong>smooth development workflow</strong> by managing version control, environment consistency, and adhering to development best practices.</p><p>&nbsp;</p></li></ul></li></ul><p><strong>Impact:</strong><br>This project significantly improved the functionality and maintainability of the NDRRMA platform, supporting the government’s mission to strengthen disaster preparedness and response. My contributions helped deliver timely updates and features while maintaining coordination across technical and non-technical stakeholders.</p>",
    "distinct_features": "<ul><li><strong>Admin Panel Customization:</strong> Tailored the Django admin interface with custom filters, inlines, and actions for efficient data management by NDRRMA staff.</li><li><strong>Signal-Based Automation:</strong> Implemented Django signals to automate backend tasks like timestamping and relational data updates.</li><li><strong>API and Serializer Enhancements:</strong> Updated DRF serializers to support new frontend requirements and improve data flow between frontend and backend.</li><li><strong>Government Coordination:</strong> Acted as liaison between NDRRMA officials and the development team to ensure alignment with national disaster management goals.</li></ul>",
    "category": 1,
    "slug": "web-development-and-system-enhancement-f-Wgary"
  },
  {
    "id": 18,
    "name": "Rooted in Culture, Crafted for Celebration: The Mama Ghar Entertainment Identity",
    "skills": [
      16,
      17,
      19,
      20
    ],
    "client": "Mamaghar Entertainment",
    "banner_image": "uploads/projects/projectimage/mamaghar-final.png",
    "start_date": "2024-07-29",
    "end_date": "2024-08-18",
    "description": "<p><strong>Mama Ghar Entertainment</strong> is an event management company that emphasizes cultural roots, warmth, togetherness, and joyful celebrations. The brand name “Mama Ghar” translates to “Maternal Uncle’s Home” in Nepali, evoking a strong sense of nostalgia, safety, and belonging—a place associated with joy, childhood memories, and festive gatherings.</p><p>&nbsp;</p><h3><strong>Logo Design Concept</strong></h3><h4><strong>1. Traditional Nepali House Silhouette</strong></h4><ul><li>The central structure outlines a <strong>typical Nepali home</strong> with <strong>golden strokes</strong>, symbolizing cultural heritage, warmth, and familial comfort.</li><li>The house’s layered roof and windows are minimalist yet distinct, emphasizing authenticity without visual clutter.</li></ul><h4><strong>2. Children Illustration (Vanji &amp; Vanja)</strong></h4><ul><li>Two stylized children figures at the base represent <strong>Vanji and Vanja</strong>, symbolic of innocence, fun, and joyful togetherness.</li><li>Their hand-in-hand posture underlines <strong>unity, inclusivity, and the familial essence</strong> of the brand’s services.</li></ul><h4><strong>3. Bold Typography</strong></h4><ul><li>The brand name <strong>\"MAMA GHAR\"</strong> is written in <strong>bold, white, uppercase sans-serif</strong> font, exuding confidence and clarity.</li><li>The clean, modern font balances well with the traditional elements of the house.</li></ul><h4><strong>4. Subtext - ENTERTAINMENT</strong></h4><ul><li>Positioned underneath in <strong>golden uppercase serif</strong>, the word <strong>\"ENTERTAINMENT\"</strong> reflects sophistication and elegance.</li><li>The serif font here adds contrast and a hint of celebration, fitting for an events company.</li></ul><h4><strong>5. Starburst/Flare Detail</strong></h4><ul><li>A <strong>golden starburst</strong> appears within the letters “M” and “R” of \"MAMA GHAR\", adding a celebratory and vibrant touch.</li><li>This visual spark represents light, excitement, and highlights the company's role in illuminating joyful moments.</li></ul><p>&nbsp;</p><h3><strong>Brand Colors</strong></h3><figure class=\"table\"><table><thead><tr><th>Color</th><th>Hex Code</th><th>Meaning in Context</th></tr></thead><tbody><tr><td><strong>Gold</strong></td><td>#D4AF37</td><td>Luxury, celebration, tradition, festivity</td></tr><tr><td><strong>White</strong></td><td>#FFFFFF</td><td>Simplicity, clarity, trust</td></tr><tr><td><strong>Black</strong></td><td>#000000</td><td>Sophistication, elegance, depth</td></tr></tbody></table></figure><p>&nbsp;</p><p>These colors combine to reflect the <strong>premium, culturally rooted, and joyous</strong> nature of the brand.</p><p>&nbsp;</p><h3><strong>Typography</strong></h3><ul><li><strong>Primary Font (\"MAMA GHAR\")</strong>:<ul><li><strong>Style</strong>: Bold, Sans-serif, All Caps</li><li><strong>Attributes</strong>: Strong, clean, and modern—ensures legibility and brand authority.</li></ul></li><li><strong>Secondary Font (\"ENTERTAINMENT\")</strong>:<ul><li><strong>Style</strong>: Elegant Serif, All Caps, Gold-colored</li><li><strong>Attributes</strong>: Stylish, traditional, and refined—conveys celebration and class.</li></ul></li></ul><p>&nbsp;</p><h3><strong>Design Tone &amp; Message</strong></h3><p>The logo conveys a perfect balance between <strong>modern professionalism</strong> and <strong>cultural nostalgia</strong>. It tells a story—of home, warmth, childhood joy, and unforgettable events—making it ideal for an event management company that aims to create lasting memories.</p><p>&nbsp;</p><h3><strong>Use Cases</strong></h3><ul><li>Business cards, banners, merchandise, social media branding</li><li>Event backdrops, LED screens, and digital invites</li><li>Watermarks for photos/videos produced at events</li></ul>",
    "distinct_features": "<ul><li><strong>Traditional Nepali House</strong> – Gold outline reflects cultural roots and warmth.</li><li><strong>Sun &amp; Moon Symbols</strong> – Starbursts represent elements from the Nepal flag.</li><li><strong>Playful Children</strong> – Vanji &amp; Vanja symbolize joy and togetherness.</li><li><strong>Bold + Elegant Fonts</strong> – Strong main title with classy golden subtext.</li></ul>",
    "category": 3,
    "slug": "rooted-in-culture-crafted-for-celebratio-pWYMl"
  },
  {
    "id": 19,
    "name": "Forged in Foil: Crafting the Iconic Identity of Arima Aluminium Packaging",
    "skills": [
      16,
      17,
      19,
      20
    ],
    "client": "Arima Aluminium Foil Container",
    "banner_image": "uploads/projects/project/forged-in-foil-crafting-the-iconic-identity-of-arima-al-a001e0e3.svg",
    "start_date": "2023-05-01",
    "end_date": null,
    "description": "<p>Arima Aluminium Packaging, a Pokhara-based manufacturer of aluminium foil containers and packaging products, needed a strong and professional identity to represent its brand across Nepal. The goal was to craft a logo that reflected the company’s industry—durable, clean, and precise—while appealing visually to both B2B and consumer audiences.</p><p>&nbsp;</p><h3><strong>Conceptual Foundation</strong></h3><p>The logo was conceptualized to embody Arima’s core brand pillars: <strong>structure, reliability, and clarity</strong>. It needed to represent the <strong>product's physical nature</strong> while establishing a <strong>timeless and strong brand mark</strong>.</p><p>&nbsp;</p><h3><strong>Design Components and Their Meaning</strong></h3><h4>1. <strong>Monogram ‘A’ Structure</strong></h4><ul><li>A bold, geometric <strong>‘A’</strong> was used as the central form.</li><li>Its sharp edges and symmetry symbolize <strong>stability, precision, and structural strength</strong>—core traits of aluminium packaging.</li><li>The shape also suggests <strong>industrial efficiency</strong> and <strong>engineering clarity</strong>, aligning with Arima’s production standards.</li></ul><h4>2. <strong>Foil-Inspired Detailing</strong></h4><ul><li>The inner lines and layering of the monogram were designed to resemble <strong>foil strips</strong> or <strong>stacked containers</strong>.</li><li>This visual reference connects the logo directly to <strong>aluminium foil packaging</strong>, reinforcing the industry relevance without relying on literal imagery.</li></ul><h4>3. <strong>Reflective Silver Finish</strong></h4><ul><li>A <strong>metallic silver color</strong> palette was used to imitate the <strong>polished surface of aluminium foil</strong>, giving the logo a premium, hygienic, and high-tech feel.</li><li>This not only aligns with the product’s appearance but also evokes trust and quality.</li></ul><h4>4.<strong> Solid Black Background</strong></h4><ul><li>The choice of a <strong>black background</strong> serves two purposes:<ul><li>It <strong>enhances contrast</strong>, making the silver monogram pop with clarity and definition.</li><li>It <strong>adds sophistication and power</strong>, giving the brand a sleek and professional presence in both print and digital environments.</li></ul></li></ul><p>&nbsp;</p><h3><strong>Final Outcome</strong></h3><p>The finished logo is a <strong>minimal yet meaningful mark</strong> that is instantly recognizable and scalable across platforms—whether on foil lids, delivery boxes, business cards, or the website. It reflects Arima’s identity as a <strong>modern, reliable, and quality-driven manufacturer</strong>, setting the tone for the company’s full branding and digital journey.</p>",
    "distinct_features": "<ul><li><strong>Monogram 'A' Form</strong> – Represents structure, stability, and sharpness.</li><li><strong>Foil Layer Interpretation</strong> – Suggests layered containers or aluminium strips.</li><li><strong>Metallic Silver Finish</strong> – Evokes the polished, reflective nature of foil.</li><li><strong>Bold Black Contrast</strong> – Enhances clarity, strength, and premium appeal.</li></ul>",
    "category": 3,
    "slug": "forged-in-foil-crafting-the-iconic-ident-jFXzZ"
  },
  {
    "id": 20,
    "name": "Building a Bold Digital Presence for Arima Aluminium Packaging",
    "skills": [
      35,
      5,
      6,
      16,
      17,
      19,
      20,
      28
    ],
    "client": "Arima Aluminium Foil Container",
    "banner_image": "uploads/projects/project/building-a-bold-digital-presence-for-arima-aluminium-pa-2c8a1a02.svg",
    "start_date": "2023-05-01",
    "end_date": "2023-06-30",
    "description": "<p>To help <i>Arima Aluminium Packaging</i> establish a strong foothold in the Nepali market, a comprehensive <strong>graphics and digital marketing strategy</strong> was executed—focusing on <strong>brand visibility, product awareness, and digital reach</strong>. This end-to-end branding project was done in collaboration with <strong>Ambirise IT Solution</strong>.</p><p>&nbsp;</p><h3><strong>Key Deliverables &amp; Highlights:</strong></h3><h4><strong>1. Brand Visibility &amp; Positioning</strong></h4><ul><li>Developed a <strong>clear visual identity system</strong> based on the logo design.</li><li><p>Maintained consistency across all brand touchpoints—from packaging and print to digital channels.</p><p>&nbsp;</p></li></ul><h4><strong>2. Ad Campaigns &amp; Social Media Strategy</strong></h4><ul><li>Launched <strong>targeted advertising campaigns</strong> to boost recognition and reach new markets across Nepal.</li><li>Designed <strong>engaging social media creatives</strong> that highlighted services, product features, and company values.</li></ul><p>&nbsp;</p><h4><strong>3. Graphic Design for Marketing Collateral</strong></h4><ul><li>Created a cohesive series of <strong>visuals and promotional designs</strong> focused on:<ul><li>Core products (foil containers, packaging solutions)</li><li>Service benefits (hygiene, durability, local manufacturing)</li><li>Company information and updates</li></ul></li><li>Ensured all graphics aligned with the brand’s <strong>clean, industrial, and trustworthy aesthetic</strong>.</li></ul><p>&nbsp;</p><h4><strong>4. WordPress Website Development</strong></h4><ul><li>Designed and developed a <strong>responsive, SEO-ready WordPress website</strong> to showcase:<ul><li>Product catalog</li><li>Company profile and mission</li><li>Contact and inquiry forms</li></ul></li><li>The website became a <strong>central platform for leads, product information, and business credibility</strong>.</li></ul><p>&nbsp;</p><h3><strong>Impact:</strong></h3><p>The brand now has a <strong>professional and cohesive presence</strong>, both online and offline. Through design consistency, digital campaigns, and a functional website, Arima Aluminium Packaging successfully positioned itself as a <strong>modern, dependable packaging manufacturer</strong> ready to serve customers nationwide.</p>",
    "distinct_features": "<ul><li><strong>Consistent Visual Branding</strong> – Unified graphic design across social media, print, and packaging.</li><li><strong>Targeted Ad Campaigns</strong> – Ran promotional campaigns to boost local and national visibility.</li><li><strong>Informative &amp; Product-Focused Designs</strong> – Creatives highlighting services, product benefits, and company identity.</li><li><strong>Responsive WordPress Website</strong> – Central platform for showcasing products and generating business inquiries.</li></ul>",
    "category": 2,
    "slug": "building-a-bold-digital-presence-for-ari-bgvxk"
  },
  {
    "id": 21,
    "name": "Redefining Team Identity: Official Jersey Design for Pokhara University Cricket Club",
    "skills": [
      16,
      17,
      19
    ],
    "client": "Pokhara University Cricket Club",
    "banner_image": "uploads/projects/project/redefining-team-identity-official-jersey-design-for-pok-01eaf5ab.svg",
    "start_date": "2024-05-01",
    "end_date": null,
    "description": "<p>I had the opportunity to work on a jersey design project for <strong>Pokhara University Cricket Club</strong>, where I designed their official team jersey. This was a rewarding project that involved creative exploration and collaboration to ensure the final output truly represented the team’s spirit and identity.</p><p>&nbsp;</p><p><strong>Project Highlights:</strong></p><ul><li>Designed multiple jersey concepts for PUCC and worked closely with the team to finalize the approved design.</li><li>Developed the <strong>jersey patterns</strong> and vector artwork using <strong>Adobe Illustrator</strong>, ensuring a professional and scalable design that would work seamlessly for printing.</li><li>Created a <strong>realistic jersey mockup</strong> in <strong>Adobe Photoshop</strong> to visualize how the design would look when worn by players.</li><li>Incorporated subtle elements like a gradient background and mountain silhouette to reflect the essence of Pokhara and its connection to nature.</li><li>Delivered a clean, dynamic, and modern look with a focus on usability for sports performance wear.</li></ul><p>&nbsp;</p><p><strong>Outcome:</strong><br>The final approved jersey design is now proudly worn by all players of the <strong>Pokhara University Cricket Club</strong>, creating a strong visual identity for the team both on and off the field.</p><p>Tools Used:<br>- Adobe Illustrator (Vector Patterns)<br>- Adobe Photoshop (Mockups &amp; Presentation)</p><p>&nbsp;</p><p>This project reflects my expertise in <strong>sportswear design</strong>, attention to detail, and ability to translate a team’s vision into a compelling visual identity.</p>",
    "distinct_features": "<ul><li><strong>Modern Gradient Aesthetic</strong>: A sleek gradient base with subtle tones to create a dynamic and premium sportswear look.</li><li><strong>Mountain Silhouette Detail</strong>: Represents the essence of Pokhara and adds a unique local identity to the design.</li><li><strong>Vector Precision</strong>: Designed entirely in Adobe Illustrator for sharp, scalable print quality.</li><li><strong>Realistic Mockup Presentation</strong>: Visualized in Adobe Photoshop to showcase how the jersey appears in real-life wear.</li></ul>",
    "category": 2,
    "slug": "redefining-team-identity-official-jersey-VcOkL"
  }
]
```

### `projects.projectimage` (58 records)

```json
[
  {
    "id": 4,
    "project": 1,
    "image": "uploads/projects/projectimage/knox-middleware.png",
    "caption": "Custom Knox Middleware Implementation"
  },
  {
    "id": 5,
    "project": 1,
    "image": "uploads/projects/projectimage/real-time-consumers.png",
    "caption": "Websocket Consumer Setup"
  },
  {
    "id": 9,
    "project": 8,
    "image": "uploads/projects/projectimage/a-complete-branding-journey-spark-international-educati-d3100041.svg",
    "caption": "Final Logo of Spark International Education"
  },
  {
    "id": 10,
    "project": 8,
    "image": "uploads/projects/projectimage/a-complete-branding-journey-spark-international-educati-2ef62380.svg",
    "caption": "Cover Design for Social Media Handles"
  },
  {
    "id": 11,
    "project": 8,
    "image": "uploads/projects/projectimage/a-complete-branding-journey-spark-international-educati-74abfa5b.svg",
    "caption": "Promoting Engagement with the Company Clients through Digital Marketing"
  },
  {
    "id": 12,
    "project": 8,
    "image": "uploads/projects/projectimage/a-complete-branding-journey-spark-international-educati-ef481fde.svg",
    "caption": "Social Media Designs related to Vacancy"
  },
  {
    "id": 13,
    "project": 8,
    "image": "uploads/projects/projectimage/a-complete-branding-journey-spark-international-educati-288b90a0.svg",
    "caption": "Design representing Higher Abroad Studies"
  },
  {
    "id": 15,
    "project": 7,
    "image": "uploads/projects/projectimage/advanced-assignment-and-student-management-system-with--717afc6f.svg",
    "caption": "Project Sequence Diagram"
  },
  {
    "id": 16,
    "project": 7,
    "image": "uploads/projects/projectimage/advanced-assignment-and-student-management-system-with--329cd452.svg",
    "caption": "Project Use Case Diagram"
  },
  {
    "id": 17,
    "project": 7,
    "image": "uploads/projects/projectimage/advanced-assignment-and-student-management-system-with--3e6dfecf.svg",
    "caption": "Plagiarism Checker Teacher Dashboard"
  },
  {
    "id": 18,
    "project": 7,
    "image": "uploads/projects/projectimage/advanced-assignment-and-student-management-system-with--d3881380.svg",
    "caption": "Marks Marking View"
  },
  {
    "id": 19,
    "project": 7,
    "image": "uploads/projects/projectimage/advanced-assignment-and-student-management-system-with--33af5e54.svg",
    "caption": "Edu-Assist Dashboard"
  },
  {
    "id": 20,
    "project": 9,
    "image": "uploads/projects/projectimage/web-responsive-frontend.png",
    "caption": "Web Responsive Home Page (v2)"
  },
  {
    "id": 21,
    "project": 9,
    "image": "uploads/projects/projectimage/code-env-frontend.png",
    "caption": "Code Environment Frontend"
  },
  {
    "id": 23,
    "project": 3,
    "image": "uploads/projects/projectimage/brand-identity-logo-design-for-before-education-consult-85c9a8e9.svg",
    "caption": "Before Logo Concept Visualization"
  },
  {
    "id": 24,
    "project": 3,
    "image": "uploads/projects/projectimage/brand-identity-logo-design-for-before-education-consult-7a4b9b03.svg",
    "caption": "Final Approved Logo"
  },
  {
    "id": 25,
    "project": 5,
    "image": "uploads/projects/projectimage/rebranding-the-sweet-life-partner-logo-852b6a1f.svg",
    "caption": "Visualisation of the SLP Logo concept"
  },
  {
    "id": 26,
    "project": 5,
    "image": "uploads/projects/projectimage/rebranding-the-sweet-life-partner-logo-18c297ea.svg",
    "caption": "Final Rebranded Logo"
  },
  {
    "id": 28,
    "project": 10,
    "image": "uploads/projects/projectimage/digital-marketing-and-graphic-design-sweet-life-partner-564a638d.svg",
    "caption": "Social Media Cover"
  },
  {
    "id": 29,
    "project": 10,
    "image": "uploads/projects/projectimage/digital-marketing-and-graphic-design-sweet-life-partner-49d51219.svg",
    "caption": "It's always better with your love"
  },
  {
    "id": 30,
    "project": 10,
    "image": "uploads/projects/projectimage/digital-marketing-and-graphic-design-sweet-life-partner-fb961cfc.svg",
    "caption": "Christmas Themed Logo"
  },
  {
    "id": 31,
    "project": 10,
    "image": "uploads/projects/projectimage/digital-marketing-and-graphic-design-sweet-life-partner-dec7de5d.svg",
    "caption": "Unique Design to match the partner with same preferences."
  },
  {
    "id": 32,
    "project": 10,
    "image": "uploads/projects/projectimage/digital-marketing-and-graphic-design-sweet-life-partner-0d519ffc.svg",
    "caption": "Occasion based Love Design"
  },
  {
    "id": 33,
    "project": 10,
    "image": "uploads/projects/projectimage/digital-marketing-and-graphic-design-sweet-life-partner-74547d03.svg",
    "caption": "Another Occasion based Celebratory Design"
  },
  {
    "id": 34,
    "project": 10,
    "image": "uploads/projects/projectimage/digital-marketing-and-graphic-design-sweet-life-partner-da77b95c.svg",
    "caption": "Design based on current trends"
  },
  {
    "id": 35,
    "project": 10,
    "image": "uploads/projects/projectimage/digital-marketing-and-graphic-design-sweet-life-partner-de439adb.svg",
    "caption": "Design based on trends"
  },
  {
    "id": 36,
    "project": 6,
    "image": "uploads/projects/projectimage/tournament-digital-support-for-kandel-consultancy-cup-a02a36e8.svg",
    "caption": "Logo Design for the event Kandel Consultancy Cup"
  },
  {
    "id": 37,
    "project": 6,
    "image": "uploads/projects/projectimage/tournament-digital-support-for-kandel-consultancy-cup-3a885e3d.svg",
    "caption": "Trophy Display Design with 3d Trophy designed"
  },
  {
    "id": 38,
    "project": 6,
    "image": "uploads/projects/projectimage/tournament-digital-support-for-kandel-consultancy-cup-c3907ec6.svg",
    "caption": "League Table for the official matches for the competition"
  },
  {
    "id": 39,
    "project": 6,
    "image": "uploads/projects/projectimage/tournament-digital-support-for-kandel-consultancy-cup-e9092745.svg",
    "caption": "Group Draw for the Kandel Cup Teams"
  },
  {
    "id": 40,
    "project": 6,
    "image": "uploads/projects/projectimage/tournament-digital-support-for-kandel-consultancy-cup-42b07ca6.svg",
    "caption": "Introducing the Winners of the Cup"
  },
  {
    "id": 41,
    "project": 11,
    "image": "uploads/projects/projectimage/spark-concept.png",
    "caption": "Explanation of the Representation of the elements in the Spark Logo"
  },
  {
    "id": 42,
    "project": 11,
    "image": "uploads/projects/projectimage/representational-spark.jpg",
    "caption": "Representational Description of Spark Logo"
  },
  {
    "id": 43,
    "project": 12,
    "image": "uploads/projects/projectimage/building-a-brand-logo-for-retic-films-cb476919.svg",
    "caption": "Visual Representation of the Logo Concept"
  },
  {
    "id": 44,
    "project": 12,
    "image": "uploads/projects/projectimage/building-a-brand-logo-for-retic-films-3f828437.svg",
    "caption": "Final Approved Logo"
  },
  {
    "id": 47,
    "project": 14,
    "image": "uploads/projects/projectimage/logo-design-project-rotaract-club-of-tribhuvan-universi-a4af7ce0.svg",
    "caption": "Final Approved Logo"
  },
  {
    "id": 48,
    "project": 14,
    "image": "uploads/projects/projectimage/logo-design-project-rotaract-club-of-tribhuvan-universi-2c8daa0e.svg",
    "caption": "Logo Concept Visualization with component meanings"
  },
  {
    "id": 49,
    "project": 15,
    "image": "uploads/projects/projectimage/BBT Final.png",
    "caption": "FInal Logo for BBT Groups"
  },
  {
    "id": 50,
    "project": 16,
    "image": "uploads/projects/projectimage/web-development-and-system-enhancement-for-ndrrma-natio-c6c30618.svg",
    "caption": "Home Page for the NDRRMA website"
  },
  {
    "id": 51,
    "project": 16,
    "image": "uploads/projects/projectimage/web-development-and-system-enhancement-for-ndrrma-natio-5ff0d54f.svg",
    "caption": "Bulletin Featured Page for NDRRMA"
  },
  {
    "id": 52,
    "project": 16,
    "image": "uploads/projects/projectimage/web-development-and-system-enhancement-for-ndrrma-natio-bcb8f046.svg",
    "caption": "Publication List Page"
  },
  {
    "id": 53,
    "project": 16,
    "image": "uploads/projects/projectimage/web-development-and-system-enhancement-for-ndrrma-natio-10ed5dd3.svg",
    "caption": "NDRRMA, Ministry of Home Affairs, Government of Nepal"
  },
  {
    "id": 54,
    "project": 15,
    "image": "uploads/projects/projectimage/trademark-bbt.png",
    "caption": "Logo Abstract Visualization"
  },
  {
    "id": 55,
    "project": 15,
    "image": "uploads/projects/projectimage/abstract-bbt.png",
    "caption": "Abstract Concept Description"
  },
  {
    "id": 56,
    "project": 15,
    "image": "uploads/projects/projectimage/bbt-concept.png",
    "caption": "Color Theory and Typography Concept"
  },
  {
    "id": 57,
    "project": 15,
    "image": "uploads/projects/projectimage/4.png",
    "caption": "Final Approved Logo for BBT Agro, a subsidiary company"
  },
  {
    "id": 60,
    "project": 18,
    "image": "uploads/projects/projectimage/mamaghar-final.png",
    "caption": "Final Approved Logo for Mama Ghar Entertainment"
  },
  {
    "id": 61,
    "project": 18,
    "image": "uploads/projects/projectimage/explanation-mamaghar.png",
    "caption": "Visualization of the Concept for the Logo"
  },
  {
    "id": 62,
    "project": 19,
    "image": "uploads/projects/projectimage/forged-in-foil-crafting-the-iconic-identity-of-arima-al-49d198f0.svg",
    "caption": "Final Approved Arima Logo"
  },
  {
    "id": 63,
    "project": 19,
    "image": "uploads/projects/projectimage/forged-in-foil-crafting-the-iconic-identity-of-arima-al-ec200c12.svg",
    "caption": "Visualization of the Concept for the Logo"
  },
  {
    "id": 64,
    "project": 20,
    "image": "uploads/projects/projectimage/building-a-bold-digital-presence-for-arima-aluminium-pa-9e2b8cb3.svg",
    "caption": "Product Design for Arima Packaging"
  },
  {
    "id": 65,
    "project": 20,
    "image": "uploads/projects/projectimage/building-a-bold-digital-presence-for-arima-aluminium-pa-59370fa4.svg",
    "caption": "Brand Banner"
  },
  {
    "id": 66,
    "project": 20,
    "image": "uploads/projects/projectimage/building-a-bold-digital-presence-for-arima-aluminium-pa-d31cace1.svg",
    "caption": "Final Approved Logo"
  },
  {
    "id": 67,
    "project": 21,
    "image": "uploads/projects/projectimage/redefining-team-identity-official-jersey-design-for-pok-284fa9ce.svg",
    "caption": "Final Jersey for PUCC"
  },
  {
    "id": 68,
    "project": 21,
    "image": "uploads/projects/projectimage/redefining-team-identity-official-jersey-design-for-pok-b533784e.svg",
    "caption": "Players in the final printed jersey"
  }
]
```

### `projects.projectlink` (16 records)

```json
[
  {
    "id": 1,
    "project": 3,
    "name": "Behance",
    "link": "https://www.behance.net/gallery/223839867/Logo-Design-Before-Education"
  },
  {
    "id": 2,
    "project": 1,
    "name": "Github",
    "link": "https://github.com/Riwaj9786/chat_api"
  },
  {
    "id": 4,
    "project": 4,
    "name": "Github",
    "link": "https://github.com/Sarbam-Foods/backend-web"
  },
  {
    "id": 6,
    "project": 8,
    "name": "Website",
    "link": "https://sparkeducation.com.np/"
  },
  {
    "id": 7,
    "project": 8,
    "name": "Facebook",
    "link": "https://www.facebook.com/spark.shishuwa"
  },
  {
    "id": 8,
    "project": 7,
    "name": "Github",
    "link": "https://github.com/Riwaj9786/advanced_sms"
  },
  {
    "id": 9,
    "project": 9,
    "name": "Website",
    "link": "https://riwajbhurtel.com.np/"
  },
  {
    "id": 10,
    "project": 9,
    "name": "Github",
    "link": "https://github.com/Riwaj9786/portfolio"
  },
  {
    "id": 11,
    "project": 9,
    "name": "Figma v1",
    "link": "https://www.figma.com/design/OT5o7tfUQKVVcql5ZAiOTu/Portfolio?node-id=0-1&t=LJlwXK6KUF1bSqas-1"
  },
  {
    "id": 12,
    "project": 3,
    "name": "Facebook",
    "link": "https://www.facebook.com/before.educationconsultancy"
  },
  {
    "id": 13,
    "project": 11,
    "name": "Behance",
    "link": "https://www.behance.net/gallery/223838325/Spark-Logo-Design"
  },
  {
    "id": 14,
    "project": 16,
    "name": "NDRRMA",
    "link": "https://ndrrma.gov.np/"
  },
  {
    "id": 15,
    "project": 16,
    "name": "Youth Innovation Lab",
    "link": "https://youthinnovationlab.org/"
  },
  {
    "id": 16,
    "project": 20,
    "name": "Arima Packaging Website",
    "link": "https://arimapackaging.com.np/"
  },
  {
    "id": 17,
    "project": 20,
    "name": "Facebook",
    "link": "https://www.facebook.com/arima.packaging/"
  }
]
```

### `blogs.blog` (1 records)

```json
[
  {
    "id": 1,
    "title": "Translating Needs into Code: My Collaborative Role at NDRRMA with Youth Innovation Lab",
    "content": "<p><strong>Stepping into the role of Project Associate at the </strong><a href=\"https://ndrrma.gov.np/\"><strong>National Disaster Risk Reduction and Management Authority (NDRRMA)</strong></a> was far more than just a technical assignment — it was a profoundly meaningful chapter of my professional journey, where backend development met the real-world mission of saving lives.</p><p>&nbsp;</p><p>As part of the dynamic team at <a href=\"https://youthinnovationlab.org/\"><strong>Youth Innovation Lab</strong></a>, I had the unique opportunity to contribute to a live, government-facing digital platform built using <strong>Django</strong> and <strong>Django REST Framework</strong>. My core responsibilities included implementing new backend features, managing and updating the database schema, configuring signals and serializers, and refining the Django admin interface to ensure it remained efficient and intuitive for end users.</p><p>&nbsp;</p><p>However, the heart of this project lay in <strong>bridging the gap between technology and public service</strong>. I actively <strong>communicated with </strong><a href=\"https://ndrrma.gov.np/\"><strong>NDRRMA</strong></a><strong> officials</strong>, translating their feedback and operational needs into actionable development tasks. Acting as a conduit between the government stakeholders and the IT team at <a href=\"https://youthinnovationlab.org/\">Youth Innovation Lab</a>, I ensured that every feature enhancement, bug fix, or workflow adjustment reflected the real needs of those working on the frontlines of disaster risk reduction.</p><p>&nbsp;</p><p>In this role, I also facilitated <strong>collaboration between the backend and frontend teams</strong>, aligning development efforts during feature rollouts and making sure that both the technical and non-technical perspectives were in sync. This involved careful planning, requirement analysis, and iterative discussions to ensure the platform served its intended purpose — to provide a reliable, responsive, and effective digital tool for disaster management.</p><p>&nbsp;</p><p>One of the greatest takeaways from this experience was the importance of seeing beyond the code — to understand the <strong>system as a whole</strong>, including how it fits into broader organizational and national goals. That systems-level thinking helped ensure smooth technical updates without disrupting the workflow of our users at NDRRMA, ultimately supporting the agency’s mission to enhance disaster preparedness and response.</p><p>&nbsp;</p><p>I am deeply grateful to everyone who contributed to this enriching journey. To the <strong>NDRRMA officials</strong>, thank you for your trust, guidance, and clear communication — your insights shaped the direction of our work in meaningful ways. To the <strong>entire IT and leadership team at </strong><a href=\"https://youthinnovationlab.org/\"><strong>Youth Innovation Lab</strong></a>, thank you for your constant support, mentorship, and collaborative spirit.&nbsp;</p><p>&nbsp;</p><p>A special thanks to <strong>Mr. Pradip Khatiwada</strong>, Executive Director at <a href=\"https://youthinnovationlab.org/\">Youth Innovation Lab</a>, for believing in me and giving me the opportunity to be a part of this impactful project. Your trust was the foundation that allowed me to grow and contribute meaningfully to a national cause.</p><p>&nbsp;</p><p>Working alongside such dedicated professionals was an honor, and every challenge we tackled together was a chance to grow — not just as a developer, but as a contributor to a mission that matters.</p><p>&nbsp;</p><p>This project reaffirmed my belief that <strong>technology, when guided by purpose and empathy, can be a powerful force for public good</strong> — and I’m proud to have played a part in that mission.</p>",
    "slug": "translating-needs-into-code-my-collabora-Q4OHd",
    "banner_image": "uploads/blogs/blog/translating-needs-into-code-my-collaborative-role-at-nd-cb4a0971.svg",
    "published_at": "2025-07-06T04:15:00Z"
  }
]
```

### `blogs.blogimage` (0 records)

```json
[]
```

### `blogs.featuredblog` (1 records)

```json
[
  {
    "id": 1,
    "blog": 1
  }
]
```

### `contact.contactinformation` (1 records)

```json
[
  {
    "id": 1,
    "contact_banner": "uploads/contact/contactinformation/Er. Riwaj Bhurtel.png",
    "whatsapp": "+977 9869146101",
    "address": "Tokha-10, Kathmandu"
  }
]
```

### `testimonial.testimonial` (2 records)

```json
[
  {
    "id": 4,
    "name": "Binaya Dhakal",
    "image": "uploads/testimonial/testimonial/binaya-dhakal-fd693332.svg",
    "company": "Ambirise IT Solution",
    "position": "Managing Director",
    "testimonial": "Er. Riwaj Bhurtel played a key role in shaping Ambirise IT Solution’s digital presence. From web development and design to managing our branding and digital campaigns, his creative vision and technical skills drove real results. His work elevated our brand and helped us grow faster and smarter.",
    "order": 1
  },
  {
    "id": 5,
    "name": "Santosh Bhurtel",
    "image": "uploads/testimonial/testimonial/santosh-bhurtel-e865ccb2.svg",
    "company": "Spark International Education",
    "position": "Managing Director",
    "testimonial": "Working with Er. Riwaj Bhurtel transformed our brand. He crafted a logo and identity that truly represent Spark International Education Consultancy and built a WordPress website that boosted our online presence. His blend of creativity, technical skill, and professionalism made a lasting impact. We're truly grateful for his contribution.",
    "order": 2
  }
]
```

