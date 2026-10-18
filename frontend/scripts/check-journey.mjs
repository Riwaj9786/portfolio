import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseMarkdownContent, createContentReader } from '../src/markdownContent.mjs'

const data = parseMarkdownContent(readFileSync(new URL('../FRONTEND_DATABASE.md', import.meta.url), 'utf8'))
const get = createContentReader(data, '/media')
const professional = (await get('experience/experiences/', { params: { category: 'professional' } })).data
const leadership = (await get('experience/experiences/?category=leadership')).data
assert.equal(professional.length + leadership.length, data['experience.experience'].length)
assert.ok(professional.every((r) => r.category === 'professional'))
for (const [title, company] of [
  ['President', 'Rotaract Club of Pokhara University'],
  ['Campus Director', 'Hult Prize at Pokhara University'],
]) {
  const role = leadership.find((r) => r.title === title && r.company === company)
  assert.ok(role)
  assert.ok(['month', 'year'].includes(role.date_precision))
  assert.equal(role.start_date.slice(0, 4), '2023')
  assert.equal(role.end_date.slice(0, 4), '2024')
}
const legacy = createContentReader({ 'experience.experience': [{ id: 1, start_date: '2020-01-01', skills: [] }] }, '/media')
assert.equal((await legacy('experience/experiences/?category=professional')).data.length, 1)
const hidden = createContentReader({ 'experience.experience': [{ id: 1, to_display: false }] }, '/media')
assert.deepEqual((await hidden('experience/experiences/')).data, [])
console.log('Journey checks passed: category filtering, leadership roles, date precision, legacy defaults, and visibility.')
