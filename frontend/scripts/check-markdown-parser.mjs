import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { removeTrailingCommas, parseMarkdownContent } from '../src/markdownContent.mjs'

for (const raw of ['[1,]', '[1],', '[{"name":"example",},],', '[1,\n 2,\n],']) {
  assert.doesNotThrow(() => JSON.parse(removeTrailingCommas(raw)))
}
const strings = [',]', ',}', 'ends with a comma,', 'quote " and slash \\', '<p>hello, world</p>']
assert.deepEqual(JSON.parse(removeTrailingCommas(JSON.stringify(strings))), strings)
assert.throws(() => JSON.parse(removeTrailingCommas('[1] [2]')))
assert.throws(() => JSON.parse(removeTrailingCommas('[1 2]')))
const markdown = readFileSync(new URL('../FRONTEND_DATABASE.md', import.meta.url), 'utf8')
const data = parseMarkdownContent(markdown)
assert.equal(Object.keys(data).length, [...markdown.matchAll(/```json\n/g)].length)
assert.throws(() => parseMarkdownContent('## Public content snapshot\n### `account.medialinks` (1 records)\n```json\n[1 2]\n```'), /section "account.medialinks"/)
console.log('Markdown parser checks passed: content blocks, trailing commas, preserved strings, and invalid JSON errors.')
