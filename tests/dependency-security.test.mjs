import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

test('Mermaid 使用已修复公开内容注入与拒绝服务问题的版本', () => {
  assert.equal(packageJson.devDependencies.mermaid, '11.16.1')
})
