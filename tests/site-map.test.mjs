import test from 'node:test'
import assert from 'node:assert/strict'
import {
  chapters,
  practicePages,
  referencePages,
  aboutPages,
  allPublicPages
} from '../docs/.vitepress/site-map.mjs'

test('正文保持第 0—11 章和第 6A 章共 13 页', () => {
  assert.equal(chapters.length, 13)
  assert.equal(chapters[0].link, '/zh/chapters/00-getting-started')
  assert.equal(chapters[7].link, '/zh/chapters/06a-sop-to-agent-constraints')
  assert.equal(chapters.at(-1).link, '/zh/chapters/11-capstone-and-review')
})

test('所有公开页面使用唯一中文短路径', () => {
  const links = allPublicPages.map(({ link }) => link)
  assert.equal(new Set(links).size, links.length)
  assert.ok(links.every(link => link.startsWith('/zh/')))
  assert.ok(links.every(link => !/[\u3400-\u9fff]/u.test(link)))
})

test('实践、参考与关于页面数量固定', () => {
  assert.equal(practicePages.length, 6)
  assert.equal(referencePages.length, 2)
  assert.equal(aboutPages.length, 3)
})
