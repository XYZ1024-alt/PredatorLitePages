import type { GsapBundle } from './gsap'
import { DUR, EASE } from './tokens'

/** Persistent navbar material. Returns a cleanup function. */
export function setupNavbarMaterial({ gsap, ScrollTrigger }: GsapBundle): () => void {
  const nav = document.querySelector<HTMLElement>('.VPNavBar')
  if (!nav) return () => undefined

  const setMaterial = gsap.quickTo(nav, '--mo-nav-material', {
    duration: DUR.standard,
    ease: EASE.standard,
  })

  // ScrollTrigger batches scroll reads into its own rAF loop; a raw
  // window scroll listener would re-read scrollY on every frame.
  const trigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => setMaterial(self.scroll() > 8 ? 1 : 0),
  })
  setMaterial(window.scrollY > 8 ? 1 : 0)

  return () => {
    trigger.kill()
    gsap.killTweensOf(nav)
    nav.style.removeProperty('--mo-nav-material')
  }
}
