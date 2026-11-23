import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseMarkdownContent, createContentReader } from '../src/markdownContent.mjs'
import { academicInstitutionUrl, formatAcademicPeriod, academicQualificationCards } from '../src/academicQualifications.mjs'

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
const qualifications = (await get('education/qualifications/')).data
assert.ok(qualifications.length)
assert.ok(qualifications.every((row) => row.degree && row.institution && row.to_display !== false))
qualifications[0].degree = 'Modified copy'
assert.notEqual((await get('education/qualifications/')).data[0].degree, 'Modified copy')
const academicReader = createContentReader({ 'education.qualification': [
  { id: 1, degree: 'Previous degree', status: 'completed', end_date: '2020-06-01' },
  { id: 2, degree: 'Current studies', status: 'ongoing', start_date: '2024-01-01' },
  { id: 3, degree: 'Latest completed', status: 'completed', end_date: '2023-06-01' },
  { id: 4, degree: 'Undated degree', status: 'completed', start_date: null, end_date: null },
  { id: 5, degree: 'Hidden degree', to_display: false, end_date: '2026-01-01' },
] }, '/')
assert.deepEqual((await academicReader('education/qualifications/')).data.map((row) => row.id), [2, 3, 1, 4])
assert.deepEqual((await createContentReader({}, '/')('education/qualifications/')).data, [])
assert.equal(formatAcademicPeriod({ start_date: '2019-01-01', end_date: '2023-12-01', date_precision: 'year' }), '2019 – 2023')
assert.equal(formatAcademicPeriod({ start_date: '2024-01-01', status: 'ongoing', date_precision: 'month' }), 'Jan 2024 – Present')
assert.equal(formatAcademicPeriod({ start_date: '2020-01-01', status: 'completed' }), '2020')
assert.equal(formatAcademicPeriod({ end_date: '2023-01-01', status: 'completed' }), '2023')
assert.equal(formatAcademicPeriod({ start_date: '2023-01-01', end_date: '2023-12-01' }), '2023')
assert.equal(formatAcademicPeriod({ status: 'completed', start_date: null, end_date: null }), '')
assert.equal(formatAcademicPeriod({ start_date: 'invalid' }), '')
assert.equal(academicInstitutionUrl('https://example.edu/'), 'https://example.edu/')
assert.equal(academicInstitutionUrl('javascript:alert(1)'), '')
assert.equal(academicInstitutionUrl(null), '')
const academicRows = [
  { id: 1, institution: 'University A', degree: 'Engineering', status: 'completed', start_date: '2019-01-01', grade: '3.7 / 4.0', location: 'Kathmandu', description: 'Degree details', achievements: ['Academic award'] },
  { id: 2, institution: ' University A ', degree: 'Advanced Studies', status: 'ongoing', start_date: '2024-01-01', institution_url: 'https://example.edu/' },
  { id: 3, institution: 'University A', degree: 'Hidden qualification', to_display: false },
  { id: 4, institution: 'University B', degree: 'Undated qualification', status: 'completed' },
]
const academicCards = academicQualificationCards(academicRows)
assert.equal(academicCards.length, 3)
assert.ok(academicCards.every((card) => card.roles.length === 1), 'Each qualification has its own card without a timeline')
assert.equal(academicCards.filter((card) => card.company === 'University A').length, 2, 'Qualifications at the same institution stay separate')
const engineering = academicCards.find((card) => card.id === 1).roles[0]
assert.equal(engineering.title, 'Engineering')
assert.equal(engineering.display_period, '2019')
assert.ok(engineering.description.includes('Grade: 3.7 / 4.0'))
assert.ok(engineering.description.includes('Kathmandu'))
assert.deepEqual(engineering.achievements, ['Academic award'])
assert.equal(academicCards[0].company_url, 'https://example.edu/')
assert.equal(academicCards[0].roles[0].display_period, '2024 – Present')
assert.equal(academicCards.find((card) => card.id === 4).roles[0].display_period, '', 'Undated completed study shows no invented date')
assert.equal(academicRows[0].description, 'Degree details', 'Mapping cards preserves the content snapshot')
console.log('Journey checks passed: professional/leadership filtering, academic content, date precision, ongoing/completed study, ordering, visibility, and content isolation.')
