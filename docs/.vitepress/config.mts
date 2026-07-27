import { defineConfig, type DefaultTheme, type HeadConfig } from 'vitepress'
import { localeUI, pathPrefix, type LocaleKey } from './i18n'
import { ogImage, projectLinks, siteUrl } from './site'

const LOGO = '/img/logo.png'

/**
 * Runs synchronously in `<head>`, before the body paints.
 *
 * Marks the document as animating, but only when scripting is available *and*
 * the visitor has not asked for reduced motion — the two conditions under which
 * an animation will actually run. `styles/motion.css` hides reveal targets under
 * that class only, so with scripting off or reduced motion on, the page renders
 * fully visible and there is nothing to undo.
 *
 * Hiding before the first paint is what keeps the hero from painting and then
 * snapping back to hidden once GSAP arrives, which reads as a glitch rather than
 * as loading.
 *
 * The timer fails open. If the GSAP chunk never arrives the handoff in
 * `usePageMotion` never happens, and without this the content would stay hidden
 * for good — unacceptable on a documentation site. That controller clears the
 * timer when it takes over, and stands down if the timer won the race.
 */
const PRE_PAINT_SCRIPT = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){\
var h=document.documentElement;h.classList.add('anim');\
window.__moFailsafe=setTimeout(function(){h.classList.remove('anim')},700)}}catch(e){}`

/**
 * Splits text into search tokens, adding word segmentation for CJK scripts.
 *
 * MiniSearch only splits on whitespace and punctuation, which turns a whole
 * Chinese sentence into a single token and makes the Chinese side of the site
 * effectively unsearchable.
 *
 * This function is serialized with `Function.prototype.toString()` and revived
 * in the browser with `new Function()`, because VitePress applies the same
 * MiniSearch options when building the index at build time and when loading it
 * on the client. It must therefore stay entirely self-contained: no imports, no
 * module-scope references. The `Intl.Segmenter` instance is cached on
 * `globalThis` for the same reason — a closure variable would not survive
 * serialization.
 */
const tokenize = (text: string): string[] => {
  // Same split as the MiniSearch default, so non-CJK behavior is unchanged.
  const parts = text.split(/[\n\r\p{Z}\p{P}]+/u).filter(Boolean)

  const scope = globalThis as Record<string, any>
  if (scope.__vpSegmenter === undefined) {
    const intl = Intl as any
    scope.__vpSegmenter =
      typeof intl?.Segmenter === 'function'
        ? new intl.Segmenter('zh-Hans', { granularity: 'word' })
        : null
  }

  const segmenter = scope.__vpSegmenter
  // No Intl.Segmenter (e.g. Firefox < 125): degrade to the default behavior.
  if (!segmenter) return parts

  // Kana, CJK ideographs, Hangul syllables, CJK compatibility ideographs.
  const cjk = /[぀-ヿ㐀-鿿가-힯豈-﫿]/
  const tokens: string[] = []
  for (const part of parts) {
    if (!cjk.test(part)) {
      tokens.push(part)
      continue
    }
    // Mixed runs such as "PredatorLite设备" split into their Latin and CJK words.
    for (const piece of segmenter.segment(part)) {
      if (piece.isWordLike) tokens.push(piece.segment)
    }
  }
  return tokens
}

/**
 * Shared by both locales. The build-time index is created from the root
 * `themeConfig.search.options`, so `miniSearch` has to live on the object the
 * root locale uses; sharing one object keeps that true by construction.
 *
 * At runtime VitePress resolves labels as
 * `locales[localeIndex].translations` -> `translations` -> built-in English,
 * so the root (Chinese) strings go in `translations` and English overrides
 * `locales.en`.
 */
const searchOptions: DefaultTheme.LocalSearchOptions = {
  translations: localeUI.root.search,
  locales: { en: { translations: localeUI.en.search } },
  miniSearch: { options: { tokenize } },
}

function externalNav(key: LocaleKey): DefaultTheme.NavItem[] {
  const { nav } = localeUI[key]
  const links: [string, string][] = [
    [nav.downloads, projectLinks.downloads],
    [nav.repository, projectLinks.repository],
    [nav.issues, projectLinks.issues],
  ]
  return links
    .filter(([, link]) => link !== '')
    .map(([text, link]) => ({ text, link }))
}

function socialLinks(): DefaultTheme.SocialLink[] {
  return projectLinks.repository
    ? [{ icon: 'github', link: projectLinks.repository }]
    : []
}

function buildThemeConfig(key: LocaleKey): DefaultTheme.Config {
  const ui = localeUI[key]
  const guideBase = `${pathPrefix(key)}/guide/`

  return {
    logo: { src: LOGO, alt: ui.logoAlt },
    siteTitle: ui.title,
    nav: [
      { text: ui.nav.home, link: `${pathPrefix(key)}/` },
      { text: ui.nav.docs, link: guideBase },
      ...externalNav(key),
    ],
    sidebar: {
      [guideBase]: [
        {
          text: ui.sidebarTitle,
          items: [
            { text: ui.sidebar.overview, link: guideBase },
            { text: ui.sidebar.gettingStarted, link: `${guideBase}getting-started` },
            { text: ui.sidebar.configuration, link: `${guideBase}configuration` },
            { text: ui.sidebar.faq, link: `${guideBase}faq` },
          ],
        },
      ],
    },
    outline: { level: [2, 3], label: ui.outlineLabel },
    docFooter: ui.docFooter,
    lastUpdated: { text: ui.lastUpdatedText },
    returnToTopLabel: ui.returnToTopLabel,
    sidebarMenuLabel: ui.sidebarMenuLabel,
    darkModeSwitchLabel: ui.darkModeSwitchLabel,
    lightModeSwitchTitle: ui.lightModeSwitchTitle,
    darkModeSwitchTitle: ui.darkModeSwitchTitle,
    langMenuLabel: ui.langMenuLabel,
    skipToContentLabel: ui.skipToContentLabel,
    notFound: ui.notFound,
    search: { provider: 'local', options: searchOptions },
    socialLinks: socialLinks(),
    footer: { message: ui.footerMessage },
  }
}

/** Source path to site path, matching `cleanUrls: true`. */
function toPath(relativePath: string): string {
  const withoutExt = relativePath.replace(/\.md$/, '')
  if (withoutExt === 'index') return '/'
  if (withoutExt.endsWith('/index')) return `/${withoutExt.slice(0, -'index'.length)}`
  return `/${withoutExt}`
}

/** The Chinese and English addresses of the same page. */
function localePaths(path: string): { zh: string; en: string } {
  const isEn = path.startsWith('/en/')
  return {
    zh: isEn ? path.slice(3) : path,
    en: isEn ? path : path === '/' ? '/en/' : `/en${path}`,
  }
}

export default defineConfig({
  title: localeUI.root.title,
  description: localeUI.root.description,
  lang: localeUI.root.lang,
  cleanUrls: true,
  lastUpdated: true,
  // Dark is the flagship theme; the light variant stays fully designed.
  appearance: 'dark',
  sitemap: { hostname: siteUrl },
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: LOGO }],
    ['meta', { name: 'theme-color', content: '#0b0e11' }],
    ['script', {}, PRE_PAINT_SCRIPT],
  ],
  markdown: {
    lineNumbers: true,
  },
  vite: {
    ssr: { noExternal: ['gsap'] },
  },
  locales: {
    root: {
      label: localeUI.root.label,
      lang: localeUI.root.lang,
      title: localeUI.root.title,
      description: localeUI.root.description,
    },
    en: {
      label: localeUI.en.label,
      lang: localeUI.en.lang,
      link: localeUI.en.link,
      title: localeUI.en.title,
      description: localeUI.en.description,
      themeConfig: buildThemeConfig('en'),
    },
  },
  themeConfig: buildThemeConfig('root'),

  // Only runs during `vitepress build` — these tags are absent in dev.
  transformHead({ pageData, title, description }): HeadConfig[] {
    const path = toPath(pageData.relativePath)
    const { zh, en } = localePaths(path)
    const isEn = path.startsWith('/en/')
    const current = localeUI[isEn ? 'en' : 'root']
    const alternate = localeUI[isEn ? 'root' : 'en']
    const url = `${siteUrl}${path}`

    const head: HeadConfig[] = [
      ['link', { rel: 'canonical', href: url }],
      ['link', { rel: 'alternate', hreflang: localeUI.root.hreflang, href: `${siteUrl}${zh}` }],
      ['link', { rel: 'alternate', hreflang: localeUI.en.hreflang, href: `${siteUrl}${en}` }],
      ['link', { rel: 'alternate', hreflang: 'x-default', href: `${siteUrl}${zh}` }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: current.title }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:locale', content: current.ogLocale }],
      ['meta', { property: 'og:locale:alternate', content: alternate.ogLocale }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
    ]

    if (ogImage) {
      head.push(
        ['meta', { property: 'og:image', content: `${siteUrl}${ogImage}` }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      )
    } else {
      head.push(['meta', { name: 'twitter:card', content: 'summary' }])
    }

    return head
  },
})
