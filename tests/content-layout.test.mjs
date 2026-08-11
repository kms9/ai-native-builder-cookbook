import test from 'node:test'
import assert from 'node:assert/strict'
import { access } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const exists = async relative => access(path.join(root, relative)).then(() => true, () => false)

test('正文和配套资料已经迁入 docs/zh', async () => {
  assert.equal(await exists('docs/zh/chapters/00-getting-started.md'), true)
  assert.equal(await exists('docs/zh/chapters/11-capstone-and-review.md'), true)
  assert.equal(await exists('docs/zh/practice/workbook.md'), true)
  assert.equal(await exists('docs/zh/reference/references.md'), true)
  assert.equal(await exists('docs/zh/about/changelog.md'), true)
})

test('PDF 使用稳定英文下载名', async () => {
  assert.equal(await exists('docs/public/downloads/sop-to-agent-application.pdf'), true)
})

test('根目录不再保留第二份正文', async () => {
  assert.equal(await exists('00-如何使用这本书.md'), false)
  assert.equal(await exists('11-毕业项目与自我认证.md'), false)
  assert.equal(await exists('练习册与检查清单.md'), false)
})
