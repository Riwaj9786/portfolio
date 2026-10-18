import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseMarkdownContent } from '../src/markdownContent.mjs'
import { buildSearchDocuments, createPortfolioSearch, plainText } from '../src/portfolioSearch.mjs'
const content = parseMarkdownContent(readFileSync(new URL('../FRONTEND_DATABASE.md', import.meta.url), 'utf8'))
const search = createPortfolioSearch(content)
for (const query of ['Django projects', 'Logo design', 'Leadership roles', 'Skills', 'Contact', 'Djnago projects']) {
  const answer = search(query)
  assert.ok(answer.results.length, `No results for ${query}`)
  assert.ok(answer.results.every((r) => r.url.startsWith('/')))
  assert.ok(answer.results.every((r) => !/<[^>]*>/.test(r.snippet)))
}
assert.ok(search('Django projects').results.every((r) => r.kind === 'Project'))
assert.ok(search('Leadership roles').results.every((r) => r.kind === 'Experience' && r.url.includes('journey=leadership')))
assert.ok(search('Skills').results.every((r) => r.kind === 'Skill'))
assert.ok(search('Figma skill').results.some((r) => r.title === 'Figma' && r.url.includes('skillCategory=')))
assert.deepEqual(search('zxqv987nonexistent').results, [])
assert.deepEqual(search('').results, [])
assert.deepEqual(search('Hello').results, [])
assert.equal(plainText('<script>bad()</script><p>Django &amp; Vue&nbsp;apps</p>'), 'Django & Vue apps')
const filtered = buildSearchDocuments({
  'projects.project': [{ id: 1, name: 'Hidden', is_archive: true }],
  'experience.experience': [{ id: 2, title: 'Private', to_display: false }],
  'blogs.blog': [{ id: 3, title: 'Draft', is_draft: true }],
})
assert.equal(filtered.length, 0)
console.log('Fuse search checks passed: natural questions, typos, leadership, skill links, no matches, safe excerpts, and visibility.')
