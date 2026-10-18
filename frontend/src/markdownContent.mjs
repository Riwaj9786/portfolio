// Allow trailing commas from manual edits without touching commas inside strings.
export function removeTrailingCommas(json) {
  let result = ''
  let inString = false
  let escaped = false
  for (let index = 0; index < json.length; index++) {
    const character = json[index]
    if (inString) {
      result += character
      if (escaped) escaped = false
      else if (character === '\\') escaped = true
      else if (character === '"') inString = false
      continue
    }
    if (character === '"') inString = true
    if (character === ',') {
      const remainder = json.slice(index + 1).trimStart()
      if (!remainder || remainder.startsWith(']') || remainder.startsWith('}')) continue
    }
    result += character
  }
  return result
}

// Only the JSON arrays in the public snapshot become client content.
export function parseMarkdownContent(markdown) {
  const snapshot = markdown.split('## Public content snapshot\n')[1]
  if (!snapshot) throw new Error('Markdown is missing the public content snapshot')
  const content = {}
  const sections = /### `([\w.]+)` \(\d+ records\)\s+```json\n([\s\S]*?)\n```/g
  for (const [, model, json] of snapshot.matchAll(sections)) {
    let records
    try {
      records = JSON.parse(removeTrailingCommas(json))
    } catch (error) {
      throw new Error(`Invalid JSON in FRONTEND_DATABASE.md section "${model}": ${error.message}`, { cause: error })
    }
    if (!Array.isArray(records)) throw new Error(`Expected an array for ${model}`)
    content[model] = records
  }
  for (const model of ['account.user', 'skills.skill', 'projects.project', 'blogs.blog']) {
    if (!content[model]) throw new Error(`Missing Markdown content: ${model}`)
  }
  return content
}

export function createContentReader(content, mediaOrigin) {
  const records = (model) => content[model] || []
  const mediaFields = new Set(['profile_pic', 'resume', 'logo', 'icon', 'image', 'banner_image', 'contact_banner'])
  const mediaUrl = (value) => /^(https?:|data:|blob:)/i.test(value)
    ? value : `${mediaOrigin.replace(/\/$/, '')}/${value.replace(/^\/?media\//, '').replace(/^\//, '')}`
  function normalize(value, key) {
    if (Array.isArray(value)) return value.map((item) => normalize(item))
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalize(v, k)]))
    if (typeof value !== 'string' || !value) return value
    if (mediaFields.has(key)) return mediaUrl(value)
    if (['content', 'description', 'distinct_features'].includes(key)) {
      return value.replace(/(\b(?:src|href)=["'])(?:https?:\/\/[^/"']+)?\/?media\/([^"']+)(["'])/gi,
        (_, prefix, path, suffix) => `${prefix}${mediaUrl(path)}${suffix}`)
    }
    return value
  }
  const skillNames = (ids = []) => ids.map((id) => records('skills.skill').find((s) => s.id === id)).filter(Boolean).map(({ name }) => ({ name }))
  const project = (row) => ({
    ...row, skills: skillNames(row.skills),
    category: records('projects.projectcategory').find((c) => c.id === row.category)?.name || '',
    project_links: records('projects.projectlink').filter((r) => r.project === row.id),
    project_images: records('projects.projectimage').filter((r) => r.project === row.id),
  })
  const blog = (row) => ({ ...row, blog_images: records('blogs.blogimage').filter((r) => r.blog === row.id) })
  const notFound = () => {
    const error = new Error('Content not found in FRONTEND_DATABASE.md')
    error.response = { status: 404, data: { detail: error.message } }
    throw error
  }
  return async function get(path, config = {}) {
    const url = new URL(path.replace(/^\//, ''), 'https://content.local/')
    for (const [key, value] of Object.entries(config.params || {})) url.searchParams.set(key, value)
    const route = decodeURIComponent(url.pathname).replace(/^\//, '').replace(/\/$/, '')
    const params = url.searchParams
    let data
    const simple = {
      'information/profile': ['account.user', ['name', 'title', 'short_bio', 'profile_pic']],
      'information/description': ['account.user', ['description']],
      'information/resume': ['account.user', ['resume']],
      'information/media': ['account.medialinks'],
      'contact/information': ['contact.contactinformation'],
      'skill/categories': ['skills.skillcategory'],
      'projects/categories': ['projects.projectcategory'],
      'testimonial/testimonials': ['testimonial.testimonial'],
    }
    if (simple[route]) {
      const [model, fields] = simple[route]
      data = records(model).map((row) => fields ? Object.fromEntries(fields.map((field) => [field, row[field]])) : row)
    } else if (route === 'service/services') {
      data = [...records('services.service')].sort((a, b) => a.order - b.order)
    } else if (route === 'experience/experiences') {
      data = records('experience.experience')
        .filter((r) => r.to_display !== false && (!params.has('category') || (r.category || 'professional') === params.get('category')))
        .map((r) => ({ ...r, category: r.category || 'professional', skills: skillNames(r.skills) }))
      data.sort((a, b) => b.start_date.localeCompare(a.start_date) || (b.end_date || '').localeCompare(a.end_date || ''))
    } else if (route === 'skill') {
      data = records('skills.skill').filter((r) => !params.has('category__name') || records('skills.skillcategory').some((c) => c.id === r.category && c.name === params.get('category__name')))
    } else if (route === 'projects/project') {
      data = records('projects.project').map(project).filter((r) =>
        (!params.has('category__name') || r.category === params.get('category__name')) &&
        (!params.has('skills__name') || r.skills.some((s) => s.name === params.get('skills__name'))))
      const ordering = (params.get('ordering') || '-start_date').split(',').filter((key) => ['start_date', 'end_date'].includes(key.replace(/^-/, '')))
      data.sort((a, b) => {
        for (const key of ordering) {
          const field = key.replace(/^-/, '')
          const comparison = (a[field] || '').localeCompare(b[field] || '')
          if (comparison) return key.startsWith('-') ? -comparison : comparison
        }
        return 0
      })
    } else if (route.startsWith('projects/project/')) {
      const row = records('projects.project').find((r) => r.slug === route.slice('projects/project/'.length))
      if (!row) notFound()
      data = project(row)
    } else if (route === 'blogs/featured_blog') {
      data = records('blogs.featuredblog').map((r) => records('blogs.blog').find((b) => b.id === r.blog)).filter(Boolean).map((r) => ({ blog: blog(r) }))
    } else if (route === 'blogs/blogs') {
      const featured = new Set(records('blogs.featuredblog').map((r) => r.blog))
      const terms = (params.get('search') || '').toLowerCase().trim().split(/\s+/)
      data = records('blogs.blog').filter((r) => !featured.has(r.id) && terms.every((term) => r.title.toLowerCase().includes(term))).map(blog)
      data.sort((a, b) => b.published_at.localeCompare(a.published_at))
    } else if (route.startsWith('blogs/blogs/')) {
      const row = records('blogs.blog').find((r) => r.slug === route.slice('blogs/blogs/'.length))
      if (!row) notFound()
      data = blog(row)
    } else notFound()
    if (route === 'skill/categories') data = [...data].sort((a, b) => a.name.localeCompare(b.name))
    if (route === 'testimonial/testimonials') data = [...data].sort((a, b) => a.order - b.order)
    // Return independent objects so callers cannot mutate the shared snapshot.
    return { data: normalize(data), status: 200 }
  }
}
