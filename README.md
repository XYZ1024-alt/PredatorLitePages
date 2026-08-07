# PredatorLite Pages

PredatorLite 的双语项目介绍与文档站，使用 [Astro](https://astro.build/) + [Starlight](https://starlight.astro.build/) 构建。

## 本地开发

要求 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

生产构建与本地预览：

```bash
npm run build
npm run preview
```

## 内容结构

- `src/pages/index.astro`：中文首页，Cloudflare Pages 根路径
- `src/pages/en/index.astro`：英文首页，对应 `/en/`
- `src/content/docs/guide/`：中文文档
- `src/content/docs/en/guide/`：英文文档
- `astro.config.mjs`：Starlight 站点配置（双语 locale、侧栏、样式入口、SEO 基础）
- `src/site.ts`：站点域名、对外链接、分享图
- `src/components/`：首页使用的 Vue 组件（Hero、能力 marquee、产品走查、场景手风琴）
- `src/styles/`：设计 token、站点基础样式、首页样式
- `src/motion/`：按需加载的 GSAP 与 ScrollTrigger 入口
- `public/img/`：logo 和生成的 Windows 11 屏幕截图
- `public/_headers`、`public/robots.txt`：Cloudflare 响应头与爬虫规则

中文与英文页面保持相同的信息结构。添加新文档时，需要同时更新两个语言目录；侧栏在 `astro.config.mjs` 的 `sidebar` 中集中维护，条目文案用 `translations` 提供英文版本，路径会自动加上语言前缀。

## 站点配置

界面文案使用 Starlight 内置的 zh-CN / en 翻译，侧栏与分组标题的双语文案在 `astro.config.mjs` 中维护。首页正文和交互组件的本地化属性保留在对应语言的 `src/pages/**/index.astro` 中。

`src/site.ts` 存放站点级常量：

- `siteUrl`：部署域名。sitemap、canonical、`hreflang` 和 `og:url` 都基于它生成，换自定义域名时改这一处。
- `projectLinks`：GitHub、下载、问题反馈地址。填写后可在 `astro.config.mjs` 的 `social` 配置中引用。
- `ogImage`：社交分享图，建议 1200×630。留空时不输出 `og:image`。

## 动效系统

首页仅在低频叙事区使用动效。Hero 使用 CSS `transform` 入场并保持首帧内容可见；功能范围使用一个可暂停的 CSS marquee；`ProductWalkthrough.vue` 在桌面端按需加载 `gsap` 与 `ScrollTrigger`，左侧产品概览使用原生 sticky，右侧真实截图由滚动进度驱动。

文档页、路由切换、导航和键盘操作不使用全局入场动画。所有移动动画都尊重 `prefers-reduced-motion`；GSAP 加载失败或 JavaScript 被禁用时，完整静态内容仍然可见。

## 视觉系统

站点使用纯黑白产品编辑语言：近白与近黑双主题、Geist Sans/Mono、统一圆角和无彩界面 token。首页产品视觉使用基于真实界面生成的 Windows 11 直接屏幕截图，不包含设备外框或摄影场景；品牌标志保留原色。主题默认跟随系统偏好，用户仍可用 Starlight 的外观开关切换。

首页 Hero 由 `src/components/HomeHero.vue` 以 props 接收数据渲染。首页正文在两个 `index.astro` 中组织为内联截图陈述、满格 Bento、产品走查、场景手风琴和文档 CTA。

## 替换内容

1. 修改两个首页的 hero 文案、项目定位、核心能力和使用场景。
2. 将 `guide` 目录中的提示文字替换为经过验证的项目说明。
3. 在 `src/site.ts` 填写公开链接，并在 `astro.config.mjs` 的 `social` 中启用。
4. 首页实际展示的五个 Windows 11 直接屏幕截图位于 `public/img/screens/`。
5. 准备一张 1200×630 的分享图放入 `public/img/`，并在 `src/site.ts` 的 `ogImage` 中填写路径。

## Cloudflare Pages

在 Cloudflare Pages 中连接此仓库，并使用以下构建配置：

| 配置项 | 值 |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Node.js version | `20` 或更高 |

仓库根目录的 `.node-version` 会被 Cloudflare Pages 直接识别，通常不需要再手动设置 `NODE_VERSION` 环境变量。

站点使用根路径部署，不需要 GitHub Pages 的仓库名 `base` 配置。Cloudflare Pages 会直接托管 Astro 生成的静态文件。

构建产物中与部署相关的几项：

- `sitemap-index.xml`：由 `@astrojs/sitemap` 基于 `siteUrl` 自动生成。
- `robots.txt`：来自 `public/`，其中的 Sitemap 地址需与 `siteUrl` 保持一致。
- `_headers`：`/_astro/*` 是带内容哈希的构建产物，设为一年 immutable；站点图片单独放在 `/img/*`，使用较短的缓存时间。**新增图片请放入 `public/img/`，不要构建进 `_astro`**，否则会被按 immutable 缓存而无法更新。
