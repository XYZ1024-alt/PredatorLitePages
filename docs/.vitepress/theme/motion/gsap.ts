/**
 * Loads GSAP once per page session.
 *
 * The import is dynamic so Vite emits GSAP as its own chunk: it stays out of
 * the main bundle and off the critical path. None of the motion on this site is
 * needed to read the page, so none of it should delay the first paint.
 *
 * Nothing here may run during SSR. `import.meta.env.SSR` short-circuits before
 * the import so the static build never evaluates GSAP in Node.
 */
import { registerFluentEases } from './tokens'

type GsapCore = typeof import('gsap')['gsap']
type ScrollTriggerStatic = typeof import('gsap/ScrollTrigger')['ScrollTrigger']
type SplitTextStatic = typeof import('gsap/SplitText')['SplitText']

export interface GsapBundle {
  gsap: GsapCore
  ScrollTrigger: ScrollTriggerStatic
  SplitText: SplitTextStatic
}

let pending: Promise<GsapBundle> | null = null

/**
 * Resolves to the registered GSAP bundle, or `null` during SSR.
 *
 * Callers must handle `null`, which doubles as the "not in a browser" guard:
 *
 * ```ts
 * const bundle = await loadGsap()
 * if (!bundle) return
 * ```
 */
export function loadGsap(): Promise<GsapBundle> | null {
  if (import.meta.env.SSR) return null

  pending ??= (async () => {
    const [core, scrollTrigger, splitText, customEase] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('gsap/SplitText'),
      import('gsap/CustomEase'),
    ])

    const { gsap } = core
    gsap.registerPlugin(
      scrollTrigger.ScrollTrigger,
      splitText.SplitText,
      customEase.CustomEase,
    )
    registerFluentEases(customEase.CustomEase)

    return {
      gsap,
      ScrollTrigger: scrollTrigger.ScrollTrigger,
      SplitText: splitText.SplitText,
    }
  })().catch((error) => {
    // Allow a later navigation to retry after a transient chunk/network failure.
    pending = null
    if (import.meta.env.DEV) console.warn('[motion] Failed to load GSAP', error)
    throw error
  })

  return pending
}
