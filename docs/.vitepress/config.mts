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
