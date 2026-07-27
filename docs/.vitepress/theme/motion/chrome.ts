import type { GsapBundle } from './gsap'
import { DUR, EASE } from './tokens'

/** Persistent navbar material. Returns a cleanup function. */
export function setupNavbarMaterial({ gsap }: GsapBundle): () => void {
  const nav = document.querySelector<HTMLElement>('.VPNavBar')
  if (!nav) return () => undefined

  const setMaterial = gsap.quickTo(nav, '--mo-nav-material', {
    duration: DUR.standard,
    ease: EASE.standard,
  })
  const update = () => setMaterial(window.scrollY > 8 ? 1 : 0)

  update()
  window.addEventListener('scroll', update, { passive: true })
  return () => {
    window.removeEventListener('scroll', update)
    gsap.killTweensOf(nav)
    nav.style.removeProperty('--mo-nav-material')
  }
}
