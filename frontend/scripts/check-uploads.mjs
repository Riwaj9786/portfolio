import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseMarkdownContent, createContentReader } from '../src/markdownContent.mjs'
const root = fileURLToPath(new URL('../', import.meta.url))
const data = parseMarkdownContent(readFileSync(resolve(root, 'FRONTEND_DATABASE.md'), 'utf8'))
let count = 0
const fields = ['profile_pic', 'resume', 'logo', 'icon', 'image', 'banner_image', 'contact_banner']
const assetRoot = resolve(root, process.argv[2] || 'public')
for (const rows of Object.values(data)) for (const row of rows) for (const field of fields) {
  if (!row[field]) continue
  assert.ok(row[field].startsWith('uploads/'), `Non-local image: ${row[field]}`)
  assert.ok(existsSync(resolve(assetRoot, row[field])), `Missing image: ${row[field]}`)
  assert.ok(readFileSync(resolve(assetRoot, row[field])).length > 0, `Empty media file: ${row[field]}`)
  count++
}
const get = createContentReader(data, '/')
const projects = (await get('projects/project/')).data
assert.ok(projects.every((p) => !p.banner_image || p.banner_image.startsWith('/uploads/')))
assert.ok(existsSync(resolve(assetRoot, 'uploads/branding/rioz.jpg')))
console.log(`Validated ${count} local media references, media files, branding, and project URL resolution.`)
