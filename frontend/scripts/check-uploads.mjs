import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseMarkdownContent, createContentReader } from '../src/markdownContent.mjs'
const root = fileURLToPath(new URL('../', import.meta.url))
const data = parseMarkdownContent(readFileSync(resolve(root, 'FRONTEND_DATABASE.md'), 'utf8'))
let count = 0
const fields = ['profile_pic', 'logo', 'icon', 'image', 'banner_image', 'contact_banner']
for (const rows of Object.values(data)) for (const row of rows) for (const field of fields) {
  if (!row[field]) continue
  assert.ok(row[field].startsWith('uploads/'), `Non-local image: ${row[field]}`)
  assert.ok(existsSync(resolve(root, 'public', row[field])), `Missing image: ${row[field]}`)
  const svg = readFileSync(resolve(root, 'public', row[field]), 'utf8')
  assert.ok(svg.startsWith('<svg') && svg.includes('</svg>'), `Invalid generated SVG: ${row[field]}`)
  count++
}
const get = createContentReader(data, '/')
const projects = (await get('projects/project/')).data
assert.ok(projects.every((p) => p.banner_image.startsWith('/uploads/')))
assert.ok(existsSync(resolve(root, 'public/uploads/branding/rioz.jpg')))
console.log(`Validated ${count} local image references, generated SVG files, branding, and project URL resolution.`)
