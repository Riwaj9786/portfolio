// Exercise real Vue component interactions without a browser or local server.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdtempSync, unlinkSync, rmdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse, compileScript } from '@vue/compiler-sfc'
import { createRenderer, nextTick } from 'vue'
import { parseMarkdownContent } from '../src/markdownContent.mjs'
import { getCvSelectionGroups } from '../src/cvSelection.mjs'
// Initialize the Node PDF implementation before installing the component host.
import '../src/generateCv.mjs'

const content = parseMarkdownContent(readFileSync(new URL('../FRONTEND_DATABASE.md', import.meta.url), 'utf8'))
const directory = mkdtempSync(join(tmpdir(), 'portfolio-cv-dialog-'))
const files = []
function compile(name) {
  const filename = new URL(`../src/components/Resume/${name}.vue`, import.meta.url)
  const { descriptor } = parse(readFileSync(filename, 'utf8'))
  let code = compileScript(descriptor, { id: name, inlineTemplate: true }).content
    .replace(/from ['"]vue['"]/g, `from ${JSON.stringify(import.meta.resolve('vue'))}`)
    .replace(/import content from 'virtual:portfolio-content';/, `const content = ${JSON.stringify(content)};`)
  for (const module of ['cvSelection.mjs', 'portfolioSearch.mjs', 'generateCv.mjs']) {
    code = code.replaceAll(`'@/${module}'`, JSON.stringify(new URL(`../src/${module}`, import.meta.url).href))
  }
  code = code.replace("'./CvContentGroup.vue'", JSON.stringify(pathToFileURL(join(directory, 'CvContentGroup.mjs')).href))
  const path = join(directory, `${name}.mjs`)
  writeFileSync(path, code)
  files.push(path)
  return pathToFileURL(path).href
}
function node(tag, text = '') {
  return {
    tag, tagName: tag.toUpperCase(), props: {}, children: [], parent: null, text, style: {}, listeners: {}, open: false,
    addEventListener(type, listener) { (this.listeners[type] ||= []).push(listener) },
    removeEventListener(type, listener) { this.listeners[type] = (this.listeners[type] || []).filter((item) => item !== listener) },
    setAttribute(key, value) { this.props[key] = value },
    removeAttribute(key) { delete this.props[key] },
    focus() { globalThis.document.activeElement = this },
    showModal() { this.open = true }, close() { this.open = false },
    querySelectorAll(tag) { return walk(this).filter((item) => item !== this && item.tag === tag) },
  }
}
function walk(root) { return [root, ...root.children.flatMap(walk)] }
const text = (root) => [root.text, ...root.children.map(text)].filter(Boolean).join(' ')
const hasClass = (element, name) => String(element.props.class || '').split(/\s+/).includes(name)
const renderer = createRenderer({
  createElement: (tag) => node(tag), createText: (value) => node('#text', value), createComment: (value) => node('#comment', value),
  setText: (element, value) => { element.text = value },
  setElementText: (element, value) => { element.text = value; element.children = [] },
  parentNode: (element) => element.parent,
  nextSibling: (element) => element.parent?.children[element.parent.children.indexOf(element) + 1] || null,
  insert(element, parent, anchor) {
    if (element.parent) element.parent.children.splice(element.parent.children.indexOf(element), 1)
    const index = anchor ? parent.children.indexOf(anchor) : -1
    if (index < 0) parent.children.push(element); else parent.children.splice(index, 0, element)
    element.parent = parent
  },
  remove(element) {
    if (element.parent) element.parent.children.splice(element.parent.children.indexOf(element), 1)
    element.parent = null
  },
  patchProp(element, key, previous, value) {
    element.props[key] = value
    if (['value', 'checked', 'type'].includes(key)) element[key] = value
  },
})
const priorDocument = globalThis.document
const priorWindow = globalThis.window
globalThis.document = { activeElement: null }
let openedUrl = ''
globalThis.window = { open(url, target) {
  assert.equal(target, '_blank')
  return { opener: null, closed: false, location: { replace(value) { openedUrl = value } }, close() {} }
} }
let app
try {
  compile('CvContentGroup')
  const component = (await import(compile('CvDialog'))).default
  const root = node('root')
  app = renderer.createApp(component)
  const vm = app.mount(root)
  const find = (predicate, within = root) => {
    const found = walk(within).find(predicate)
    assert.ok(found, 'Expected component control exists')
    return found
  }
  const byId = (id) => find((element) => element.props.id === id)
  const byClass = (name, within) => find((element) => hasClass(element, name), within)
  const click = async (element) => { element.props.onClick?.({ currentTarget: element, target: element }); await nextTick() }
  const change = async (element, checked) => { element.props.onChange({ target: { checked } }); await nextTick() }
  const input = async (element, value) => {
    element.value = value
    for (const listener of element.listeners.input || []) listener({ target: element })
    await nextTick()
  }
  const navigate = async (id) => click(byId(`cv-tab-${id}`))
  vm.show()
  assert.equal(find((element) => element.tag === 'dialog').open, true)
  assert.equal(byId('cv-tab-profile').props['aria-selected'], true)
  assert.equal(byId('cv-custom-title').value, content['account.user'][0].title)
  await input(byId('cv-custom-title'), 'Computer Engineer | Technical Professional | Graphic Designer')
  assert.equal(walk(root).filter((element) => element.props.role === 'tab' && element.props.id?.startsWith('cv-tab-')).length, 7)
  byId('cv-tab-profile').props.onKeydown({ key: 'End', preventDefault() {} })
  await nextTick()
  assert.equal(byId('cv-tab-review').props['aria-selected'], true)
  assert.equal(globalThis.document.activeElement.props.id, 'cv-tab-review')
  byId('cv-tab-review').props.onKeydown({ key: 'Home', preventDefault() {} })
  await nextTick()
  assert.equal(byId('cv-tab-profile').props['aria-selected'], true)

  await navigate('skills')
  await change(find((element) => element.tag === 'input', byClass('selection-toolbar')), false)
  assert.ok(text(byId('cv-tab-skills')).includes('0 of'))
  await change(find((element) => element.tag === 'input', byClass('selection-card')), true)
  assert.ok(text(byId('cv-tab-skills')).includes('1 of'))

  await navigate('education')
  assert.ok(text(byId('cv-panel-education')).includes('Academic Qualifications'))
  await change(find((element) => element.tag === 'input', byClass('selection-toolbar')), false)
  assert.ok(text(byId('cv-tab-education')).includes('0 of'))
  const academicGroup = getCvSelectionGroups(content).find((group) => group.id === 'education')
  await change(find((element) => element.tag === 'input', byClass('selection-card')), true)
  assert.ok(text(byId('cv-tab-education')).includes('1 of'))
  await navigate('review')
  assert.ok(text(byClass('cv-review')).includes(academicGroup.items[0].label))
  await click(find((element) => element.props['aria-label'] === 'Edit Academic Qualifications'))
  assert.equal(byId('cv-tab-education').props['aria-selected'], true)

  await navigate('experience')
  const work = getCvSelectionGroups(content).find((group) => group.id === 'work')
  await change(find((element) => element.tag === 'input', byClass('collection-header')), false)
  assert.ok(text(byClass('selection-count')).startsWith(String(work.items.length - work.organizations[0].itemIds.length)))
  await click(byId('cv-experience-leadership'))
  assert.equal(byId('cv-experience-leadership').props['aria-selected'], true)
  await change(find((element) => element.tag === 'input', byClass('collection-header')), false)

  await navigate('projects')
  await change(find((element) => element.tag === 'input', byClass('selection-toolbar')), false)
  const search = find((element) => element.tag === 'input' && element.props.type === 'search')
  await input(search, 'Bipad Assessment Tool')
  let searchEnterPrevented = false
  search.props.onKeydown({ key: 'Enter', preventDefault() { searchEnterPrevented = true } })
  assert.equal(searchEnterPrevented, true, 'Enter in search does not submit the PDF form')
  assert.equal(walk(root).filter((element) => hasClass(element, 'selection-item')).length, 1)
  await click(byClass('collection-toggle'))
  assert.equal(byClass('collection-toggle').props['aria-expanded'], false)
  await click(byClass('collection-toggle'))
  await change(find((element) => element.tag === 'input', byClass('collection-header')), true)
  const projects = getCvSelectionGroups(content).find((group) => group.id === 'projects')
  const category = projects.categories.find((category) => category.itemIds.includes(projects.items.find((item) => item.label.includes('Bipad Assessment Tool')).id))
  assert.ok(text(byId('cv-tab-projects')).includes(`${category.itemIds.length} of`), 'Category bulk selection includes all projects despite the search filter')

  await navigate('profile')
  const customRadio = find((element) => element.tag === 'input' && element.props.type === 'radio' && element.props.value === true)
  for (const listener of customRadio.listeners.change || []) listener({ target: customRadio })
  await nextTick()
  await input(byId('cv-custom-summary'), '')
  assert.equal(byClass('cv-open').props.disabled, true)
  await input(byId('cv-custom-summary'), 'Customized summary survives section changes.')
  assert.equal(byClass('cv-open').props.disabled, false)
  await navigate('certifications')
  await navigate('review')
  assert.ok(text(byClass('cv-review')).includes('Customized summary survives section changes.'))
  assert.ok(text(byClass('cv-review-identity')).includes('Computer Engineer | Technical Professional | Graphic Designer'))
  assert.ok(text(byClass('cv-review')).includes(category.label))
  await click(find((element) => element.props['aria-label'] === 'Edit Professional summary'))
  assert.equal(byId('cv-tab-profile').props['aria-selected'], true)
  assert.equal(globalThis.document.activeElement.props.id, 'cv-panel-profile')
  assert.equal(byId('cv-custom-summary').value, 'Customized summary survives section changes.')
  assert.equal(byId('cv-custom-title').value, 'Computer Engineer | Technical Professional | Graphic Designer')
  await navigate('review')
  const clear = find((element) => element.tag === 'button' && text(element) === 'Clear all', byClass('cv-review-toolbar'))
  await click(clear)
  assert.equal(byClass('cv-open').props.disabled, true)
  await click(find((element) => element.tag === 'button' && text(element) === 'Select all content'))
  assert.equal(byClass('cv-open').props.disabled, false)
  await find((element) => element.tag === 'form').props.onSubmit({ preventDefault() {} })
  await nextTick()
  assert.ok(openedUrl.startsWith('blob:'))
  assert.equal(find((element) => element.tag === 'dialog').open, false)
  console.log('CV dialog interactions passed: section navigation, organization selection, project search and bulk selection, summary persistence, review, edit links, and PDF opening.')
} finally {
  app?.unmount()
  globalThis.document = priorDocument
  globalThis.window = priorWindow
  files.forEach((file) => unlinkSync(file))
  rmdirSync(directory)
}
