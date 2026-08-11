import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { validateMarkdownLinks, validateLanguageDirs, validateSite } from '../scripts/check-site.mjs'
import { allPublicPages } from '../docs/.vitepress/site-map.mjs'

test('失效 Markdown 文件链接会报出来源文件', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'site-check-'))
  await mkdir(path.join(root, 'docs/zh'), { recursive: true })
  await writeFile(path.join(root, 'docs/zh/index.md'), '# 首页\n[缺失](./missing.md)\n')
  const errors = await validateMarkdownLinks(root)
  assert.ok(errors.some(error => error.includes('docs/zh/index.md') && error.includes('missing.md')))
})

test('失效标题锚点会报出目标锚点', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'site-check-'))
  await mkdir(path.join(root, 'docs/zh'), { recursive: true })
  await writeFile(path.join(root, 'docs/zh/index.md'), '# 首页\n[错误锚点](./page.md#不存在)\n')
  await writeFile(path.join(root, 'docs/zh/page.md'), '# 页面\n\n## 已存在\n')
  const errors = await validateMarkdownLinks(root)
  assert.ok(errors.some(error => error.includes('page.md#不存在')))
})

test('只有 zh 可以作为语言目录', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'site-check-'))
  await mkdir(path.join(root, 'docs/zh'), { recursive: true })
  await mkdir(path.join(root, 'docs/en'), { recursive: true })
  const errors = await validateLanguageDirs(root)
  assert.deepEqual(errors, ['发现未批准的语言目录: docs/en'])
})

test('站点级检查不会为同一个缺失必需页面重复报告断链', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'site-check-'))
  await mkdir(path.join(root, 'docs/zh'), { recursive: true })
  await mkdir(path.join(root, 'docs/public/downloads'), { recursive: true })
  await writeFile(path.join(root, 'README.md'), '# repository\n')
  await writeFile(path.join(root, 'docs/index.md'), '# redirect\n')
  await writeFile(path.join(root, 'docs/public/logo.svg'), '<svg/>\n')
  await writeFile(path.join(root, 'docs/public/downloads/sop-to-agent-application.pdf'), '')

  for (const { link } of allPublicPages.filter(page => page.link !== '/zh/')) {
    const relative = link.replace(/^\/zh\//, '')
    const file = path.join(root, 'docs/zh', `${relative}.md`)
    await mkdir(path.dirname(file), { recursive: true })
    const content = link === '/zh/about/project' ? '# project\n[home](../index.md)\n' : '# page\n'
    await writeFile(file, content)
  }
  await mkdir(path.join(root, 'docs/zh/about'), { recursive: true })
  await writeFile(path.join(root, 'docs/zh/about/companion-pdf.md'), '# companion\n')

  assert.deepEqual(await validateSite(root), ['导航目标不存在: /zh/'])
})
