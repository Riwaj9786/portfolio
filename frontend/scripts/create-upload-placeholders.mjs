import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { parseMarkdownContent } from '../src/markdownContent.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const markdownPath = resolve(root, 'FRONTEND_DATABASE.md')
const manifestPath = resolve(root, 'public/uploads/manifest.json')
let markdown = readFileSync(markdownPath, 'utf8')
const content = parseMarkdownContent(markdown)
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : []
const imageFields = ['profile_pic', 'logo', 'icon', 'image', 'banner_image', 'contact_banner']
const projectNames = new Map((content['projects.project'] || []).map((p) => [p.id, p.name]))
const palettes = [['#211439', '#996dea', '#d9c6ff'], ['#112b35', '#42a99f', '#a8e8d9'], ['#351a34', '#cf7baa', '#f2cee3'], ['#342b1d', '#d2a45f', '#f7dfb5']]
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]))
const wrap = (text, width = 31) => {
  const lines = ['']
  for (const word of text.split(/\s+/)) {
    if ((lines.at(-1) + word).length > width && lines.at(-1)) lines.push('')
    lines[lines.length - 1] += (lines.at(-1) ? ' ' : '') + word
  }
  return lines.slice(0, 3)
}
function artwork(label, model, field, hash) {
  const compact = ['skills.skill', 'services.service', 'testimonial.testimonial'].includes(model)
  const portrait = field === 'profile_pic'
  const [bg, accent, ink] = palettes[parseInt(hash.slice(0, 2), 16) % palettes.length]
  const initials = label.replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  const width = compact ? 400 : portrait ? 800 : 1200
  const height = compact ? 400 : portrait ? 1000 : 720
  const view = compact ? `<rect x="98" y="98" width="204" height="204" rx="64" fill="${accent}" transform="rotate(-12 200 200)"/><text x="200" y="227" text-anchor="middle" font-size="78" font-weight="750" fill="white">${escape(initials)}</text><text x="200" y="365" text-anchor="middle" font-size="14" fill="${ink}">Placeholder</text>` : portrait ? `<circle cx="400" cy="380" r="145" fill="${accent}" opacity=".3"/><text x="400" y="425" text-anchor="middle" font-size="130" font-weight="750" fill="${ink}">${escape(initials)}</text><text x="400" y="700" text-anchor="middle" font-size="30" fill="${ink}">Profile image placeholder</text>` : `<g fill="none" stroke="${accent}" opacity=".25"><ellipse cx="1000" cy="180" rx="340" ry="190" transform="rotate(-35 1000 180)"/><ellipse cx="1000" cy="180" rx="270" ry="150" transform="rotate(-35 1000 180)"/></g><rect x="810" y="190" width="190" height="190" rx="58" fill="${accent}" transform="rotate(-22 905 285)" opacity=".8"/><path d="M856 255L830 284L856 313M945 255L971 284L945 313M913 246L889 321" fill="none" stroke="${ink}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><text x="76" y="106" fill="${ink}" font-size="17" letter-spacing="4">RIWAJ / SELECTED WORK</text>${wrap(label).map((line, i) => `<text x="76" y="${420 + i * 59}" fill="${ink}" font-size="48" font-weight="700">${escape(line)}</text>`).join('')}<path d="M76 637H1124" stroke="${accent}" opacity=".4"/><text x="76" y="677" fill="${ink}" font-size="15" opacity=".7">Preview placeholder · Original image to be added</text>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title"><title id="title">${escape(label)} — placeholder</title><rect width="${width}" height="${height}" fill="${bg}"/><circle cx="${width}" cy="0" r="${width * .65}" fill="${accent}" opacity=".06"/><g font-family="Arial,Helvetica,sans-serif">${view}</g></svg>\n`
}
let created = 0
for (const [model, rows] of Object.entries(content)) {
  for (const row of rows) {
    for (const field of imageFields) {
      const source = row[field]
      if (typeof source !== 'string' || !source || /^(data:|blob:)/.test(source)) continue
      if (manifest.some((item) => item.path === source)) continue
      let entry = manifest.find((item) => item.original === source)
      if (!entry) {
        const label = row.name || row.title || projectNames.get(row.project) || (model === 'contact.contactinformation' ? 'Let’s build something together' : row.caption) || 'Portfolio image'
        const hash = createHash('sha256').update(source).digest('hex').slice(0, 8)
        const slug = String(label).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 55) || 'image'
        const folder = model.replace('.', '/')
        const path = `uploads/${folder}/${slug}-${hash}.svg`
        entry = { original: source, path, label, placeholder: true }
        const output = resolve(root, 'public', path)
        mkdirSync(dirname(output), { recursive: true })
        if (!existsSync(output)) { writeFileSync(output, artwork(String(label), model, field, hash)); created++ }
        manifest.push(entry)
      }
      row[field] = entry.path
    }
  }
}
// Update only public JSON blocks; schema notes and other prose remain intact.
markdown = markdown.replace(/### `([\w.]+)` \(\d+ records\)\s+```json\n[\s\S]*?\n```/g,
  (block, model) => content[model] ? `### \`${model}\` (${content[model].length} records)\n\n\`\`\`json\n${JSON.stringify(content[model], null, 2)}\n\`\`\`` : block)
mkdirSync(dirname(manifestPath), { recursive: true })
writeFileSync(markdownPath, markdown)
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
console.log(`Created ${created} placeholder SVG images; ${manifest.length} image paths tracked in public/uploads/manifest.json.`)
