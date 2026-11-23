import { jsPDF } from 'jspdf'
import { plainText } from './portfolioSearch.mjs'
import { selectCvContent } from './cvSelection.mjs'
import { formatAcademicPeriod, publicAcademicQualifications } from './academicQualifications.mjs'

// Use the public snapshot shared by the website, never the uploaded resume.
const text = (value) => plainText(String(value ?? '').replace(/<\/?(?:strong|b|em|i|span|a|u)\b[^>]*>/gi, ''))
  .replace(/&#(x[\da-f]+|\d+);/gi, (_, code) => {
    const point = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code)
    return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : ''
  })
  .replace(/[\u200b-\u200d\ufeff]/g, '')
  .replace(/[\u2010-\u2011]/g, '-')
  .replace(/\s+/g, ' ').trim()

const paragraphs = (html) => String(html || '').split(/<\/p\s*>|<br\s*\/?\s*>|\n/gi)
  .map(text).filter(Boolean)

const safeLink = (value) => {
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

export function formatCvDate(value, precision = 'month') {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', ...(precision === 'year' ? {} : { month: 'short' }), timeZone: 'UTC',
  }).format(date)
}

const period = (row) => {
  const start = formatCvDate(row.start_date, row.date_precision)
  const end = row.end_date ? formatCvDate(row.end_date, row.date_precision) : 'Present'
  return start ? `${start} – ${end}` : ''
}

function groupExperience(rows) {
  const groups = new Map()
  for (const row of rows) {
    const company = text(row.company)
    if (!groups.has(company)) groups.set(company, { company, roles: [] })
    groups.get(company).roles.push({
      title: text(row.title), period: period(row),
      bullets: [...paragraphs(row.description), ...(row.achievements || []).map(text)].filter(Boolean),
    })
  }
  return [...groups.values()]
}

export function buildCvData(content) {
  const rows = (model) => content[model] || []
  const profile = rows('account.user')[0] || {}
  if (!text(profile.name)) throw new Error('A profile name is required to generate the CV.')
  const contact = rows('contact.contactinformation')[0] || {}
  const categories = rows('skills.skillcategory')
  const skillGroups = new Map()
  for (const skill of rows('skills.skill')) {
    const category = text(categories.find((row) => row.id === skill.category)?.name || 'Other')
    if (!skillGroups.has(category)) skillGroups.set(category, [])
    const name = text(skill.name)
    if (name && !skillGroups.get(category).includes(name)) skillGroups.get(category).push(name)
  }
  const experiences = rows('experience.experience').filter((row) => row.to_display !== false)
    .sort((a, b) => (b.start_date || '').localeCompare(a.start_date || ''))
  const projects = rows('projects.project').filter((row) => !row.is_archive)
    .sort((a, b) => (b.start_date || '').localeCompare(a.start_date || ''))
    .map((row) => {
      const features = [...String(row.distinct_features || '').matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((match) => text(match[1])).filter(Boolean)
      return {
        name: text(row.name),
        links: rows('projects.projectlink').filter((link) => link.project === row.id)
          .map((link) => ({ label: text(link.name), url: safeLink(link.link) })).filter((link) => link.url),
        // Features are already concise CV bullets; otherwise use the opening description.
        bullets: features.length ? features : paragraphs(row.description).slice(0, 1),
      }
    })
  const socials = [
    ['lkin', 'LinkedIn'], ['gh', 'GitHub'],
  ].flatMap(([code, label]) => rows('account.medialinks')
    .filter((row) => row.platform_name === code)
    .map((row) => ({ label, url: safeLink(row.link) })).filter((row) => row.url))
  return {
    name: text(profile.name), title: text(profile.title),
    contact: [text(contact.address), text(contact.whatsapp)].filter(Boolean).join(' | '),
    email: text(contact.email), socials,
    summary: paragraphs(profile.description || profile.short_bio),
    skills: [...skillGroups].map(([category, names]) => ({ category, names })),
    work: groupExperience(experiences.filter((row) => row.category !== 'leadership')),
    leadership: groupExperience(experiences.filter((row) => row.category === 'leadership')),
    projects,
    education: publicAcademicQualifications(rows('education.qualification')).map((row) => ({
      degree: text(row.degree), institution: text(row.institution), period: formatAcademicPeriod(row) || (row.status === 'ongoing' ? 'In progress' : ''),
      url: safeLink(row.institution_url), location: text(row.location), grade: text(row.grade),
      description: paragraphs(row.description), achievements: (row.achievements || []).map(text).filter(Boolean),
    })),
    certifications: [...rows('certifications.certification')]
      .sort((a, b) => (b.issued_at || '').localeCompare(a.issued_at || ''))
      .map((row) => ({
        title: text(row.title), academy: text(row.academy), date: formatCvDate(row.issued_at),
        url: safeLink(row.url),
      })),
  }
}

// Letter paper, generous margins, Helvetica and green headings match Resume Technical.pdf.
// Draw real text and link annotations so the result remains searchable and selectable.
export function createCvDocument(content, selection, options = {}) {
  const data = buildCvData(selectCvContent(content, selection))
  if (typeof options.title === 'string') data.title = text(options.title)
  if (typeof options.summary === 'string' && (!selection || selection.summary?.includes('summary'))) {
    data.summary = options.summary.split(/\r?\n/).map(text).filter(Boolean)
  }
  const pdf = new jsPDF({ unit: 'pt', format: 'letter', compress: true })
  pdf.setProperties({ title: `${data.name} – CV`, author: data.name, subject: 'Curriculum Vitae' })
  const margin = 72
  const width = pdf.internal.pageSize.getWidth() - margin * 2
  const bottom = pdf.internal.pageSize.getHeight() - margin
  const bodySize = 10.5
  const lineHeight = 14
  let y = margin

  function style(size = bodySize, bold = false, color = '#111111') {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal')
    pdf.setFontSize(size)
    pdf.setTextColor(color)
  }
  function ensureSpace(height) {
    if (y + height > bottom) {
      pdf.addPage()
      y = margin
    }
  }
  function linesFor(value, size = bodySize, bold = false, available = width) {
    style(size, bold)
    return pdf.splitTextToSize(text(value), available)
  }
  function drawLine(line, x, baseline, available, justify = false) {
    const words = line.trim().split(/\s+/)
    if (!justify || words.length < 2) {
      pdf.text(line, x, baseline)
      return
    }
    const widths = words.map((word) => pdf.getTextWidth(word))
    const spacing = (available - widths.reduce((sum, value) => sum + value, 0)) / (words.length - 1)
    if (spacing < 0) {
      pdf.text(line, x, baseline)
      return
    }
    let cursor = x
    words.forEach((word, index) => {
      pdf.text(word, cursor, baseline)
      cursor += widths[index] + spacing
    })
  }
  function paragraph(value, { size = bodySize, bold = false, indent = 0, url = '', gap = 0, justify = false } = {}) {
    if (!text(value)) return
    const lines = linesFor(value, size, bold, width - indent)
    const height = size * (lineHeight / bodySize)
    // Keep normal paragraphs intact; unusually long ones can span pages.
    ensureSpace(Math.min(lines.length * height, bottom - margin))
    for (const [index, line] of lines.entries()) {
      ensureSpace(height)
      style(size, bold, url ? '#1155cc' : '#111111')
      drawLine(line, margin + indent, y + size, width - indent, justify && !url && index < lines.length - 1)
      if (url) {
        const lineWidth = pdf.getTextWidth(line)
        pdf.link(margin + indent, y, lineWidth, height, { url })
        pdf.setDrawColor('#1155cc')
        pdf.setLineWidth(0.4)
        pdf.line(margin + indent, y + size + 1, margin + indent + lineWidth, y + size + 1)
      }
      y += height
    }
    y += gap
  }
  function heading(label, reserve = 56) {
    ensureSpace(39 + Math.min(reserve, bottom - margin - 39))
    y += 16
    style(16, true, '#00b050')
    pdf.text(label.toUpperCase(), margin, y + 16)
    y += 23
  }
  function bullet(value, indent = 0) {
    if (!text(value)) return
    const lines = linesFor(value, bodySize, false, width - indent - 18)
    ensureSpace(Math.min(lines.length * lineHeight + 3, bottom - margin))
    style()
    pdf.text('•', margin + indent + 3, y + bodySize)
    paragraph(value, { indent: indent + 18, gap: 3, justify: true })
  }
  function skillsTable(rows) {
    const showCategories = options.includeSkillCategories !== false
    const padding = 8
    const columnWidths = showCategories ? [130, width - 130] : [width]
    const headers = showCategories ? [['Category'], ['Skills']] : [['Skills']]
    const cells = rows.map(({ category, names }) => showCategories
      ? [linesFor(category, bodySize, true, columnWidths[0] - padding * 2),
        linesFor(names.join(', '), bodySize, false, columnWidths[1] - padding * 2)]
      : [linesFor(names.join(', '), bodySize, false, width - padding * 2)])
    const rowHeight = (row) => Math.max(...row.map((lines) => lines.length)) * lineHeight + padding * 2
    const headerHeight = rowHeight(headers)
    function drawRow(row, header = false, continues = []) {
      const height = rowHeight(row)
      pdf.setDrawColor('#cbd8cf')
      pdf.setLineWidth(0.5)
      pdf.setFillColor(header ? '#eaf6ee' : '#ffffff')
      pdf.rect(margin, y, width, height, 'FD')
      let x = margin
      row.forEach((lines, column) => {
        if (column > 0) pdf.line(x, y, x, y + height)
        style(bodySize, header || (showCategories && column === 0))
        const justify = !header && (!showCategories || column === 1)
        lines.forEach((line, index) => drawLine(line, x + padding, y + padding + bodySize + index * lineHeight,
          columnWidths[column] - padding * 2, justify && (index < lines.length - 1 || continues[column])))
        x += columnWidths[column]
      })
      y += height
    }
    function nextPage() {
      pdf.addPage()
      y = margin
    }
    const firstHeight = rowHeight(cells[0])
    const firstReserve = firstHeight <= bottom - margin - headerHeight - 39 ? firstHeight : lineHeight + padding * 2
    heading('Technical Skills', headerHeight + firstReserve)
    drawRow(headers, true)
    for (const row of cells) {
      const remaining = row.map((lines) => [...lines])
      const height = rowHeight(row)
      // Keep ordinary rows together; split exceptionally long rows across pages.
      if (height <= bottom - margin && y + height > bottom) nextPage()
      while (remaining.some((lines) => lines.length)) {
        const count = Math.floor((bottom - y - padding * 2) / lineHeight)
        if (count < 1) {
          nextPage()
          continue
        }
        const chunk = remaining.map((lines) => lines.splice(0, count))
        drawRow(chunk, false, remaining.map((lines) => lines.length > 0))
        if (remaining.some((lines) => lines.length)) nextPage()
      }
    }
    y += 4
  }
  function titleWithDate(title, date, indent = 0) {
    style(bodySize)
    const dateWidth = date ? pdf.getTextWidth(date) : 0
    const titleWidth = width - indent - (date ? dateWidth + 20 : 0)
    const lines = linesFor(title, 12, true, titleWidth)
    ensureSpace(lines.length * 16 + 32)
    for (const [index, line] of lines.entries()) {
      style(12, true)
      pdf.text(line, margin + indent, y + 12)
      if (date && index === 0) {
        style(bodySize, false, '#444444')
        pdf.text(date, margin + width, y + 12, { align: 'right' })
      }
      y += 16
    }
  }
  function experience(groups) {
    const roleIndent = 18
    const bulletIndent = 30
    const openingHeight = (role) => {
      style(bodySize)
      const dateWidth = role.period ? pdf.getTextWidth(role.period) + 20 : 0
      const titleHeight = linesFor(role.title, 12, true, width - roleIndent - dateWidth).length * 16
      const bulletHeight = role.bullets[0]
        ? Math.min(linesFor(role.bullets[0], bodySize, false, width - bulletIndent - 18).length * lineHeight + 3, 140) : 0
      return titleHeight + Math.max(32, bulletHeight)
    }
    for (const group of groups) {
      const first = group.roles[0]
      ensureSpace(linesFor(group.company, 13, true).length * 18 + openingHeight(first) + 8)
      paragraph(group.company, { size: 13, bold: true, gap: 3 })
      for (const [index, role] of group.roles.entries()) {
        if (index > 0) {
          ensureSpace(openingHeight(role) + 8)
        }
        titleWithDate(role.title, role.period, roleIndent)
        role.bullets.forEach((value) => bullet(value, bulletIndent))
        y += 12
      }
      y += 3
    }
  }

  paragraph(data.name.toUpperCase(), { size: 22, bold: true, gap: 2 })
  paragraph(data.title)
  paragraph(data.contact)
  y += 12
  data.socials.forEach(({ label, url }) => paragraph(`${label}: ${url}`, { url }))
  if (data.email) paragraph(`Email: ${data.email}`, { url: `mailto:${data.email}` })
  if (data.summary.length) {
    heading('Professional Summary')
    data.summary.forEach((value) => paragraph(value, { gap: 6, justify: true }))
  }
  if (data.skills.length) {
    skillsTable(data.skills)
  }
  if (data.work.length) {
    heading('Work Experience')
    experience(data.work)
  }
  if (data.education.length) {
    heading('Academic Qualifications')
    for (const qualification of data.education) {
      titleWithDate(qualification.degree, qualification.period)
      paragraph(qualification.institution, { url: qualification.url })
      paragraph(qualification.location)
      if (qualification.grade) paragraph(`Grade: ${qualification.grade}`)
      qualification.description.forEach((value) => paragraph(value, { gap: 4, justify: true }))
      qualification.achievements.forEach((value) => bullet(value))
      y += 10
    }
  }
  if (data.projects.length) {
    heading('Projects')
    for (const project of data.projects) {
      ensureSpace(linesFor(project.name, 12, true).length * 16 + 46)
      paragraph(project.name, { size: 12, bold: true, gap: 2 })
      project.links.forEach(({ url }) => paragraph(url, { url, gap: 2 }))
      project.bullets.forEach((value) => bullet(value))
      y += 10
    }
  }
  if (data.leadership.length) {
    heading('Leadership Experience')
    experience(data.leadership)
  }
  if (data.certifications.length) {
    heading('Certifications')
    for (const certificate of data.certifications) {
      titleWithDate(certificate.title, certificate.date)
      paragraph(certificate.academy)
      if (certificate.url) paragraph(certificate.url, { url: certificate.url })
      y += 10
    }
  }
  return pdf
}

export function createCvUrl(content, selection, options) {
  return URL.createObjectURL(createCvDocument(content, selection, options).output('blob'))
}
