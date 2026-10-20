import assert from 'node:assert/strict'
import { installPortfolioMotion, enterContent, leaveContent } from '../src/motion/portfolioMotion.js'

const mediaListeners = new Set()
const preference = { matches: false, addEventListener: (_, fn) => mediaListeners.add(fn), removeEventListener: (_, fn) => mediaListeners.delete(fn) }
globalThis.window = { matchMedia: () => preference }
globalThis.document = { activeElement: null, querySelectorAll: () => [] }
// Simulate missing IntersectionObserver: the page must remain readable.
const directives = new Map()
let unmount
installPortfolioMotion({ directive: (name, hooks) => directives.set(name, hooks), onUnmount: (fn) => { unmount = fn } })
function element() {
  const listeners = new Set()
  const values = new Map()
  return {
    children: [], listeners, values,
    style: { removeProperty: (name) => values.delete(name) },
    addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn),
    classList: { remove() {} }, contains: () => false,
  }
}
const item = element()
directives.get('reveal').mounted(item, { value: { timeline: true } })
assert.equal(item.values.size, 0, 'Fallback must not hide content')
assert.equal(item.listeners.size, 1)
const group = element()
const child = element()
group.children = [child]
directives.get('stagger').mounted(group)
assert.equal(child.listeners.size, 1)
group.children = []
directives.get('stagger').updated(group)
assert.equal(child.listeners.size, 0, 'Removed children must clean up observers/listeners')
preference.matches = true
for (const listener of mediaListeners) listener()
let completions = 0
item.animate = () => { throw new Error('Reduced-motion mode must not animate') }
enterContent(item, () => completions++)
leaveContent(item, () => completions++)
assert.equal(completions, 2, 'Reduced-motion transitions must complete synchronously')
preference.matches = false
const unsupported = element()
enterContent(unsupported, () => completions++)
assert.equal(completions, 3, 'Missing animation support must complete transitions')
directives.get('reveal').beforeUnmount(item)
directives.get('stagger').beforeUnmount(group)
assert.equal(item.listeners.size, 0)
unmount()
assert.equal(mediaListeners.size, 0)
console.log('Motion accessibility checks passed: visible fallbacks, reduced motion, immediate completion, and lifecycle cleanup.')
