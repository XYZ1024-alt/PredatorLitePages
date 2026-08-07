import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import vue from '@astrojs/vue'
import sitemap from '@astrojs/sitemap'
import { siteUrl } from './src/site'

export default defineConfig({
  site: siteUrl,
  integrations: [
    starlight({
      title: {
        'zh-CN': 'PredatorLite',
        en: 'PredatorLite',
      },
      description: 'PredatorLite 项目介绍与使用文档',
      defaultLocale: 'root',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
        en: { label: 'English', lang: 'en-US' },
      },
      logo: {
        src: './public/img/logo.svg',
        alt: 'PredatorLite',
      },
      favicon: '/img/logo.svg',
      lastUpdated: true,
      pagination: true,
      sidebar: [
        {
          label: '项目文档',
          translations: { en: 'Project documentation' },
          items: [
            {
              label: '文档首页',
              translations: { en: 'Overview' },
              link: '/guide/',
            },
            {
              label: '快速开始',
              translations: { en: 'Getting started' },
              link: '/guide/getting-started/',
            },
            {
              label: '配置说明',
              translations: { en: 'Configuration' },
              link: '/guide/configuration/',
            },
            {
              label: '常见问题',
              translations: { en: 'FAQ' },
              link: '/guide/faq/',
            },
          ],
        },
      ],
      customCss: [
        './src/styles/tokens.css',
        './src/styles/base.css',
        './src/styles/home.css',
      ],
      head: [
        {
          tag: 'meta',
          attrs: {
            name: 'theme-color',
            content: '#f4f4f0',
            media: '(prefers-color-scheme: light)',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'theme-color',
            content: '#111210',
            media: '(prefers-color-scheme: dark)',
          },
        },
      ],
    }),
    vue(),
    sitemap(),
  ],
  vite: {
    ssr: { noExternal: ['gsap'] },
  },
})
