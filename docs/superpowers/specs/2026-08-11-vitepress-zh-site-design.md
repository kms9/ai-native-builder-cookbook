---
title: "AI Native Builder 中文阅读站设计"
desc: "定义 AI Native Builder 自学书迁移到 VitePress 与 GitHub Pages 的中文单语站点架构、内容路径、视觉系统、部署流程和验收标准。"
aliases:
  - "VitePress 中文站设计"
  - "AI Native Builder GitHub Pages"
tags:
  - "技术/文档工程"
  - "写作/发布"
  - "产品/企业AI"
status: "已获用户确认，等待书面审阅"
updated: 2026-08-11
---

# AI Native Builder 中文阅读站设计

## 目标

为《AI Native Builder：把 AI 变成组织能力》建立一个公开中文阅读站。站点复用 Learn Harness Engineering 的技术路线和主要阅读体验：VitePress、GitHub Pages、GitHub Actions、本地搜索、米白与橙红视觉系统、左侧章节导航、右侧页内目录和响应式阅读布局。

站点只使用本书内容和自己的品牌标识，不复制参考站点的文字、图标、品牌名称或专有素材。

首版成功标准：

- 公网地址 `https://kms9.github.io/ai-native-builder-cookbook/` 可以访问，并自动进入 `/zh/`；
- 第 0—11 章、实践材料、术语表和参考资料均可连续阅读；
- 搜索、明暗主题、上一篇／下一篇、移动端目录和 PDF 下载可用；
- GitHub 仓库中的书稿与站点内容只有一份事实源；
- `main` 分支更新后可以通过 GitHub Actions 自动构建和部署；
- 本地生产构建、链接检查和公网抽查均通过后，才宣布站点发布成功。

## 暂不包含

- 英文、繁体中文或其他语言；
- GitBook、CMS、数据库、用户登录、评论系统或阅读进度同步；
- 自定义域名；
- Algolia 或其他外部搜索服务；
- 在线编辑练习册或提交作业；
- 对书稿正文进行新一轮内容重写；
- 把当前发布候选状态改成正式版本。

## 已确认的设计决定

1. 使用 VitePress 1.6.4、Vue 3、Vite 和 GitHub Pages。
2. 采用标准 `docs/` 内容目录，不从仓库根目录直接构建站点。
3. 中文内容放在 `/zh/`，首版不配置其他语言和语言切换菜单。
4. 设计独立阅读首页；根目录 README 继续服务 GitHub 仓库访问者。
5. 主阅读导航只突出正文、实践材料和查阅资料；项目说明放入次级入口。
6. 页面使用稳定的英文或数字短链接，不把中文标题直接放入 URL。
7. 书稿迁移后不在根目录保留第二份正文。

## 仓库结构

```text
ai-native-builder-cookbook/
├── README.md
├── LICENSE
├── package.json
├── package-lock.json
├── scripts/
│   └── check-site.mjs
├── .github/workflows/
│   └── deploy-pages.yml
└── docs/
    ├── index.md
    ├── .vitepress/
    │   ├── config.mts
    │   └── theme/
    │       ├── index.js
    │       └── style.css
    ├── public/
    │   ├── logo.svg
    │   └── downloads/
    │       └── sop-to-agent-application.pdf
    ├── zh/
    │   ├── index.md
    │   ├── chapters/
    │   ├── practice/
    │   ├── reference/
    │   └── about/
    └── superpowers/specs/
        └── 2026-08-11-vitepress-zh-site-design.md
```

VitePress 通过 `srcExclude` 排除 `superpowers/**`，设计规范不会进入公开站点，也不会出现在本地搜索中。

## 内容迁移与网址

正文迁移到 `docs/zh/chapters/`，采用以下稳定路径：

| 原文件 | 新文件 | 公开路径 |
| --- | --- | --- |
| `00-如何使用这本书.md` | `chapters/00-getting-started.md` | `/zh/chapters/00-getting-started` |
| `01-为什么企业AI需要新的建设角色.md` | `chapters/01-why-new-role.md` | `/zh/chapters/01-why-new-role` |
| `02-FDE是什么.md` | `chapters/02-what-is-fde.md` | `/zh/chapters/02-what-is-fde` |
| `03-外部FDE与内部AI-Native-Builder.md` | `chapters/03-fde-and-ai-native-builder.md` | `/zh/chapters/03-fde-and-ai-native-builder` |
| `04-为什么智能体时代更需要AI-Native-Builder.md` | `chapters/04-agent-era-builder.md` | `/zh/chapters/04-agent-era-builder` |
| `05-从工具愿望到可验证场景.md` | `chapters/05-verifiable-scenario.md` | `/zh/chapters/05-verifiable-scenario` |
| `06-重构人AI系统工作流.md` | `chapters/06-workflow-redesign.md` | `/zh/chapters/06-workflow-redesign` |
| `06A-从SOP到智能体约束.md` | `chapters/06a-sop-to-agent-constraints.md` | `/zh/chapters/06a-sop-to-agent-constraints` |
| `07-把业务变成可运行系统.md` | `chapters/07-runnable-system.md` | `/zh/chapters/07-runnable-system` |
| `08-用评估与治理证明系统可控.md` | `chapters/08-evaluation-and-governance.md` | `/zh/chapters/08-evaluation-and-governance` |
| `09-从试点到真实采用.md` | `chapters/09-pilot-to-adoption.md` | `/zh/chapters/09-pilot-to-adoption` |
| `10-把一次项目变成组织能力.md` | `chapters/10-organizational-capability.md` | `/zh/chapters/10-organizational-capability` |
| `11-毕业项目与自我认证.md` | `chapters/11-capstone-and-review.md` | `/zh/chapters/11-capstone-and-review` |

配套内容迁移规则：

- `练习册与检查清单.md` → `practice/workbook.md`
- `模板-SOP到智能体约束转化卡.md` → `practice/sop-to-agent-card.md`
- `配套案例与练习扩展.md` → `practice/extensions.md`
- `案例A-从多维表需求到MR与上线.md` → `practice/case-a-delivery.md`
- `实践旁注-内部Skill仓库交付闭环.md` → `practice/delivery-notes.md`
- `练习册扩展-需求分流与自动交付.md` → `practice/delivery-workbook.md`
- `术语表.md` → `reference/glossary.md`
- `参考资料.md` → `reference/references.md`
- `开源项目说明.md` → `about/project.md`
- `CHANGELOG.md` → `about/changelog.md`
- `CONTRIBUTING.md` → `about/contributing.md`

`LICENSE` 保留在仓库根目录，站点“关于”菜单直接链接 GitHub 上的许可证文件。根目录 README 改成简洁仓库入口，不重复维护整本书的阅读首页。

原有相对链接和锚点随迁移统一重写。VitePress 使用 `cleanUrls: true`，公开链接不带 `.html` 或 `.md`。

## 首页

`docs/zh/index.md` 是独立阅读首页，使用 VitePress home layout 和本书自己的内容结构。

首页从上到下包括：

1. 书名、副标题与一句话价值说明；
2. “开始阅读”和“查看练习册”两个主要按钮；
3. `v0.3.0-rc.1` 与“公开评审稿（发布候选）”状态；
4. 本书回答的三个核心问题；
5. 四部分学习路径及各自入口；
6. 配套案例、练习册、术语表和原创 PDF；
7. 作者、CC BY-SA 4.0、GitHub Issues 和仓库入口。

`docs/index.md` 只负责从站点根路径进入 `/zh/`。它通过静态 meta refresh 和普通链接同时实现跳转：支持 JavaScript 的浏览器可以立即进入中文首页，禁用 JavaScript 时仍可手动进入。

## 导航信息架构

顶部导航：

- 首页
- 正文
- 实践材料
- 查阅资料
- GitHub

左侧主导航：

- 第一部分：角色为什么出现，第 0—4 章；
- 第二部分：完成一次端到端建设，第 5—8 章；
- 第三部分：从试点走向组织能力，第 9—10 章；
- 第四部分：用作品说明能力，第 11 章；
- 实践材料：练习册、转化卡、案例和练习扩展；
- 查阅资料：术语表与参考资料。

CHANGELOG、贡献说明、项目说明和 LICENSE 不占用主阅读目录，放入顶部“关于”下拉入口或页面底部。

右侧目录显示当前页面的二级和三级标题。每篇正文由 VitePress 自动生成上一篇和下一篇；跨分组时按照全书学习顺序继续。

## 视觉系统

视觉氛围参考 Learn Harness Engineering，但重新实现为本书主题：

- 浅色背景为米白色，侧栏为浅灰米色；
- 品牌色为橙红色，用于链接、按钮、当前章节和提示边框；
- 深色模式使用炭黑背景和较浅的橙红强调色；
- 左侧导航宽度约 296px，正文保持适合长文阅读的行宽；
- 标题使用 `Newsreader` 与中文衬线字体回退；
- 正文使用 `Inter` 与系统中文无衬线字体回退；
- 代码使用 `JetBrains Mono` 与系统等宽字体回退；
- 字体不可用时仍保持可读，不把字体加载作为页面显示条件。

`Newsreader`、`Inter` 和 `JetBrains Mono` 通过 Google Fonts 加载；CSS 同时声明完整的中文和系统字体回退。站点不等待外部字体请求完成才显示正文。

本书品牌图标使用原创 SVG：三个输入节点汇聚到一个系统节点，再连接到组织能力节点，表达“业务问题 → AI 系统 → 组织能力”。不复用参考站点图标。

主题扩展 VitePress DefaultTheme，仅增加自定义 CSS、品牌图标和必要的首页样式。首版不加入复杂动画，不复制参考站点的 Mermaid 全屏查看器；书稿出现 Mermaid 后再单独评估。

## 技术配置

依赖锁定在 `package-lock.json`：

- `vitepress` 1.6.4；
- `vitepress-plugin-mermaid` 2.0.17；
- `mermaid` 11.14.x；
- 构建和检查脚本使用 Node.js 标准库，不增加应用服务端依赖。

VitePress 核心设置：

- `base: "/ai-native-builder-cookbook/"`；
- `lang: "zh-CN"`；
- `cleanUrls: true`；
- 本地搜索 `provider: "local"`；
- `outline.level: [2, 3]`；
- `lastUpdated: true`；
- `srcExclude: ["superpowers/**"]`；
- 不配置其他 locale，不渲染语言选择器。

PDF 从 `docs/public/downloads/sop-to-agent-application.pdf` 发布，公开地址为 `/ai-native-builder-cookbook/downloads/sop-to-agent-application.pdf`。站点显示中文资料名，下载文件使用稳定英文名。

## 构建与部署

本地命令：

```bash
npm ci
npm run site:check
npm run docs:build
npm run docs:dev
npm run docs:preview
```

GitHub Actions 在 `main` 推送和手动触发时运行：

1. 检出完整仓库；
2. 安装 Node.js 24；
3. 执行 `npm ci`；
4. 执行 `npm run site:check`；
5. 执行 `npm run docs:build`；
6. 上传 `docs/.vitepress/dist`；
7. 通过 `actions/deploy-pages` 发布到 GitHub Pages。

工作流只获得 `contents: read`、`pages: write` 和 `id-token: write`。使用 GitHub Pages environment 避免并发部署互相覆盖。

## 检查脚本

新增 `scripts/check-site.mjs`，仅使用 Node.js 标准库，职责限定为站点结构检查：

- 配置中的导航目标都存在；
- Markdown 内部链接和锚点可解析；
- PDF 和品牌图标存在；
- `docs/zh/index.md`、第 0 章和第 11 章存在；
- 站点没有生成或配置其他语言目录；
- 迁移后的正文不再残留在仓库根目录；
- `docs/superpowers/**` 不属于公开导航。

脚本返回非零退出码阻止构建。它不检查第三方网页的内容正确性，也不把 HTTP 可达等同于来源仍然适合引用。

## 验收

本地验收：

- `npm ci` 成功；
- `npm run site:check` 成功；
- `npm run docs:build` 成功且没有失效内部链接；
- 构建产物只包含中文站点和共享静态资源；
- 桌面端首页、随机三章、练习册、术语表和参考资料显示正常；
- 移动端导航、搜索、明暗主题、上一篇／下一篇正常；
- PDF 下载返回完整文件；
- `git diff --check` 成功，工作区变更范围符合设计。

发布验收：

- GitHub Actions build 与 deploy 两个 job 成功；
- 根地址进入 `/zh/`；
- `/zh/`、第 0 章、第 6A 章、第 11 章和 PDF 地址返回成功；
- 公网页面的版本、作者、许可证和发布候选状态与仓库一致；
- 随机内部链接和搜索结果能够到达正确页面。

只有本地构建不能证明 GitHub Pages 已公开，只有 Actions 绿色也不能证明目标页面内容正确。发布结论必须同时包含远端工作流结果和公网页面检查。

## 风险与处理

### 文件迁移造成链接失效

所有书稿文件在一次提交中迁移并重写链接；站点检查、VitePress 构建和锚点检查共同阻止失效链接进入 `main`。

### 中文内容与英文短链接对应错误

公开路径在本设计中固定，导航配置显式引用这些路径。后续修改中文标题不改变 URL。

### Google Fonts 不可用

CSS 为每类字体提供系统回退。字体请求失败只影响字形风格，不影响页面结构和内容显示。

### GitHub Pages 尚未启用

代码推送和站点发布分别验收。如果仓库 Pages source 尚未设置为 GitHub Actions，使用仓库设置页面启用后再重新运行部署；没有公网证据时不宣布完成。

### 参考站点变化或许可边界

只复用公开技术路线和通用视觉原则，站点代码由本项目重新实现。参考站点后续变化不自动同步到本书。

## 实施边界

实施提交应聚焦站点迁移、构建、主题和发布，不顺带改写正文论点。为了迁移而修改的内容限于相对链接、下载地址、导航入口和仓库说明。发现原文问题时另行记录，不在站点迁移中扩大内容编辑范围。
