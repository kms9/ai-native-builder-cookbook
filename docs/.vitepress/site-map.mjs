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
