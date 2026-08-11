---
title: "AI Native Builder 中文 VitePress 站点实施计划"
desc: "把已批准的中文阅读站设计拆成可验证、可单独提交的内容迁移、站点配置、主题、检查、部署和公网验收任务。"
aliases:
  - "VitePress 中文站实施计划"
  - "AI Native Builder Pages Plan"
tags:
  - "技术/文档工程"
  - "写作/发布"
  - "产品/企业AI"
status: "待执行"
updated: 2026-08-11
---

# AI Native Builder Chinese VitePress Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把现有中文 Markdown 自学书迁移成部署在 GitHub Pages、入口为 `/zh/` 的 VitePress 阅读站，并保留单一内容事实源。

**Architecture:** 标准 `docs/` 作为 VitePress source root，正文按 `chapters`、`practice`、`reference`、`about` 分组；`site-map.mjs` 同时向导航配置与检查脚本提供稳定页面清单。GitHub Actions 在 `main` 上运行结构检查和生产构建，再发布 `docs/.vitepress/dist`。

**Tech Stack:** Node.js 24、npm、VitePress 1.6.4、Vue 3、Vite、Mermaid 11.14、vitepress-plugin-mermaid 2.0.17、Node test runner、GitHub Actions、GitHub Pages。

## Global Constraints

- 中文站点固定在 `/zh/`，首版不得配置或生成其他语言。
- 公开 base path 固定为 `/ai-native-builder-cookbook/`。
- 使用稳定英文／数字短链接，不把中文标题放入 URL。
- 书稿迁移到 `docs/zh/` 后，仓库根目录不得保留第二份正文。
- 根 README 服务 GitHub 访问者；`docs/zh/index.md` 服务在线读者。
- 作者、版本 `v0.3.0-rc.1`、状态“公开评审稿（发布候选）”和 CC BY-SA 4.0 不得被站点迁移改变。
- 站点主题只复用通用技术路线和视觉原则，不复制参考站点内容、品牌图标或专有素材。
- `docs/superpowers/**` 必须排除出公开构建、导航和搜索。
- 迁移正文时只改链接、路径和站点入口，不顺带重写内容论点。
- 创建或修改文件使用 `apply_patch`；文件移动使用 `git mv`；机械链接替换完成后必须检查 diff。
- 每个任务独立验证并提交；未经验证不得进入下一个任务。

---

### Task 1: 锁定站点页面契约与 Node 工程

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `docs/.vitepress/site-map.mjs`
- Create: `tests/site-map.test.mjs`

**Interfaces:**
- Produces: `chapters`, `practicePages`, `referencePages`, `aboutPages`, `allPublicPages`, `topNav`, `sidebar`。
- Consumes: 已批准设计中的固定页面标题与短链接。

- [ ] **Step 1: 写页面契约失败测试**

```js
// tests/site-map.test.mjs
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
```

- [ ] **Step 2: 运行测试并确认缺少契约模块**

Run: `node --test tests/site-map.test.mjs`

Expected: FAIL，错误包含 `ERR_MODULE_NOT_FOUND` 和 `docs/.vitepress/site-map.mjs`。

- [ ] **Step 3: 创建 package.json**

```json
{
  "name": "ai-native-builder-cookbook",
  "private": true,
  "version": "0.3.0-rc.1",
  "type": "module",
  "scripts": {
    "test": "node --test tests/*.test.mjs",
    "site:check": "node scripts/check-site.mjs",
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  },
  "devDependencies": {
    "mermaid": "11.14.0",
    "vitepress": "1.6.4",
    "vitepress-plugin-mermaid": "2.0.17"
  }
}
```

- [ ] **Step 4: 创建页面契约**

先创建构建产物排除规则：

```gitignore
node_modules/
docs/.vitepress/cache/
docs/.vitepress/dist/
.DS_Store
```

再创建页面契约：

```js
// docs/.vitepress/site-map.mjs
export const chapters = [
  { text: '第 0 章｜如何使用这本书', link: '/zh/chapters/00-getting-started' },
  { text: '第 1 章｜为什么企业 AI 需要新的建设角色', link: '/zh/chapters/01-why-new-role' },
  { text: '第 2 章｜FDE 是什么', link: '/zh/chapters/02-what-is-fde' },
  { text: '第 3 章｜外部 FDE 与内部 AI Native Builder', link: '/zh/chapters/03-fde-and-ai-native-builder' },
  { text: '第 4 章｜为什么智能体时代更需要 AI Native Builder', link: '/zh/chapters/04-agent-era-builder' },
  { text: '第 5 章｜从工具愿望到可验证场景', link: '/zh/chapters/05-verifiable-scenario' },
  { text: '第 6 章｜重构人—AI—系统工作流', link: '/zh/chapters/06-workflow-redesign' },
  { text: '第 6A 章｜从 SOP 到智能体约束', link: '/zh/chapters/06a-sop-to-agent-constraints' },
  { text: '第 7 章｜把业务变成可运行系统', link: '/zh/chapters/07-runnable-system' },
  { text: '第 8 章｜用评估与治理证明系统可控', link: '/zh/chapters/08-evaluation-and-governance' },
  { text: '第 9 章｜从试点到真实采用', link: '/zh/chapters/09-pilot-to-adoption' },
  { text: '第 10 章｜把一次项目变成组织能力', link: '/zh/chapters/10-organizational-capability' },
  { text: '第 11 章｜毕业项目与自我认证', link: '/zh/chapters/11-capstone-and-review' }
]

export const practicePages = [
  { text: '练习册与检查清单', link: '/zh/practice/workbook' },
  { text: 'SOP 到智能体约束转化卡', link: '/zh/practice/sop-to-agent-card' },
  { text: '配套案例与练习扩展', link: '/zh/practice/extensions' },
  { text: '实践案例：从需求到 MR 与上线', link: '/zh/practice/case-a-delivery' },
  { text: '实践旁注：Skill 仓库交付闭环', link: '/zh/practice/delivery-notes' },
  { text: '练习册扩展：需求分流与自动交付', link: '/zh/practice/delivery-workbook' }
]

export const referencePages = [
  { text: '术语表', link: '/zh/reference/glossary' },
  { text: '参考资料', link: '/zh/reference/references' }
]

export const aboutPages = [
  { text: '开放内容项目说明', link: '/zh/about/project' },
  { text: '版本变更记录', link: '/zh/about/changelog' },
  { text: '内容贡献说明', link: '/zh/about/contributing' }
]

export const allPublicPages = [
  { text: '首页', link: '/zh/' },
  ...chapters,
  ...practicePages,
  ...referencePages,
  ...aboutPages
]

export const topNav = [
  { text: '首页', link: '/zh/' },
  { text: '正文', link: chapters[0].link, activeMatch: '^/zh/chapters/' },
  { text: '实践材料', link: practicePages[0].link, activeMatch: '^/zh/practice/' },
  { text: '查阅资料', link: referencePages[0].link, activeMatch: '^/zh/reference/' },
  {
    text: '关于',
    items: [
      ...aboutPages,
      { text: '许可证', link: 'https://github.com/kms9/ai-native-builder-cookbook/blob/main/LICENSE' }
    ]
  },
  { text: 'GitHub', link: 'https://github.com/kms9/ai-native-builder-cookbook' }
]

export const sidebar = [
  { text: '第一部分：角色为什么出现', items: chapters.slice(0, 5) },
  { text: '第二部分：完成一次端到端建设', items: chapters.slice(5, 10) },
  { text: '第三部分：从试点走向组织能力', items: chapters.slice(10, 12) },
  { text: '第四部分：用作品说明能力', items: chapters.slice(12) },
  { text: '实践材料', items: practicePages },
  { text: '查阅资料', items: referencePages }
]
```

- [ ] **Step 5: 运行契约测试**

Run: `node --test tests/site-map.test.mjs`

Expected: 3 tests PASS。

- [ ] **Step 6: 提交页面契约**

```bash
git add package.json .gitignore docs/.vitepress/site-map.mjs tests/site-map.test.mjs
git commit -m "build: define VitePress site map"
```

### Task 2: 迁移书稿、项目页与 PDF

**Files:**
- Move: 13 root chapter Markdown files → `docs/zh/chapters/*.md`
- Move: 6 practice Markdown files → `docs/zh/practice/*.md`
- Move: 2 reference Markdown files → `docs/zh/reference/*.md`
- Move: `开源项目说明.md`, `CHANGELOG.md`, `CONTRIBUTING.md` → `docs/zh/about/*.md`
- Move: `share_src/从SOP梳理到智能体应用.pdf` → `docs/public/downloads/sop-to-agent-application.pdf`
- Move: `share_src/README.md` → `docs/zh/about/companion-pdf.md`
- Create: `tests/content-layout.test.mjs`
- Modify: all moved Markdown files containing local links

**Interfaces:**
- Consumes: `allPublicPages` and file mapping from Task 1。
- Produces: VitePress source content at the stable paths used by `site-map.mjs`。

- [ ] **Step 1: 写迁移布局失败测试**

```js
// tests/content-layout.test.mjs
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
```

- [ ] **Step 2: 运行测试并确认旧布局不满足要求**

Run: `node --test tests/content-layout.test.mjs`

Expected: FAIL，至少报告 `docs/zh/chapters/00-getting-started.md` 不存在。

- [ ] **Step 3: 使用 git mv 完成精确迁移**

```bash
mkdir -p docs/zh/chapters docs/zh/practice docs/zh/reference docs/zh/about docs/public/downloads
git mv 00-如何使用这本书.md docs/zh/chapters/00-getting-started.md
git mv 01-为什么企业AI需要新的建设角色.md docs/zh/chapters/01-why-new-role.md
git mv 02-FDE是什么.md docs/zh/chapters/02-what-is-fde.md
git mv 03-外部FDE与内部AI-Native-Builder.md docs/zh/chapters/03-fde-and-ai-native-builder.md
git mv 04-为什么智能体时代更需要AI-Native-Builder.md docs/zh/chapters/04-agent-era-builder.md
git mv 05-从工具愿望到可验证场景.md docs/zh/chapters/05-verifiable-scenario.md
git mv 06-重构人AI系统工作流.md docs/zh/chapters/06-workflow-redesign.md
git mv 06A-从SOP到智能体约束.md docs/zh/chapters/06a-sop-to-agent-constraints.md
git mv 07-把业务变成可运行系统.md docs/zh/chapters/07-runnable-system.md
git mv 08-用评估与治理证明系统可控.md docs/zh/chapters/08-evaluation-and-governance.md
git mv 09-从试点到真实采用.md docs/zh/chapters/09-pilot-to-adoption.md
git mv 10-把一次项目变成组织能力.md docs/zh/chapters/10-organizational-capability.md
git mv 11-毕业项目与自我认证.md docs/zh/chapters/11-capstone-and-review.md
git mv 练习册与检查清单.md docs/zh/practice/workbook.md
git mv 模板-SOP到智能体约束转化卡.md docs/zh/practice/sop-to-agent-card.md
git mv 配套案例与练习扩展.md docs/zh/practice/extensions.md
git mv 案例A-从多维表需求到MR与上线.md docs/zh/practice/case-a-delivery.md
git mv 实践旁注-内部Skill仓库交付闭环.md docs/zh/practice/delivery-notes.md
git mv 练习册扩展-需求分流与自动交付.md docs/zh/practice/delivery-workbook.md
git mv 术语表.md docs/zh/reference/glossary.md
git mv 参考资料.md docs/zh/reference/references.md
git mv 开源项目说明.md docs/zh/about/project.md
git mv CHANGELOG.md docs/zh/about/changelog.md
git mv CONTRIBUTING.md docs/zh/about/contributing.md
git mv share_src/README.md docs/zh/about/companion-pdf.md
git mv share_src/从SOP梳理到智能体应用.pdf docs/public/downloads/sop-to-agent-application.pdf
rmdir share_src
```

- [ ] **Step 4: 使用 apply_patch 按目标文件所在目录重写链接**

必须覆盖以下旧目标到新目标的完整映射，并使用相对路径：

```text
00-如何使用这本书.md                 -> chapters/00-getting-started.md
01-为什么企业AI需要新的建设角色.md   -> chapters/01-why-new-role.md
02-FDE是什么.md                      -> chapters/02-what-is-fde.md
03-外部FDE与内部AI-Native-Builder.md -> chapters/03-fde-and-ai-native-builder.md
04-为什么智能体时代更需要AI-Native-Builder.md -> chapters/04-agent-era-builder.md
05-从工具愿望到可验证场景.md         -> chapters/05-verifiable-scenario.md
06-重构人AI系统工作流.md             -> chapters/06-workflow-redesign.md
06A-从SOP到智能体约束.md             -> chapters/06a-sop-to-agent-constraints.md
07-把业务变成可运行系统.md           -> chapters/07-runnable-system.md
08-用评估与治理证明系统可控.md       -> chapters/08-evaluation-and-governance.md
09-从试点到真实采用.md               -> chapters/09-pilot-to-adoption.md
10-把一次项目变成组织能力.md         -> chapters/10-organizational-capability.md
11-毕业项目与自我认证.md             -> chapters/11-capstone-and-review.md
练习册与检查清单.md                  -> practice/workbook.md
模板-SOP到智能体约束转化卡.md        -> practice/sop-to-agent-card.md
配套案例与练习扩展.md                -> practice/extensions.md
案例A-从多维表需求到MR与上线.md      -> practice/case-a-delivery.md
实践旁注-内部Skill仓库交付闭环.md    -> practice/delivery-notes.md
练习册扩展-需求分流与自动交付.md     -> practice/delivery-workbook.md
术语表.md                            -> reference/glossary.md
参考资料.md                          -> reference/references.md
开源项目说明.md                      -> about/project.md
CHANGELOG.md                         -> about/changelog.md
CONTRIBUTING.md                      -> about/contributing.md
share_src/从SOP梳理到智能体应用.pdf  -> /downloads/sop-to-agent-application.pdf
share_src/README.md                   -> about/companion-pdf.md
README.md                             -> ../index.md
LICENSE                               -> https://github.com/kms9/ai-native-builder-cookbook/blob/main/LICENSE
```

同目录正文互链使用 `./slug.md`；正文到实践或参考使用 `../practice/...`、`../reference/...`；实践页到正文使用 `../chapters/...`；关于页到其他分组使用 `../...`。保留原有 `#锚点`。

`docs/zh/about/companion-pdf.md` 中原本只写文件名的 PDF 链接 `(从SOP梳理到智能体应用.pdf)` 也必须改成 `(/downloads/sop-to-agent-application.pdf)`。所有移动页面中的课程首页链接统一指向 `../index.md`；原来指向 `README.md#当前版本与发布边界` 的链接改成 `../index.md#当前版本与发布边界`。

- [ ] **Step 5: 确认旧文件名和旧 PDF 路径归零**

Run:

```bash
rg -n '00-如何使用这本书\.md|11-毕业项目与自我认证\.md|share_src/从SOP梳理到智能体应用\.pdf' docs/zh --glob '*.md'
```

Expected: 无输出，退出码 1。

- [ ] **Step 6: 运行布局测试并检查 rename diff**

Run:

```bash
node --test tests/content-layout.test.mjs
git diff --check
git diff --summary
```

Expected: 3 tests PASS；`git diff --summary` 主要显示 rename，不出现意外删除。

- [ ] **Step 7: 提交内容迁移**

```bash
git add docs tests/content-layout.test.mjs
git commit -m "docs: migrate book content into VitePress"
```

### Task 3: 实现站点结构与链接检查器

**Files:**
- Create: `scripts/check-site.mjs`
- Create: `tests/check-site.test.mjs`
- Modify: `package.json` only if test glob or script needs correction

**Interfaces:**
- Consumes: `allPublicPages` from `docs/.vitepress/site-map.mjs`。
- Produces: `validateSite(rootDir): Promise<string[]>` and CLI exit code 0/1。

- [ ] **Step 1: 写检查器失败测试**

```js
// tests/check-site.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { validateMarkdownLinks, validateLanguageDirs } from '../scripts/check-site.mjs'

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
```

- [ ] **Step 2: 运行测试并确认检查器尚不存在**

Run: `node --test tests/check-site.test.mjs`

Expected: FAIL，错误包含 `ERR_MODULE_NOT_FOUND` 和 `scripts/check-site.mjs`。

- [ ] **Step 3: 实现最小检查器**

```js
// scripts/check-site.mjs
import { access, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { allPublicPages } from '../docs/.vitepress/site-map.mjs'

const markdownLink = /!?\[[^\]]*\]\(([^)]+)\)/g
const allowedDocsDirs = new Set(['.vitepress', 'public', 'superpowers', 'zh'])

const exists = async file => access(file).then(() => true, () => false)

async function walkMarkdown(dir) {
  if (!(await exists(dir))) return []
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(entries.map(entry => {
    const target = path.join(dir, entry.name)
    if (entry.isDirectory()) return walkMarkdown(target)
    return entry.isFile() && entry.name.endsWith('.md') ? [target] : []
  }))
  return nested.flat()
}

function stripCodeFences(source) {
  return source.replace(/```[\s\S]*?```/g, '').replace(/~~~[\s\S]*?~~~/g, '')
}

function slugifyHeading(heading) {
  return heading
    .replace(/\s*\{#[^}]+\}\s*$/, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function collectAnchors(source) {
  const anchors = new Set()
  const counts = new Map()
  for (const match of stripCodeFences(source).matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)) {
    const explicit = match[1].match(/\s*\{#([^}]+)\}\s*$/)?.[1]
    const base = explicit || slugifyHeading(match[1])
    const count = counts.get(base) || 0
    anchors.add(count === 0 ? base : `${base}-${count}`)
    counts.set(base, count + 1)
  }
  return anchors
}

function linkToFile(root, sourceFile, rawTarget) {
  const [target, fragment = ''] = rawTarget.split('#', 2)
  const normalizedFragment = decodeURIComponent(fragment).trim().toLowerCase()
  if (/^(?:https?:|mailto:|tel:)/.test(target)) return null
  if (!target) return { file: sourceFile, fragment: normalizedFragment }
  const decoded = decodeURI(target)
  if (decoded.startsWith('/downloads/')) {
    return { file: path.join(root, 'docs/public', decoded.slice(1)), fragment: '' }
  }
  if (decoded.startsWith('/zh/')) {
    const relative = decoded.replace(/^\/zh\//, '')
    return {
      file: path.join(root, 'docs/zh', relative.endsWith('.md') ? relative : `${relative}.md`),
      fragment: normalizedFragment
    }
  }
  const resolved = path.resolve(path.dirname(sourceFile), decoded)
  return {
    file: path.extname(resolved) ? resolved : `${resolved}.md`,
    fragment: normalizedFragment
  }
}

export async function validateMarkdownLinks(root) {
  const errors = []
  const docsRoot = path.join(root, 'docs/zh')
  for (const file of await walkMarkdown(docsRoot)) {
    const source = stripCodeFences(await readFile(file, 'utf8'))
    for (const match of source.matchAll(markdownLink)) {
      const target = linkToFile(root, file, match[1].trim())
      if (!target) continue
      if (!(await exists(target.file))) {
        errors.push(`${path.relative(root, file)} -> ${match[1].trim()}`)
        continue
      }
      if (target.fragment && target.file.endsWith('.md')) {
        const targetSource = await readFile(target.file, 'utf8')
        if (!collectAnchors(targetSource).has(target.fragment)) {
          errors.push(`${path.relative(root, file)} -> ${match[1].trim()}`)
        }
      }
    }
  }
  return errors
}

export async function validateLanguageDirs(root) {
  const docsRoot = path.join(root, 'docs')
  if (!(await exists(docsRoot))) return ['缺少 docs 目录']
  const entries = await readdir(docsRoot, { withFileTypes: true })
  return entries
    .filter(entry => entry.isDirectory() && !allowedDocsDirs.has(entry.name))
    .map(entry => `发现未批准的语言目录: docs/${entry.name}`)
}

async function validateRequiredPages(root) {
  const errors = []
  for (const { link } of allPublicPages) {
    const relative = link === '/zh/' ? 'index' : link.replace(/^\/zh\//, '')
    const file = path.join(root, 'docs/zh', `${relative}.md`)
    if (!(await exists(file))) errors.push(`导航目标不存在: ${link}`)
  }
  for (const required of [
    'docs/index.md',
    'docs/zh/about/companion-pdf.md',
    'docs/public/logo.svg',
    'docs/public/downloads/sop-to-agent-application.pdf'
  ]) {
    if (!(await exists(path.join(root, required)))) errors.push(`缺少站点资源: ${required}`)
  }
  return errors
}

async function validateNoRootCopies(root) {
  const entries = await readdir(root, { withFileTypes: true })
  return entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md')
    .map(entry => `根目录残留正文: ${entry.name}`)
}

export async function validateSite(root) {
  return [
    ...await validateRequiredPages(root),
    ...await validateLanguageDirs(root),
    ...await validateNoRootCopies(root),
    ...await validateMarkdownLinks(root)
  ]
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const errors = await validateSite(root)
  if (errors.length) {
    console.error(errors.map(error => `- ${error}`).join('\n'))
    process.exitCode = 1
  } else {
    console.log('site check passed')
  }
}
```

- [ ] **Step 4: 运行单元测试**

Run: `node --test tests/check-site.test.mjs`

Expected: 3 tests PASS。

- [ ] **Step 5: 运行真实仓库检查并记录预期缺口**

Run: `npm run site:check`

Expected: FAIL，只允许报告尚未在 Task 4 创建的 `docs/index.md`、`docs/zh/index.md` 和 `docs/public/logo.svg`；不得报告已经迁移页面的失效链接。

- [ ] **Step 6: 提交检查器**

```bash
git add scripts/check-site.mjs tests/check-site.test.mjs package.json
git commit -m "test: add VitePress site validation"
```

### Task 4: 创建 VitePress 配置、中文首页与原创主题

**Files:**
- Create: `docs/index.md`
- Create: `docs/zh/index.md`
- Create: `docs/.vitepress/config.mts`
- Create: `docs/.vitepress/theme/index.js`
- Create: `docs/.vitepress/theme/style.css`
- Create: `docs/public/logo.svg`
- Create: `package-lock.json`

**Interfaces:**
- Consumes: `topNav`, `sidebar` from `site-map.mjs` and all migrated Markdown。
- Produces: VitePress static output at `docs/.vitepress/dist`。

- [ ] **Step 1: 创建根路径中文跳转页**

```markdown
---
title: "AI Native Builder"
layout: false
head:
  - - meta
    - http-equiv: refresh
      content: "0; url=./zh/"
---

# AI Native Builder

[进入中文阅读站](./zh/)
```

- [ ] **Step 2: 创建独立中文首页**

```markdown
---
layout: home
title: "AI Native Builder：把 AI 变成组织能力"
description: "一本面向企业内部建设者的公开自学书。"
hero:
  name: "AI Native Builder"
  text: "把 AI 变成组织能力"
  tagline: "从真实业务问题出发，重构工作流，构建、评估和治理可运行的 AI 系统。"
  image:
    src: /logo.svg
    alt: "AI Native Builder"
  actions:
    - theme: brand
      text: "开始阅读"
      link: /zh/chapters/00-getting-started
    - theme: alt
      text: "查看练习册"
      link: /zh/practice/workbook
features:
  - title: "发现值得解决的问题"
    details: "从业务任务、样本和系统记录建立证据，而不是从工具愿望开始。"
  - title: "稳定 AI 的效果"
    details: "把上下文、工具、权限、状态、评估和人工责任连接成可验证系统。"
  - title: "走向真实采用"
    details: "用试点行为、人工负担、风险和长期维护责任决定继续、收缩或停止。"
---

## 当前版本与发布边界

<div class="release-strip">
  <span>v0.3.0-rc.1</span>
  <strong>公开评审稿（发布候选）</strong>
</div>

这是可以公开试读和反馈的发布候选版本，不代表已经完成独立试读、专业审读或正式版本发布。

## 四部分学习路径

1. **角色为什么出现**：理解企业 AI 建设中的责任断层，以及外部 FDE 与内部 AI Native Builder 的合作边界。
2. **完成一次端到端建设**：从可验证场景走到工作流、智能体约束、运行系统和评估治理。
3. **从试点走向组织能力**：判断真实采用、产品责任、资产复用和退役。
4. **用作品说明能力**：用主张、证据和限制完成毕业项目与同行复核。

## 配套材料

- [练习册与检查清单](./practice/workbook.md)
- [SOP 到智能体约束转化卡](./practice/sop-to-agent-card.md)
- [术语表](./reference/glossary.md)
- [参考资料](./reference/references.md)
- [配套 PDF 说明](./about/companion-pdf.md)
- [下载《从 SOP 到智能体应用》PDF](/downloads/sop-to-agent-application.pdf)

## 开放阅读与反馈

本书作者及原创内容权利人为 **kms9**。除另有说明外，原创内容采用 CC BY-SA 4.0。你可以通过 [GitHub Issues](https://github.com/kms9/ai-native-builder-cookbook/issues) 提交错别字、失效链接、事实疑点和自学障碍。
```

- [ ] **Step 3: 创建 VitePress 配置**

```ts
// docs/.vitepress/config.mts
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { sidebar, topNav } from './site-map.mjs'

export default withMermaid(defineConfig({
  base: '/ai-native-builder-cookbook/',
  lang: 'zh-CN',
  title: 'AI Native Builder',
  description: '把 AI 变成组织能力',
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: ['superpowers/**'],
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/ai-native-builder-cookbook/logo.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: topNav,
    sidebar: { '/zh/': sidebar },
    outline: { level: [2, 3], label: '本页内容' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '最后更新' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
              modal: {
                noResultsText: '没有找到相关内容',
                resetButtonTitle: '清除查询',
                footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
              }
            }
          }
        }
      }
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/kms9/ai-native-builder-cookbook' }
    ]
  },
  markdown: { lineNumbers: false }
}))
```

- [ ] **Step 4: 创建主题入口与原创 SVG**

```js
// docs/.vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import './style.css'

export default {
  extends: DefaultTheme
}
```

```svg
<!-- docs/public/logo.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <path d="M10 14h10M10 32h10M10 50h10M20 14l14 18M20 32h14M20 50l14-18M34 32h10M44 32l10-12M44 32l10 12" stroke="#D95C41" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="8" cy="14" r="5" fill="#D95C41"/>
  <circle cx="8" cy="32" r="5" fill="#D95C41"/>
  <circle cx="8" cy="50" r="5" fill="#D95C41"/>
  <circle cx="38" cy="32" r="7" fill="#FAF9F5" stroke="#D95C41" stroke-width="4"/>
  <circle cx="56" cy="18" r="5" fill="#D95C41"/>
  <circle cx="56" cy="46" r="5" fill="#D95C41"/>
</svg>
```

- [ ] **Step 5: 创建最小完整主题 CSS**

```css
/* docs/.vitepress/theme/style.css */
:root {
  --vp-c-bg: #faf9f5;
  --vp-c-bg-alt: #f4f3ee;
  --vp-c-bg-elv: #ffffff;
  --vp-c-bg-soft: #f4f3ee;
  --vp-c-text-1: #1a1a1a;
  --vp-c-text-2: #4a4a4a;
  --vp-c-text-3: #757575;
  --vp-c-brand-1: #d95c41;
  --vp-c-brand-2: #c14e36;
  --vp-c-brand-3: #a8412b;
  --vp-c-brand-soft: rgb(217 92 65 / 10%);
  --vp-sidebar-width: 296px;
  --vp-sidebar-bg-color: #f4f3ee;
  --vp-nav-bg-color: #faf9f5;
  --vp-layout-max-width: 1376px;
  --vp-font-family-base: Inter, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  --vp-font-family-mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
}

.dark {
  --vp-c-bg: #1a1a1a;
  --vp-c-bg-alt: #141414;
  --vp-c-bg-elv: #242424;
  --vp-c-bg-soft: #202020;
  --vp-c-text-1: #e5e5e5;
  --vp-c-text-2: #b3b3b3;
  --vp-c-text-3: #808080;
  --vp-c-brand-1: #e07a64;
  --vp-c-brand-2: #d95c41;
  --vp-c-brand-3: #c14e36;
  --vp-c-brand-soft: rgb(224 122 100 / 15%);
  --vp-sidebar-bg-color: #141414;
  --vp-nav-bg-color: #1a1a1a;
}

.vp-doc {
  font-size: 16px;
  line-height: 1.78;
}

.vp-doc h1,
.vp-doc h2,
.VPHomeHero .name,
.VPHomeHero .text {
  font-family: Newsreader, "Noto Serif SC", "Songti SC", STSong, serif;
  font-weight: 500;
}

.vp-doc h1 { font-size: clamp(2.25rem, 5vw, 3.5rem); line-height: 1.12; }
.vp-doc h2 { border-bottom: 1px solid var(--vp-c-divider); padding-bottom: .4rem; }
.VPNav { background: var(--vp-nav-bg-color); }
.VPSidebar { background: var(--vp-sidebar-bg-color); }
.VPHomeHero .tagline { max-width: 720px; line-height: 1.7; }
.VPFeature { border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-elv); }
.VPButton.brand { border-color: var(--vp-c-brand-1); background: var(--vp-c-brand-1); }
.release-strip {
  display: flex;
  gap: .75rem;
  align-items: center;
  margin: 1.5rem 0 2.5rem;
  padding: .8rem 1rem;
  border: 1px solid var(--vp-c-brand-soft);
  border-left: 4px solid var(--vp-c-brand-1);
  border-radius: 8px;
  background: var(--vp-c-brand-soft);
}
.release-strip span { font-family: var(--vp-font-family-mono); }

@media (max-width: 767px) {
  .vp-doc { font-size: 15px; }
  .release-strip { align-items: flex-start; flex-direction: column; }
}
```

- [ ] **Step 6: 生成锁文件并安装依赖**

Run: `npm install --package-lock-only && npm ci`

Expected: exit 0，生成 `package-lock.json`，安装的 VitePress 为 1.6.4。

- [ ] **Step 7: 运行全部测试、站点检查和生产构建**

Run:

```bash
npm test
npm run site:check
npm run docs:build
```

Expected: 所有测试 PASS；输出 `site check passed`；VitePress build exit 0，产物位于 `docs/.vitepress/dist`。

- [ ] **Step 8: 提交站点与主题**

```bash
git add package-lock.json docs/index.md docs/zh/index.md docs/.vitepress docs/public/logo.svg
git commit -m "feat: add Chinese VitePress reading site"
```

### Task 5: 更新仓库入口与 GitHub Pages 工作流

**Files:**
- Modify: `README.md`
- Create: `.github/workflows/deploy-pages.yml`

**Interfaces:**
- Consumes: `npm run site:check`, `npm run docs:build`, output `docs/.vitepress/dist`。
- Produces: repository landing page and GitHub Pages deployment pipeline。

- [ ] **Step 1: 写工作流静态失败检查**

Run:

```bash
test -f .github/workflows/deploy-pages.yml
```

Expected: FAIL，退出码 1。

- [ ] **Step 2: 把 README 收敛为仓库入口**

README 必须保留原有 YAML 中 `author`、`license`、`version`、`updated`、`status`，正文采用以下结构：

```markdown
# AI Native Builder：把 AI 变成组织能力

一本面向企业内部建设者的公开自学书，讲清哪些业务问题值得用 AI、怎样稳定 AI 效果，以及怎样把 AI 应用推进生产环境。

- [在线阅读](https://kms9.github.io/ai-native-builder-cookbook/zh/)
- [从第 0 章开始](https://kms9.github.io/ai-native-builder-cookbook/zh/chapters/00-getting-started)
- [查看练习册](https://kms9.github.io/ai-native-builder-cookbook/zh/practice/workbook)
- [下载《从 SOP 到智能体应用》](https://kms9.github.io/ai-native-builder-cookbook/downloads/sop-to-agent-application.pdf)

当前版本：`v0.3.0-rc.1`；状态：公开评审稿（发布候选）。

## 内容结构

- 第 0—4 章：角色为什么出现
- 第 5—8 章：完成一次端到端建设
- 第 9—10 章：从试点走向组织能力
- 第 11 章：用作品说明能力
- 配套练习册、案例、术语表和参考资料

## 许可与反馈

作者及原创内容权利人为 **kms9**。除另有说明外，原创内容采用 [CC BY-SA 4.0](LICENSE)。欢迎通过 [GitHub Issues](https://github.com/kms9/ai-native-builder-cookbook/issues) 提交反馈；贡献要求见[内容贡献说明](docs/zh/about/contributing.md)。
```

- [ ] **Step 3: 创建 Pages 工作流**

```yaml
name: Deploy docs to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: npm
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Install dependencies
        run: npm ci
      - name: Check site
        run: npm run site:check
      - name: Build with VitePress
        run: npm run docs:build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: docs/.vitepress/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: 运行仓库入口与工作流检查**

Run:

```bash
rg -q 'v0\.3\.0-rc\.1' README.md
rg -q 'kms9\.github\.io/ai-native-builder-cookbook/zh/' README.md
rg -q 'npm run site:check' .github/workflows/deploy-pages.yml
rg -q 'docs/\.vitepress/dist' .github/workflows/deploy-pages.yml
git diff --check
```

Expected: 全部 exit 0。

- [ ] **Step 5: 提交仓库与部署入口**

```bash
git add README.md .github/workflows/deploy-pages.yml
git commit -m "ci: deploy reading site to GitHub Pages"
```

### Task 6: 完成本地端到端与视觉验收

**Files:**
- Modify: only files proven broken by the checks below

**Interfaces:**
- Consumes: complete site source and npm scripts。
- Produces: locally verified release candidate for Pages deployment。

- [ ] **Step 1: 从锁文件进行干净安装**

Run: `npm ci`

Expected: exit 0；不修改 `package-lock.json`。

- [ ] **Step 2: 运行完整自动检查**

Run:

```bash
npm test
npm run site:check
npm run docs:build
git diff --check
```

Expected: all PASS；VitePress 不报告 dead link；`git diff --check` 无输出。

- [ ] **Step 3: 启动 production preview**

Run: `npm run docs:preview -- --host 127.0.0.1`

Expected: preview server 提供包含 base path 的本地 URL；只记录实际输出端口，不假定固定端口。

- [ ] **Step 4: 使用浏览器检查桌面页面**

检查 `/ai-native-builder-cookbook/zh/`、第 0 章、第 6A 章、第 11 章、练习册、术语表和参考资料。每页确认：标题、左侧目录、右侧页内目录、上下篇、代码块、表格、链接和状态信息正常。

Expected: 7 个目标页面均能打开；正文没有被 frontmatter 或原始 Markdown 语法污染。

- [ ] **Step 5: 检查交互与移动端**

在浏览器中依次验证本地搜索、明暗主题、移动端目录、首页两个 CTA 和 PDF 下载。

Expected: 搜索至少能找到“评估治理”和“智能体约束”；主题切换生效；移动端无横向溢出；下载文件为 PDF。

- [ ] **Step 6: 修复真实发现并重跑完整检查**

只修复上述步骤实际暴露的问题。每次修改后重新运行：

```bash
npm test && npm run site:check && npm run docs:build && git diff --check
```

Expected: all PASS。

- [ ] **Step 7: 提交验收修复（如果存在）**

```bash
git add docs scripts tests README.md package.json package-lock.json .github .gitignore
git commit -m "fix: close VitePress site QA gaps"
```

如果 Step 6 没有产生修改，不创建空提交。

### Task 7: 推送、启用 Pages 并验证公网

**Files:**
- No local file changes expected

**Interfaces:**
- Consumes: clean local `main`, complete Git history, GitHub Pages workflow。
- Produces: public site and remote evidence。

- [ ] **Step 1: 刷新远端并确认可快进**

Run:

```bash
GIT_SSH_COMMAND='ssh -o HostName=ssh.github.com -p 443 -o BatchMode=yes' git fetch origin main
git merge-base --is-ancestor origin/main main
git status --short --branch
```

Expected: ancestor check exit 0；worktree clean；local `main` ahead of or equal to `origin/main`。

- [ ] **Step 2: 推送 main**

Run:

```bash
GIT_SSH_COMMAND='ssh -o HostName=ssh.github.com -p 443 -o BatchMode=yes' git push origin main
```

Expected: remote `main` 更新到本地 HEAD。

- [ ] **Step 3: 检查 Pages source**

打开仓库 Settings → Pages。若 Build and deployment source 已是 GitHub Actions，不修改设置；否则在最终保存前向用户确认，然后切换为 GitHub Actions。

Expected: Pages source 为 GitHub Actions。

- [ ] **Step 4: 等待 workflow 真实完成**

检查 `Deploy docs to GitHub Pages` 的 build 与 deploy job。不得把 workflow 开始、排队或 build 完成当作 deploy 完成。

Expected: build 和 deploy 均为 success，environment 返回 page URL。

- [ ] **Step 5: 验证公网关键路径**

Run:

```bash
curl -fsSLI https://kms9.github.io/ai-native-builder-cookbook/
curl -fsSLI https://kms9.github.io/ai-native-builder-cookbook/zh/
curl -fsSLI https://kms9.github.io/ai-native-builder-cookbook/zh/chapters/00-getting-started
curl -fsSLI https://kms9.github.io/ai-native-builder-cookbook/zh/chapters/06a-sop-to-agent-constraints
curl -fsSLI https://kms9.github.io/ai-native-builder-cookbook/zh/chapters/11-capstone-and-review
curl -fsSLI https://kms9.github.io/ai-native-builder-cookbook/downloads/sop-to-agent-application.pdf
```

Expected: 所有最终响应为 200；根页面内容包含进入 `/zh/` 的跳转。

- [ ] **Step 6: 浏览器检查公网内容与交互**

检查公网首页版本、作者、许可证、三项核心问题、章节导航、搜索、主题切换、随机内部链接和 PDF 下载。

Expected: 页面内容与本地构建一致；没有其他语言菜单；浏览器控制台没有阻断使用的错误。

- [ ] **Step 7: 最终远端一致性检查**

Run:

```bash
local_head=$(git rev-parse HEAD)
origin_head=$(git rev-parse origin/main)
test "$local_head" = "$origin_head"
test -z "$(git status --porcelain)"
```

Expected: exit 0；本地和 `origin/main` 相同；worktree clean。
