# Frontend

All portfolio details come from `FRONTEND_DATABASE.md` in this directory. The Vite
plugin bundles only JSON arrays under `## Public content snapshot`. Edit those
arrays and rebuild to update the site. Keep the section headings and JSON fences intact.

Components use `src/content.js` for local content reads. Filters, search, related
skills, project details, blog details, and featured content work without API calls.
`src/axios.js` is only a compatibility re-export; it makes no HTTP requests.

Images now live in `public/uploads/` and are served at `/uploads/`. The public
snapshot in `FRONTEND_DATABASE.md` points directly to these local assets, so no
backend media server is needed. There are 119 generated SVG placeholder images
for project covers/gallery images, skill/service icons, profile/contact images,
and testimonial avatars, plus the existing RIOZ branding image. These are temporary
graphics, not the original photos, logos, or project screenshots.

`public/uploads/manifest.json` records each original image path and its local
replacement. To add a real asset, put it in `public/uploads/` and update the relevant
image field in `FRONTEND_DATABASE.md` (use its actual file extension). Existing
placeholder files can also be replaced with real SVG artwork at the same path.
The creation script `node scripts/create-upload-placeholders.mjs` does not overwrite
existing files. Run `node scripts/check-uploads.mjs` to check local image references.
The resume PDF is not an image and has not been fabricated; add your real resume
and update its Markdown path before using the download link.

The contact page presents collaboration areas and direct contact links. Testimonial
submissions remain disabled because a static Markdown file cannot receive submissions. Live weather requests and geolocation
are removed; local time and theme controls continue working.

Build with `npm run build`; output is `dist/`. The build needs only this frontend
directory and its Markdown file, with no backend, database credentials, or API URL
configuration. Run `node scripts/check-content.mjs` to verify the content integration.

## Skills and categories

The frontend uses `skills.SkillCategory` and `skills.Skill` from the public snapshot
in [FRONTEND_DATABASE.md](./FRONTEND_DATABASE.md). Their JSON section names are
`skills.skillcategory` and `skills.skill`. The current snapshot has **7 categories
and 36 skills**; the levels below are the existing self-assessments out of 10.

| Category ID | Category | Skills (level / 10) |
| --- | --- | --- |
| 1 | Backend | Python (8), Django (8), Django Channels (5), Celery (6), Rest API (8), NodeJS (6) |
| 2 | Frontend | HTML 5 (8), CSS 3 (7), Javascript (7), TailwindCSS (8), Bootstrap (7), Vue JS (6.5) |
| 4 | Data Science | NumPy (7), Pandas (6.5), MatplotLib (6), Seaborn (6.5) |
| 5 | Database | Redis (6), MySQL (7), MongoDB (6), PostgreSQL (8), SQLite (8) |
| 6 | DevOps | Docker (7), NGINX (6), AWS Cloud (6) |
| 7 | Others | Jira (6.5), Microsoft 365 (6), Microsoft Excel (7.5), Wordpress (6), Linux (Ubuntu) (6) |
| 8 | Graphics | Adobe Photoshop (8.5), Adobe Illustrator (7.5), Adobe Premiere Pro (6), Canva (8), Logo Design (7), Meta Business Suite (7), Figma (7) |

`skills.SkillCategory` records contain `id` and `name`. `skills.Skill` records contain
`id`, `name`, `level` (0–10), `logo` (a media path), and `category` (the category ID).
For example, a skill with `category: 1` belongs to Backend.

To update the website, edit these records in `FRONTEND_DATABASE.md`. Keep existing
IDs stable: project and experience records refer to skill IDs. New skills need
unique IDs and an existing category ID; new categories need unique IDs. Put skill
logo files under `public/uploads/` using the path recorded in `logo`. Update each
section's record count when adding or removing records, then rebuild. This README
is a reference; its table does not supply the website's content.

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## My Journey experiences

The home page defaults to Professional Experience and offers a Leadership Experience
tab. Both use the existing grouped experience cards and display optional logos,
plain-text descriptions, achievements, and skills. Categories are `professional` and
`leadership`; records without a category remain professional for compatibility.

The Django admin now supports both categories in its existing Experience section.
Apply the additive migrations in the configured backend environment:

```sh
cd portfolio/backend
python manage.py migrate
```

Existing experiences default to professional. The next migration adds President at
Rotaract Club of Pokhara University and Campus Director at Hult Prize at Pokhara
University. Their dates are stored as year boundaries with `date_precision: "year"`,
so the cards display 2023–2024 without implying known months. Descriptions, logos,
and achievements are left blank until supplied. Achievements are a JSON list of
strings in the admin. Job type and skills are optional for either category.

The backend API supports `?category=professional` or `?category=leadership` on
`/api/v1/experience/experiences/` and exposes the new fields. The static frontend
continues reading Markdown and makes no API requests. After editing in admin,
export visible experiences and rebuild the frontend:

```sh
# From portfolio/backend, with the configured database available:
python manage.py export_experiences
# Then from portfolio/frontend:
npm run build
```

The exporter updates only the experience JSON section in `FRONTEND_DATABASE.md`.
It retains existing skill IDs, so keep the skill snapshot synchronized with the
backend when exporting. Exported logo paths need to point at real files in `public/uploads/`.
Deploy the rebuilt output to publish admin changes. Alternatively, edit the
experience snapshot directly for the static site.

Check the integration with `node scripts/check-journey.mjs`. Backend regression
tests are available with `python manage.py test experience` in the configured
backend test environment.

## Content search chat

The floating “AskRio” button opens a browser-local search conversation.
Fuse.js indexes the public Markdown snapshot for projects, professional and
leadership experience, skills, services, articles, profile, and contact links.
It returns fuzzy matches with plain-text excerpts and links; it is not a generative
AI assistant and does not make API requests. Queries and messages remain in memory
and are cleared on reload or with the reset button.

Skill results open their category, and leadership results select the Leadership
Experience tab. The shared router scrolls to the relevant section. Edit the public
snapshot and rebuild to update search content. Run `node scripts/check-search.mjs`
for typo matching, result filtering, deep links, and visibility checks.
Search configuration follows the [Fuse.js fuzzy search documentation](https://www.fusejs.io/fuzzy-search.html).

## Purple visual system

The shared palette lives in `src/assets/main.css`, with matching light/dark tokens
for surfaces, text, violet/indigo/lavender accents, and accessible action colors.
`--primary` is the accent text color; `--primary-action` provides darker backgrounds for white button labels in both themes.

The existing ambience component now draws decorative code circuits, design curves,
a neural network, and leadership connections as lightweight SVGs. Background motion
uses transforms and opacity, pauses when the page is hidden, and disables movement
for reduced-motion preferences. Pointer glow is enabled only with a fine pointer
and no reduced-motion preference. Mobile renders fewer decorative elements.
Components use flat theme surfaces; gradients are reserved for the shared page
background. Layouts and content remain unchanged.

## Portfolio motion

Motion's small JavaScript animation API integrates with the existing Vue components
through `src/motion/portfolioMotion.js`. `v-reveal` reveals sections once, and
`v-stagger` observes direct children with short capped delays. Motion uses opacity
and CSS translate, preserving layout and existing hover transforms. Journey,
skill categories, and project pages use shared enter/leave hooks.

Journey role titles with descriptions or achievements can be expanded/collapsed
with a keyboard-accessible button. Details start expanded, preserving the existing
content. Role markers respond to viewport position and focus, and achievement
entries reveal in sequence. Existing route navigation and category filtering remain.

Reduced-motion changes cancel active effects immediately. Keyboard focus reveals
content immediately; unsupported animation/observer APIs leave content visible.
Directives clean up when elements leave the component tree. Run
`node scripts/check-motion.mjs` to check fallback and cleanup behavior.
