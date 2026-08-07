export interface ProjectLinks {
  repository: string
  downloads: string
  issues: string
}

/**
 * Fill these values when the public project URLs are ready.
 * Empty links are intentionally hidden from the rendered navigation.
 */
export const projectLinks: ProjectLinks = {
  repository: '',
  downloads: '',
  issues: '',
}

/**
 * Absolute origin of the deployed site, without a trailing slash.
 * Used for the sitemap, canonical URLs, `hreflang` alternates and `og:url`.
 * Update this first when a custom domain replaces the Pages subdomain.
 */
export const siteUrl = 'https://predatorlite.pages.dev'

/**
 * Root-relative path to the social sharing image, e.g. `/img/og-cover.png`.
 *
 * Left empty on purpose: `public/img/` currently holds SVG placeholders
 * until real screenshots exist. Add a dedicated 1200x630 image and point this
 * at it. While empty, `og:image` is omitted and the Twitter card stays
 * `summary`.
 */
export const ogImage = ''
