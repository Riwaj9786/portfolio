// Keep the chooser lightweight; the PDF library loads only when opening the CV.
import { formatAcademicPeriod, publicAcademicQualifications } from './academicQualifications.mjs'

const itemId = (row, index) => String(row.id ?? index)

export function getCvSelectionGroups(content) {
  const rows = (model) => content[model] || []
  const options = (model, include = () => true, label, detail) => rows(model)
    .map((row, index) => ({ row, id: itemId(row, index) }))
    .filter(({ row }) => include(row))
    .sort((a, b) => (b.row.start_date || b.row.issued_at || '').localeCompare(a.row.start_date || a.row.issued_at || ''))
    .map(({ row, id }) => ({ id, label: label(row), detail: detail?.(row) || '',
      ...(model === 'projects.project' ? { categoryId: String(row.category ?? 'uncategorized') } : {}),
    }))
  const projectItems = options('projects.project', (row) => !row.is_archive, (row) => row.name)
  const projectCategories = [...new Set(projectItems.map((item) => item.categoryId))].map((id) => ({
    id, label: rows('projects.projectcategory').find((row) => String(row.id) === id)?.name || 'Other projects',
    itemIds: projectItems.filter((item) => item.categoryId === id).map((item) => item.id),
  }))
  function experienceGroup(id, label, include) {
    const items = options('experience.experience', (row) => row.to_display !== false && include(row), (row) => row.title, (row) => row.company)
    const organizations = new Map()
    for (const item of items) {
      const company = String(item.detail || 'Other organization').trim().replace(/\s+/g, ' ')
      if (!organizations.has(company)) organizations.set(company, { id: company, label: company, items: [], itemIds: [] })
      organizations.get(company).items.push(item)
      organizations.get(company).itemIds.push(item.id)
    }
    return { id, label, items, organizations: [...organizations.values()] }
  }
  const skillCategories = new Map()
  for (const skill of rows('skills.skill')) {
    const id = String(skill.category ?? 'other')
    if (!skillCategories.has(id)) skillCategories.set(id, {
      id, label: rows('skills.skillcategory').find((row) => String(row.id) === id)?.name || 'Other skills', names: [],
    })
    skillCategories.get(id).names.push(skill.name)
  }
  return [
    { id: 'contact', label: 'Contact details & social links', items: [{ id: 'contact', label: 'Contact details & social links' }] },
    { id: 'summary', label: 'Professional summary', items: [{ id: 'summary', label: 'Professional summary' }] },
    { id: 'skills', label: 'Technical skills', items: [...skillCategories.values()].map(({ id, label, names }) => ({ id, label, detail: names.join(', ') })) },
    experienceGroup('work', 'Work experience', (row) => row.category !== 'leadership'),
    { id: 'education', label: 'Academic Qualifications', items: publicAcademicQualifications(rows('education.qualification'))
      .map((row) => ({ id: itemId(row, rows('education.qualification').indexOf(row)), label: row.degree,
        detail: [row.institution, formatAcademicPeriod(row)].filter(Boolean).join(' · '),
      })) },
    { id: 'projects', label: 'Projects', items: projectItems, categories: projectCategories },
    experienceGroup('leadership', 'Leadership experience', (row) => row.category === 'leadership'),
    { id: 'certifications', label: 'Certifications', items: options('certifications.certification', () => true, (row) => row.title, (row) => row.academy) },
  ].filter((group) => group.items.length)
}

export function createCvSelection(content) {
  return Object.fromEntries(getCvSelectionGroups(content).map((group) => [group.id, group.items.map((item) => item.id)]))
}

export function updateCvSelection(selection, groupId, itemIds, checked) {
  const selected = new Set(selection[groupId] || [])
  itemIds.forEach((id) => checked ? selected.add(id) : selected.delete(id))
  return { ...selection, [groupId]: [...selected] }
}

export function selectCvContent(content, selection) {
  if (!selection) return content
  const selected = (group, id) => (selection[group] || []).includes(id)
  const filter = (model, group) => (content[model] || []).filter((row, index) => selected(group, itemId(row, index)))
  return {
    ...content,
    'account.user': (content['account.user'] || []).map((row) => selected('summary', 'summary')
      ? row : { ...row, description: '', short_bio: '' }),
    'contact.contactinformation': selected('contact', 'contact') ? content['contact.contactinformation'] : [],
    'account.medialinks': selected('contact', 'contact') ? content['account.medialinks'] : [],
    'skills.skill': (content['skills.skill'] || []).filter((row) => selected('skills', String(row.category ?? 'other'))),
    'experience.experience': (content['experience.experience'] || []).filter((row, index) =>
      row.to_display !== false && selected(row.category === 'leadership' ? 'leadership' : 'work', itemId(row, index))),
    'projects.project': filter('projects.project', 'projects'),
    'education.qualification': filter('education.qualification', 'education'),
    'certifications.certification': filter('certifications.certification', 'certifications'),
  }
}
