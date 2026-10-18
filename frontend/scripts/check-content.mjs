import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseMarkdownContent, createContentReader } from '../src/markdownContent.mjs'

const markdown = readFileSync(new URL('../FRONTEND_DATABASE.md', import.meta.url), 'utf8')
const content = parseMarkdownContent(markdown)
const get = createContentReader(content, '/media')
// No read may fall through to an HTTP request.
globalThis.fetch = () => { throw new Error('Unexpected network request') }
for (const path of ['information/profile/', 'information/description/', 'information/resume/', 'information/media/', 'contact/information/', 'skill/', 'skill/categories/', 'service/services/', 'experience/experiences/', 'projects/categories/', 'projects/project/', 'blogs/blogs/', 'blogs/featured_blog/', 'testimonial/testimonials/']) {
  assert.ok(Array.isArray((await get(path)).data), path)
}
for (const category of content['projects.projectcategory']) {
  const { data } = await get(`projects/project/?category__name=${encodeURIComponent(category.name)}`)
  assert.equal(data.length, content['projects.project'].filter((p) => p.category === category.id).length)
  assert.ok(data.every((p) => p.category === category.name))
}
for (const category of content['skills.skillcategory']) {
  const { data } = await get('skill/', { params: { category__name: category.name } })
  assert.equal(data.length, content['skills.skill'].filter((s) => s.category === category.id).length)
}
for (const row of content['projects.project']) {
  const { data } = await get(`projects/project/${row.slug}/`)
  assert.equal(data.project_images.length, content['projects.projectimage'].filter((i) => i.project === row.id).length)
  assert.equal(data.skills.length, row.skills.length)
  if (row.banner_image) assert.ok(data.banner_image.startsWith('/media/'))
}
for (const row of content['blogs.blog']) assert.equal((await get(`blogs/blogs/${row.slug}/`)).data.title, row.title)
const featured = new Set(content['blogs.featuredblog'].map((b) => b.blog))
assert.ok((await get('blogs/blogs/')).data.every((b) => !featured.has(b.id)))
assert.deepEqual((await get('blogs/blogs/', { params: { search: 'nonexistent-search-1234' } })).data, [])
await assert.rejects(get('projects/project/missing/'), (e) => e.response.status === 404)
await assert.rejects(get('unknown/'), (e) => e.response.status === 404)
const first = await get('information/profile/')
first.data[0].name = 'modified'
assert.notEqual((await get('information/profile/')).data[0].name, 'modified')
assert.throws(() => parseMarkdownContent('invalid document'))
console.log('Markdown content checks passed: routes, filters, relationships, media, search, missing content, and isolation.')
