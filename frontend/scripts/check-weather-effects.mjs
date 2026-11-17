import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parse, compileScript } from '@vue/compiler-sfc'

// Render the actual Vue component without adding a browser or test dependency.
const source = readFileSync(new URL('../src/components/Ambience/WeatherEffects.vue', import.meta.url), 'utf8')
const { descriptor } = parse(source)
const compiled = compileScript(descriptor, { id: 'weather-effects', inlineTemplate: true })
const code = compiled.content.replace(/from (['"])vue\1/g, () => `from ${JSON.stringify(import.meta.resolve('vue'))}`)
const { default: WeatherEffects } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
const render = (props) => renderToString(createSSRApp(WeatherEffects, props))

assert.doesNotMatch(await render({}), /weather-effects|weather-orb|weather-precipitation/, 'No weather effects without a real condition')
const sunny = await render({ kind: 'clear', night: false })
assert.match(sunny, /weather-orb/)
assert.doesNotMatch(sunny, /weather-stars|weather-clouds|weather-precipitation/)
const night = await render({ kind: 'clear', night: true })
assert.match(night, /data-night="true"/)
assert.equal((night.match(/class="weather-star"/g) || []).length, 24)
for (const kind of ['clouds', 'rain', 'snow', 'fog', 'storm']) {
  const html = await render({ kind, wind: 35 })
  assert.match(html, new RegExp(`data-weather="${kind}"`))
  assert.match(html, /aria-hidden="true"/)
  if (['rain', 'snow', 'storm'].includes(kind)) {
    assert.equal((html.match(/class="weather-drop"/g) || []).length, 40)
  } else {
    assert.doesNotMatch(html, /weather-precipitation/)
  }
  if (kind === 'fog') assert.match(html, /weather-fog-band/)
  else assert.match(html, /weather-clouds/)
  assert.equal(html.includes('weather-storm-glow'), kind === 'storm')
}
assert.match(await render({ kind: 'rain', wind: -30 }), /--weather-drift:0px/)
assert.match(await render({ kind: 'rain', wind: 150 }), /--weather-drift:120px/)
assert.equal(await render({ kind: 'snow' }), await render({ kind: 'snow' }), 'Keep particles stable across renders')

console.log('Weather effect render checks passed: neutral fallback, sun, moon, stars, clouds, rain, snow, fog, storm, and bounded wind.')
