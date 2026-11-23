function formatDate(value, precision) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', ...(precision === 'month' ? { month: 'short' } : {}), timeZone: 'UTC',
  }).format(date)
}

export function formatAcademicPeriod(qualification) {
  const start = formatDate(qualification.start_date, qualification.date_precision)
  const end = formatDate(qualification.end_date, qualification.date_precision)
  if (start && end) return start === end ? start : `${start} – ${end}`
  if (start && qualification.status === 'ongoing') return `${start} – Present`
  return end || start
}

export function academicInstitutionUrl(value) {
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

export function publicAcademicQualifications(qualifications = []) {
  return qualifications.filter((row) => row.to_display !== false).sort((a, b) =>
    Number(b.status === 'ongoing') - Number(a.status === 'ongoing')
    || (b.end_date || b.start_date || '').localeCompare(a.end_date || a.start_date || ''))
}

export function academicQualificationCards(qualifications) {
  return publicAcademicQualifications(qualifications).map((qualification) => ({
    id: qualification.id,
    company: String(qualification.institution || '').trim(),
    company_url: academicInstitutionUrl(qualification.institution_url),
    roles: [{
      ...qualification,
      title: qualification.degree,
      display_period: formatAcademicPeriod(qualification) || (qualification.status === 'ongoing' ? 'In progress' : ''),
      date_precision: qualification.date_precision || 'year',
      description: [qualification.location, qualification.grade ? `Grade: ${qualification.grade}` : '', qualification.description].filter(Boolean).join('\n\n'),
      job_type: qualification.status === 'ongoing' ? 'In progress' : '',
    }],
  }))
}
