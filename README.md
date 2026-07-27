# PredatorLite Pages

PredatorLite 的双语项目介绍与文档站，使用 [VitePress](https://vitepress.dev/) 构建。

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

- `docs/index.md`：中文首页，Cloudflare Pages 根路径
- `docs/en/index.md`：英文首页，对应 `/en/`
- `docs/guide/`：中文文档
- `docs/en/guide/`：英文文档
- `docs/.vitepress/i18n.ts`：站点 chrome 文案（导航、侧栏、按钮、404、搜索框）
- `docs/.vitepress/config.mts`：站点结构、搜索分词、SEO 元信息
- `docs/.vitepress/site.ts`：站点域名、对外链接、分享图
- `docs/.vitepress/theme/`：主题入口、Layout 和自定义组件
- `docs/.vitepress/theme/styles/`：设计 token、站点基础样式、首页样式和动效状态
- `docs/.vitepress/theme/motion/`：GSAP 加载器、Fluent 动效 token 与页面控制器
- `docs/public/img/`：logo 和软件截图
- `docs/public/_headers`、`docs/public/robots.txt`：Cloudflare 响应头与爬虫规则

中文与英文页面保持相同的信息结构。添加新文档时，需要同时更新两个语言目录，并在 `i18n.ts` 的 `sidebar` 中补上对应条目——两个语言的侧栏由同一份配置生成，不需要分别维护路径。

## 站点配置

站点 chrome 文案集中在 `docs/.vitepress/i18n.ts`，每种语言一个 `LocaleUI` 对象。首页正文和 `ModeShowcase` 文案保留在对应语言的 `index.md` 中；新增一门语言时需要同时补首页内容，并在 `config.mts` 的 `locales` 中登记。

`docs/.vitepress/site.ts` 存放站点级常量：

- `siteUrl`：部署域名。sitemap、canonical、`hreflang` 和 `og:url` 都基于它生成，换自定义域名时改这一处。
- `projectLinks`：GitHub、下载、问题反馈地址。**留空的链接会自动从导航中隐藏**，不必删除条目。
- `ogImage`：社交分享图，建议 1200×630。留空时不输出 `og:image`。

## 动效系统

站点使用 `gsap`、`ScrollTrigger`、`SplitText` 和 `CustomEase` 实现渐进增强的动效。依赖位于 `devDependencies`，静态构建会将运行时代码输出为独立资源，不要求部署环境执行 `npm install`。

缓动、时长和位移统一定义在两处（强 ease-out 入场、加速出场、对称过渡）：

- `docs/.vitepress/theme/motion/tokens.ts`：GSAP 使用的命名 ease 与数值 token。
- `docs/.vitepress/theme/styles/tokens.css`：CSS transition 使用的同值变量。

修改动效 token 时需同步更新这两个文件。`prefers-reduced-motion`、禁用 JavaScript 和动效资源加载失败都会回退为完整可见的静态页面。

## 视觉系统

站点为 dark tech 风格：深色是默认主题（`config.mts` 的 `appearance: 'dark'`），亮色为完整设计的日间变体，两个模式共用同一个电光青强调色与同一套圆角 token（卡片 12px、按钮 8px、小元素 6px，定义在 `tokens.css`）。

首页 hero 由 `docs/.vitepress/theme/components/HomeHero.vue` 通过 `home-hero-before` 插槽渲染，默认 `.VPHero` 内容被 CSS 隐藏而不是被 fork；hero 文案仍来自两个 `index.md` 的 frontmatter。正文的 `data-scrub-words` 区块在滚动时逐字显现，`data-reveal` / `data-reveal-group` 为批量入场，相关选择器在 `motion.css`、`reveal.ts` 和 `config.mts` 的预渲染脚本中需要保持一致。

## 替换内容

1. 修改两个首页的 hero 文案、项目定位、核心能力和使用场景。
2. 将 `guide` 目录中的提示文字替换为经过验证的项目说明。
3. 在 `docs/.vitepress/site.ts` 填写公开链接。空链接不会显示在导航中。
4. 如需替换素材，保持 `docs/public/img/` 下的 `logo.png` 和 `main.png` 文件名，或者同步更新首页与站点配置中的路径。
5. 准备一张 1200×630 的分享图放入 `docs/public/img/`，并在 `site.ts` 的 `ogImage` 中填写路径。

## Cloudflare Pages

在 Cloudflare Pages 中连接此仓库，并使用以下构建配置：

| 配置项 | 值 |
| --- | --- |
| Framework preset | VitePress |
| Build command | `npm run build` |
| Build output directory | `docs/.vitepress/dist` |
| Root directory | `/` |
| Node.js version | `20` 或更高 |

仓库根目录的 `.node-version` 会被 Cloudflare Pages 直接识别，通常不需要再手动设置 `NODE_VERSION` 环境变量。

站点使用根路径部署，不需要 GitHub Pages 的仓库名 `base` 配置。Cloudflare Pages 会直接托管 VitePress 生成的静态文件。

构建产物中与部署相关的几项：

- `sitemap.xml`：由 `config.mts` 的 `sitemap.hostname` 自动生成。
- `robots.txt`：来自 `docs/public/`，其中的 Sitemap 地址需与 `siteUrl` 保持一致。
- `_headers`：`/assets/*` 是带内容哈希的构建产物，设为一年 immutable；站点图片单独放在 `/img/*`，使用较短的缓存时间。**新增图片请放入 `docs/public/img/`，不要放回 `assets`**，否则会被按 immutable 缓存而无法更新。
