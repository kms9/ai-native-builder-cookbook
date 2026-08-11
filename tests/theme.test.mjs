import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const theme = await readFile(new URL('../docs/.vitepress/theme/index.js', import.meta.url), 'utf8')

test('客户端将页面字体平滑方式恢复为浏览器默认值', () => {
  assert.match(
    theme,
    /typeof document !== ['"]undefined['"]/
  )
  assert.match(
    theme,
    /document\.body\.style\.webkitFontSmoothing\s*=\s*['"]auto['"]/
  )
})
