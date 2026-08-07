/** Loads the scroll-storytelling bundle only when the walkthrough mounts. */
type GsapCore = typeof import('gsap')['gsap']
type ScrollTriggerStatic = typeof import('gsap/ScrollTrigger')['ScrollTrigger']

export interface GsapBundle {
  gsap: GsapCore
  ScrollTrigger: ScrollTriggerStatic
}

let pending: Promise<GsapBundle> | null = null

export function loadGsap(): Promise<GsapBundle> | null {
  if (import.meta.env.SSR) return null

  pending ??= (async () => {
    const [core, scrollTrigger] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ])

    const { gsap } = core
    gsap.registerPlugin(scrollTrigger.ScrollTrigger)

    return {
      gsap,
      ScrollTrigger: scrollTrigger.ScrollTrigger,
    }
  })().catch((error) => {
    pending = null
    if (import.meta.env.DEV) console.warn('[motion] Failed to load GSAP', error)
    throw error
  })

  return pending
}
