import { animate } from 'motion/mini'
import { inView } from 'motion'

const active = new Set()
const transitions = new WeakMap()
let preference
const ease = [0.22, 1, 0.36, 1]
const reduced = () => preference?.matches ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches
function clearStyles(element) { element.style.removeProperty('opacity'); element.style.removeProperty('translate') }
function finish(state) { state.animation?.stop(); state.animation = null; clearStyles(state.element) }
function observe(element, options = {}) {
  let seen = false
  const state = { element, animation: null }
  active.add(state)
  const focus = () => finish(state)
  element.addEventListener('focusin', focus)
  const stop = typeof IntersectionObserver === 'function' ? inView(element, () => {
    if (options.timeline) element.classList.add('is-story-active')
    if (!seen) {
      seen = true
      if (!reduced() && typeof element.animate === 'function' && !element.contains(document.activeElement)) {
        state.animation = animate(element, { opacity: [0, 1], translate: ['0 10px', '0 0'] }, {
          duration: 0.42, delay: Math.min(Math.max(Number(options.delay) || 0, 0), 0.18), ease,
        })
      }
    }
    if (options.timeline) return () => element.classList.remove('is-story-active')
  }, { amount: 0.08, margin: '0px 0px -24px 0px' }) : () => {}
  return () => { stop(); finish(state); active.delete(state); element.removeEventListener('focusin', focus); element.classList.remove('is-story-active') }
}
const reveals = new WeakMap()
const groups = new WeakMap()
function syncGroup(element) {
  const states = groups.get(element)
  const children = new Set(element.children)
  for (const [child, cleanup] of states) if (!children.has(child)) { cleanup(); states.delete(child) }
  let index = 0
  for (const child of children) {
    if (!states.has(child)) states.set(child, observe(child, { delay: Math.min(index * 0.045, 0.18) }))
    index++
  }
}
export function installPortfolioMotion(app) {
  preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  const handlePreference = () => {
    if (preference.matches) {
      for (const state of active) finish(state)
      for (const element of document.querySelectorAll('[data-motion-transition]')) cancelTransition(element)
    }
  }
  preference.addEventListener('change', handlePreference)
  app.onUnmount(() => preference.removeEventListener('change', handlePreference))
  app.directive('reveal', {
    mounted(element, binding) { reveals.set(element, observe(element, binding.value || {})) },
    beforeUnmount(element) { reveals.get(element)?.(); reveals.delete(element) },
  })
  app.directive('stagger', {
    mounted(element) { groups.set(element, new Map()); syncGroup(element) },
    updated(element) { syncGroup(element) },
    beforeUnmount(element) { for (const cleanup of groups.get(element)?.values() || []) cleanup(); groups.delete(element) },
  })
}
export function cancelTransition(element) {
  const state = transitions.get(element)
  if (state) {
    state.animation.stop()
    clearStyles(element)
    transitions.delete(element)
    element.removeAttribute('data-motion-transition')
    state.done()
  }
}
function transition(element, done, entering) {
  cancelTransition(element)
  if (reduced() || typeof element.animate !== 'function') { clearStyles(element); done(); return }
  const animation = animate(element, {
    opacity: entering ? [0.65, 1] : [1, 0],
    translate: entering ? ['0 5px', '0 0'] : ['0 0', '0 -3px'],
  }, { duration: entering ? 0.24 : 0.14, ease })
  transitions.set(element, { animation, done })
  element.setAttribute('data-motion-transition', '')
  animation.then(() => {
    if (transitions.get(element)?.animation !== animation) return
    transitions.delete(element)
    element.removeAttribute('data-motion-transition')
    clearStyles(element)
    done()
  })
}
export const enterContent = (element, done) => transition(element, done, true)
export const leaveContent = (element, done) => transition(element, done, false)
