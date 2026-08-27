import test from 'node:test'
import assert from 'node:assert/strict'
import {
  chapters,
  practicePages,
  referencePages,
  aboutPages,
  allPublicPages
} from '../docs/.vitepress/site-map.mjs'

test('正文保持第 0—11 章主线，并纳入 4A—4C、6A 和 10A', () => {
  assert.equal(chapters.length, 17)
  assert.equal(chapters[0].link, '/zh/chapters/00-getting-started')
  assert.equal(chapters[5].link, '/zh/chapters/04a-business-world')
  assert.equal(chapters[6].link, '/zh/chapters/04b-knowledge-and-ontology')
  assert.equal(chapters[7].link, '/zh/chapters/04c-agent-capability-architecture')
  assert.equal(chapters[10].link, '/zh/chapters/06a-sop-to-agent-constraints')
  assert.equal(chapters[15].link, '/zh/chapters/10a-organizational-learning-loop')
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
