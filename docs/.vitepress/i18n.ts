import type { DefaultTheme } from 'vitepress'

export type LocaleKey = 'root' | 'en'

type SearchTranslations = NonNullable<DefaultTheme.LocalSearchOptions['translations']>

/**
 * All user-facing interface strings for one language.
 *
 * This is the single place to edit wording or add a language. `config.mts`
 * derives navigation, sidebar, theme labels and head metadata from these
 * entries, so a new locale needs one object here plus one entry in the
 * `locales` map of `defineConfig`.
 */
export interface LocaleUI {
  /** Name shown in the language menu. */
  label: string
  /** BCP 47 tag written to `<html lang>`. */
  lang: string
  /** Root URL of the locale. Also the base for every generated link. */
  link: string
  /** Value used in `<link rel="alternate" hreflang>`. */
  hreflang: string
  /** Value used in `og:locale`. */
  ogLocale: string
  title: string
  description: string
  logoAlt: string

  nav: {
    home: string
    docs: string
    downloads: string
    repository: string
    issues: string
  }
  sidebarTitle: string
  sidebar: {
    overview: string
    gettingStarted: string
    configuration: string
    faq: string
  }

  outlineLabel: string
  docFooter: { prev: string; next: string }
  lastUpdatedText: string
  returnToTopLabel: string
  sidebarMenuLabel: string
  darkModeSwitchLabel: string
  lightModeSwitchTitle: string
  darkModeSwitchTitle: string
  langMenuLabel: string
  skipToContentLabel: string
  notFound: DefaultTheme.NotFoundOptions
  footerMessage: string
  search: SearchTranslations
}

const zh: LocaleUI = {
  label: '简体中文',
  lang: 'zh-CN',
  link: '/',
  hreflang: 'zh-Hans',
  ogLocale: 'zh_CN',
  title: 'PredatorLite',
  description: 'PredatorLite 项目介绍与使用文档',
  logoAlt: 'PredatorLite 标志',

  nav: {
    home: '首页',
    docs: '文档',
    downloads: '下载',
    repository: 'GitHub',
    issues: '问题反馈',
  },
  sidebarTitle: '项目文档',
  sidebar: {
    overview: '文档首页',
    gettingStarted: '快速开始',
    configuration: '配置说明',
    faq: '常见问题',
  },

  outlineLabel: '本页内容',
  docFooter: { prev: '上一页', next: '下一页' },
  lastUpdatedText: '最后更新于',
  returnToTopLabel: '返回顶部',
  sidebarMenuLabel: '菜单',
  darkModeSwitchLabel: '外观',
  lightModeSwitchTitle: '切换到浅色模式',
  darkModeSwitchTitle: '切换到深色模式',
  langMenuLabel: '切换语言',
  skipToContentLabel: '跳到主要内容',
  notFound: {
    code: '404',
    title: '页面不存在',
    quote: '该地址可能已经变更或被删除。可以返回首页重新开始，或用搜索查找需要的内容。',
    linkLabel: '返回首页',
    linkText: '返回首页',
  },
  footerMessage: 'PredatorLite 项目网站',
  search: {
    button: { buttonText: '搜索', buttonAriaLabel: '搜索文档' },
    modal: {
      displayDetails: '显示详细内容',
      resetButtonTitle: '清除搜索条件',
      backButtonTitle: '关闭搜索',
      noResultsText: '没有找到相关结果',
      footer: {
        selectText: '选择',
        selectKeyAriaLabel: '回车键',
        navigateText: '切换',
        navigateUpKeyAriaLabel: '上方向键',
        navigateDownKeyAriaLabel: '下方向键',
        closeText: '关闭',
        closeKeyAriaLabel: 'esc 键',
      },
    },
  },
}

const en: LocaleUI = {
  label: 'English',
  lang: 'en-US',
  link: '/en/',
  hreflang: 'en',
  ogLocale: 'en_US',
  title: 'PredatorLite',
  description: 'PredatorLite project overview and documentation',
  logoAlt: 'PredatorLite logo',

  nav: {
    home: 'Home',
    docs: 'Docs',
    downloads: 'Download',
    repository: 'GitHub',
    issues: 'Issues',
  },
  sidebarTitle: 'Project documentation',
  sidebar: {
    overview: 'Overview',
    gettingStarted: 'Getting started',
    configuration: 'Configuration',
    faq: 'FAQ',
  },

  outlineLabel: 'On this page',
  docFooter: { prev: 'Previous', next: 'Next' },
  lastUpdatedText: 'Last updated',
  returnToTopLabel: 'Back to top',
  sidebarMenuLabel: 'Menu',
  darkModeSwitchLabel: 'Appearance',
  lightModeSwitchTitle: 'Switch to light theme',
  darkModeSwitchTitle: 'Switch to dark theme',
  langMenuLabel: 'Change language',
  skipToContentLabel: 'Skip to content',
  notFound: {
    code: '404',
    title: 'Page not found',
    quote: 'This address may have changed or been removed. Return to the home page or use search to find what you need.',
    linkLabel: 'Go to home page',
    linkText: 'Back to home',
  },
  footerMessage: 'PredatorLite project website',
  search: {
    button: { buttonText: 'Search', buttonAriaLabel: 'Search documentation' },
    modal: {
      displayDetails: 'Display detailed list',
      resetButtonTitle: 'Reset search',
      backButtonTitle: 'Close search',
      noResultsText: 'No results for',
      footer: {
        selectText: 'to select',
        selectKeyAriaLabel: 'enter',
        navigateText: 'to navigate',
        navigateUpKeyAriaLabel: 'arrow up',
        navigateDownKeyAriaLabel: 'arrow down',
        closeText: 'to close',
        closeKeyAriaLabel: 'escape',
      },
    },
  },
}

export const localeUI: Record<LocaleKey, LocaleUI> = { root: zh, en }

/**
 * Path prefix for a locale, without a trailing slash.
 * `root` resolves to an empty string, `en` to `/en`.
 */
export function pathPrefix(key: LocaleKey): string {
  const link = localeUI[key].link
  return link === '/' ? '' : link.replace(/\/$/, '')
}
