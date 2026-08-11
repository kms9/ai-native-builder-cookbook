import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
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

test('首页版本说明位于开放阅读与反馈之前', async () => {
  const homepage = await readFile(path.join(root, 'docs/zh/index.md'), 'utf8')
  const learningPath = homepage.indexOf('## 四部分学习路径')
  const materials = homepage.indexOf('## 配套材料')
  const releaseBoundary = homepage.indexOf('## 当前版本与发布边界')
  const feedback = homepage.indexOf('## 开放阅读与反馈')

  assert.ok(learningPath < materials)
  assert.ok(materials < releaseBoundary)
  assert.ok(releaseBoundary < feedback)
})
