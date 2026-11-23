import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildCvData, createCvDocument, formatCvDate } from '../src/generateCv.mjs'
import { parseMarkdownContent } from '../src/markdownContent.mjs'
import { createCvSelection, getCvSelectionGroups, selectCvContent, updateCvSelection } from '../src/cvSelection.mjs'

const content = parseMarkdownContent(readFileSync(new URL('../FRONTEND_DATABASE.md', import.meta.url), 'utf8'))
const original = structuredClone(content)
const data = buildCvData(content)
assert.equal(data.name, content['account.user'][0].name)
assert.equal(data.email, content['contact.contactinformation'][0].email)
assert.equal(data.projects.length, content['projects.project'].filter((row) => !row.is_archive).length)
assert.equal(data.work.flatMap((group) => group.roles).length,
  content['experience.experience'].filter((row) => row.to_display !== false && row.category !== 'leadership').length)
assert.equal(data.certifications.length, content['certifications.certification'].length)
assert.equal(data.education.length, content['education.qualification'].filter((row) => row.to_display !== false).length)
assert.ok(data.summary.every((paragraph) => !/<\/?\w+>/.test(paragraph)))
assert.ok(data.projects.flatMap((project) => project.bullets).every((bullet) => !/<\/?\w+>/.test(bullet)))
assert.equal(formatCvDate('2024-01-01'), 'Jan 2024')
assert.equal(formatCvDate('2024-01-01', 'year'), '2024')
assert.equal(formatCvDate('invalid'), '')

const updated = structuredClone(content)
updated['account.user'][0].name = 'Updated Portfolio Owner'
updated['contact.contactinformation'][0].email = 'updated@example.com'
updated['experience.experience'].push({ title: 'Hidden role', company: 'Hidden company', to_display: false })
updated['projects.project'].push({ name: 'Archived project', is_archive: true })
updated['projects.project'][0].distinct_features = '<ul><li>New &amp; updated &#65;PI</li></ul>'
updated['projects.projectlink'].push({ project: updated['projects.project'][0].id, link: 'javascript:alert(1)' })
const updatedData = buildCvData(updated)
assert.equal(updatedData.name, 'Updated Portfolio Owner')
assert.equal(updatedData.email, 'updated@example.com')
assert.equal(updatedData.projects.length, data.projects.length)
assert.equal(updatedData.work.length, data.work.length)
assert.ok(updatedData.projects.some((project) => project.bullets.includes('New & updated API')))
assert.ok(updatedData.projects.every((project) => project.links.every((link) => /^https?:/.test(link.url))))
assert.throws(() => buildCvData({}), /profile name/)

function checkPdf(pdf) {
  assert.equal(pdf.internal.pageSize.getWidth(), 612)
  assert.equal(pdf.internal.pageSize.getHeight(), 792)
  assert.ok(pdf.output().startsWith('%PDF-'))
  const pages = pdf.internal.pages.slice(1)
  assert.ok(pages.length > 0)
  for (const [index, page] of pages.entries()) {
    const commands = page.join('\n')
    assert.ok(commands.includes(' Tj'), `Page ${index + 1} has text`)
    // PDF coordinates start at the bottom. Every text baseline stays inside the margins.
    for (const [, x, y] of commands.matchAll(/([\d.-]+) ([\d.-]+) Td/g)) {
      assert.ok(Number(x) >= 71.9 && Number(x) <= 540.1, `Horizontal overflow on page ${index + 1}: ${x}`)
      assert.ok(Number(y) >= 71.9 && Number(y) <= 720.1, `Vertical overflow on page ${index + 1}: ${y}`)
    }
  }
  return pages.length
}

const pdf = createCvDocument(content)
const pages = checkPdf(pdf)
assert.ok(pages > 1, 'Full portfolio spans multiple pages')
assert.ok(pdf.output().includes('/Subtype /Link'), 'Clickable links are included')
assert.ok(!pdf.internal.pages.slice(1).flat().join('\n').includes('continued'), 'Page breaks do not add continued labels')
const minimal = { 'account.user': [{ name: 'Minimal Profile' }] }
assert.equal(checkPdf(createCvDocument(minimal)), 1)
const selection = createCvSelection(content)
assert.deepEqual(buildCvData(selectCvContent(content, selection)), data, 'Selecting all preserves the full CV')
const groups = getCvSelectionGroups(updated)
assert.ok(!groups.flatMap((group) => group.items).some((item) => ['Hidden role', 'Archived project'].includes(item.label)))
const projectGroup = groups.find((group) => group.id === 'projects')
assert.deepEqual(new Set(projectGroup.categories.flatMap((category) => category.itemIds)), new Set(projectGroup.items.map((item) => item.id)))
for (const category of projectGroup.categories) {
  const categoryData = buildCvData(selectCvContent(updated, { projects: category.itemIds }))
  assert.deepEqual(new Set(categoryData.projects.map((project) => project.name)),
    new Set(projectGroup.items.filter((item) => item.categoryId === category.id).map((item) => item.label)))
}
for (const group of groups.filter((group) => group.organizations)) {
  assert.deepEqual(new Set(group.organizations.flatMap((organization) => organization.itemIds)), new Set(group.items.map((item) => item.id)))
}
const organizationFixture = {
  'account.user': [{ name: 'Organization Selection Test' }],
  'experience.experience': [
    { id: 1, company: 'Shared Organization', title: 'First job', category: 'professional' },
    { id: 2, company: 'Shared Organization', title: 'Second job', category: 'professional' },
    { id: 3, company: 'Other Organization', title: 'Other job', category: 'professional' },
    { id: 4, company: 'Shared Organization', title: 'First leadership role', category: 'leadership' },
    { id: 5, company: 'Shared Organization', title: 'Second leadership role', category: 'leadership' },
    { id: 6, company: 'Shared Organization', title: 'Hidden job', category: 'professional', to_display: false },
  ],
}
const organizationGroups = getCvSelectionGroups(organizationFixture)
const professionalOrganization = organizationGroups.find((group) => group.id === 'work').organizations.find((organization) => organization.label === 'Shared Organization')
const leadershipOrganization = organizationGroups.find((group) => group.id === 'leadership').organizations[0]
assert.deepEqual(new Set(professionalOrganization.itemIds), new Set(['1', '2']))
assert.deepEqual(new Set(leadershipOrganization.itemIds), new Set(['4', '5']))
const allOrganizations = createCvSelection(organizationFixture)
const noProfessional = updateCvSelection(allOrganizations, 'work', professionalOrganization.itemIds, false)
assert.deepEqual(noProfessional.work, ['3'])
assert.deepEqual(noProfessional.leadership, allOrganizations.leadership, 'Professional selection leaves leadership unchanged')
const noLeadership = updateCvSelection(noProfessional, 'leadership', leadershipOrganization.itemIds, false)
assert.deepEqual(noLeadership.leadership, [])
assert.deepEqual(noLeadership.work, ['3'], 'Leadership selection leaves other jobs unchanged')
const restored = updateCvSelection(noLeadership, 'work', professionalOrganization.itemIds, true)
assert.deepEqual(new Set(restored.work), new Set(['1', '2', '3']))
const partial = updateCvSelection(restored, 'work', ['1'], false)
assert.equal(professionalOrganization.itemIds.filter((id) => partial.work.includes(id)).length, 1)
const complete = updateCvSelection(partial, 'work', professionalOrganization.itemIds, true)
assert.equal(complete.work.length, 3, 'Bulk selection restores missing roles without duplicating selected roles')
assert.deepEqual(allOrganizations.work, ['1', '2', '3'], 'Bulk selection does not mutate the original selection')
assert.equal(buildCvData(selectCvContent(organizationFixture, noProfessional)).work.flatMap((group) => group.roles).length, 1)
assert.equal(checkPdf(createCvDocument(content, {})), 1, 'Deselected sections are omitted')
const academicFixture = {
  'account.user': [{ name: 'Academic CV Test' }],
  'education.qualification': [
    { id: 1, degree: 'Included Degree', institution: 'University One', start_date: '2019', end_date: '2023', grade: 'Distinction', description: 'Education details', achievements: ['Academic award'] },
    { id: 2, degree: 'Excluded Degree', institution: 'University Two' },
    { id: 3, degree: 'Hidden Degree', institution: 'Private University', to_display: false },
  ],
}
const academicGroup = getCvSelectionGroups(academicFixture).find((group) => group.id === 'education')
assert.equal(academicGroup.items.length, 2)
const academicData = buildCvData(selectCvContent(academicFixture, { education: ['1'] }))
assert.equal(academicData.education.length, 1)
assert.equal(academicData.education[0].period, '2019 – 2023')
const academicPdf = createCvDocument(academicFixture, { education: ['1'] })
checkPdf(academicPdf)
const academicCommands = academicPdf.internal.pages.slice(1).flat().join('\n')
for (const label of ['ACADEMIC QUALIFICATIONS', 'Included Degree', 'University One', 'Grade: Distinction', 'Education details', 'Academic award']) {
  assert.ok(academicCommands.includes(`(${label}) Tj`), `Academic PDF includes ${label}`)
}
assert.ok(!academicCommands.includes('Excluded Degree'))
assert.ok(!academicCommands.includes('Hidden Degree'))
assert.ok(!createCvDocument(academicFixture, {}).internal.pages.slice(1).flat().join('\n').includes('ACADEMIC QUALIFICATIONS'))
const justificationFixture = { 'account.user': [{ name: 'Justification Test', description: 'Justified content gives balanced margins for longer readable body paragraphs. '.repeat(16) }] }
const justifiedPdf = createCvDocument(justificationFixture)
checkPdf(justifiedPdf)
const textRuns = [...justifiedPdf.internal.pages[1].join('\n').matchAll(/([\d.-]+) ([\d.-]+) Td\n\(([^)]+)\) Tj/g)]
  .map(([, x, y, value]) => ({ x: Number(x), y: Number(y), value }))
const firstBodyRun = textRuns.find((run) => run.value === 'Justified')
assert.ok(firstBodyRun)
const firstLine = textRuns.filter((run) => run.y === firstBodyRun.y)
justifiedPdf.setFont('helvetica', 'normal').setFontSize(10.5)
const finalWord = firstLine.at(-1)
assert.equal(firstLine[0].x, 72)
assert.ok(Math.abs(finalWord.x + justifiedPdf.getTextWidth(finalWord.value) - 540) < .01, 'Justified lines reach the right content margin')
const finalLine = textRuns.at(-1)
assert.equal(finalLine.x, 72)
assert.ok(finalLine.value.includes(' '), 'Last line stays naturally spaced')
const fixture = {
  'account.user': [{ name: 'Selection Test', title: 'Original Professional Title', description: 'Omitted Summary' }],
  'contact.contactinformation': [{ email: 'omitted@example.com' }],
  'experience.experience': [
    { id: 1, company: 'Keep Company', title: 'Keep Role', description: 'Keep Bullet' },
    { id: 2, company: 'Omit Company', title: 'Omit Role' },
  ],
  'projects.project': [{ id: 1, name: 'Keep Project' }, { id: 2, name: 'Omit Project' }],
}
const subset = { work: ['1'], projects: ['1'] }
const filtered = buildCvData(selectCvContent(fixture, subset))
assert.equal(filtered.email, '')
assert.deepEqual(filtered.summary, [])
assert.equal(filtered.work.length, 1)
assert.equal(filtered.work[0].roles[0].title, 'Keep Role')
assert.deepEqual(filtered.projects.map((project) => project.name), ['Keep Project'])
const selectedPdf = createCvDocument(fixture, subset)
checkPdf(selectedPdf)
const commands = selectedPdf.internal.pages.slice(1).flat().join('\n')
assert.ok(!commands.includes('Omit'))
function textX(label) {
  const match = commands.match(new RegExp(`([\\d.-]+) ([\\d.-]+) Td\\n\\(${label}\\) Tj`))
  assert.ok(match, `Text exists: ${label}`)
  return Number(match[1])
}
assert.equal(textX('Keep Company'), 72)
assert.equal(textX('Keep Role'), 90)
assert.equal(textX('Keep Bullet'), 120, 'Bullet text is indented under the role')
const customizedTitle = createCvDocument(fixture, subset, { title: 'Custom CV Title' })
checkPdf(customizedTitle)
const titleCommands = customizedTitle.internal.pages.slice(1).flat().join('\n')
assert.ok(titleCommands.includes('(Custom CV Title) Tj'))
assert.ok(!titleCommands.includes('Original Professional Title'))
assert.equal(fixture['account.user'][0].title, 'Original Professional Title', 'Editing the CV title preserves website content')
const customized = createCvDocument(fixture, { summary: ['summary'] }, { summary: 'Custom summary for this CV.\nA second paragraph.' })
checkPdf(customized)
const customText = customized.internal.pages.slice(1).flat().join('\n')
assert.ok(customText.includes('Custom summary for this CV.'))
assert.ok(customText.includes('A second paragraph.'))
assert.ok(!customText.includes('Omitted Summary'))
const noSummary = createCvDocument(fixture, {}, { summary: 'Should not appear' })
assert.ok(!noSummary.internal.pages.slice(1).flat().join('\n').includes('Should not appear'))
const skillsFixture = {
  'account.user': [{ name: 'Skills Table Test' }],
  'skills.skillcategory': [{ id: 1, name: 'Included Category' }, { id: 2, name: 'Excluded Category' }],
  'skills.skill': [{ id: 1, name: 'Included Skill', category: 1 }, { id: 2, name: 'Excluded Skill', category: 2 }],
}
const skillsSelection = { skills: ['1'] }
const tablePdf = createCvDocument(skillsFixture, skillsSelection)
checkPdf(tablePdf)
const tableText = tablePdf.internal.pages.slice(1).flat().join('\n')
assert.ok(tableText.includes('(Category) Tj'))
assert.ok(tableText.includes('(Skills) Tj'))
assert.ok(tableText.includes('(Included Category) Tj'))
assert.ok(tableText.includes('(Included Skill) Tj'))
assert.ok(!tableText.includes('Excluded'))
assert.ok(tableText.includes(' re\nB'), 'Skills have table cell borders and fills')
const withoutCategories = createCvDocument(skillsFixture, skillsSelection, { includeSkillCategories: false })
checkPdf(withoutCategories)
const noCategoriesText = withoutCategories.internal.pages.slice(1).flat().join('\n')
assert.ok(!noCategoriesText.includes('(Category) Tj'))
assert.ok(!noCategoriesText.includes('(Included Category) Tj'))
assert.ok(noCategoriesText.includes('(Included Skill) Tj'))
const longSkills = structuredClone(skillsFixture)
longSkills['skills.skill'] = Array.from({ length: 300 }, (_, id) => ({ id, name: `Long skill name ${id}`, category: 1 }))
const longTable = createCvDocument(longSkills)
assert.ok(checkPdf(longTable) > 1)
const longTableCommands = longTable.internal.pages.slice(1).flat().join('\n')
assert.equal([...longTableCommands.matchAll(/\(Skills\) Tj/g)].length, 1, 'Skills header appears only once across pages')
assert.equal([...longTableCommands.matchAll(/\(Category\) Tj/g)].length, 1, 'Category header appears only once across pages')
const paginatedExperience = {
  'account.user': [{ name: 'Experience Pagination Test' }],
  'experience.experience': [
    ...Array.from({ length: 18 }, (_, index) => ({ id: index, company: 'Unique Professional Org', title: `Professional role ${index}`, description: 'A responsibility with details to wrap onto several lines. '.repeat(5) })),
    ...Array.from({ length: 12 }, (_, index) => ({ id: index + 18, category: 'leadership', company: 'Unique Leadership Org', title: `Leadership role ${index}`, description: 'A responsibility with details to wrap onto several lines. '.repeat(5) })),
  ],
}
const experiencePdf = createCvDocument(paginatedExperience)
assert.ok(checkPdf(experiencePdf) > 3)
const experienceCommands = experiencePdf.internal.pages.slice(1).flat().join('\n')
for (const label of ['Unique Professional Org', 'Unique Leadership Org', 'WORK EXPERIENCE', 'LEADERSHIP EXPERIENCE']) {
  assert.equal(experienceCommands.split(`(${label}) Tj`).length - 1, 1, `${label} is not repeated at page breaks`)
}
for (const role of paginatedExperience['experience.experience']) {
  assert.equal(experienceCommands.split(`(${role.title}) Tj`).length - 1, 1, 'All positions appear exactly once')
}
// Exercise wrapping and pagination with descriptions longer than an entire page.
const long = {
  'account.user': [{ name: 'Long Content', description: 'Long paragraph text. '.repeat(1000) }],
  'experience.experience': [{ title: 'Long role title '.repeat(20), company: 'Organization', start_date: '2024-01-01', description: 'Long achievement. '.repeat(1000) }],
  'projects.project': [{ id: 1, name: 'Long project title '.repeat(20), distinct_features: `<ul><li>${'Long feature. '.repeat(1000)}</li></ul>` }],
}
checkPdf(createCvDocument(long))
assert.deepEqual(content, original, 'Generation does not mutate website data')
console.log(`CV checks passed: organization bulk selection, headings shown once, custom summary, category controls, skill tables, indentation, links, wrapping, and pagination (${pages} pages).`)
