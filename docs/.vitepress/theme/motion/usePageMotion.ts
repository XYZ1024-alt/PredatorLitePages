import { nextTick, onMounted, onUnmounted } from 'vue'
import { useData, useRouter } from 'vitepress'
import { setupNavbarMaterial } from './chrome'
import { loadGsap, type GsapBundle } from './gsap'
import { setupPointerReveal } from './pointerReveal'
import {
  animateHero,
  revealDocs,
  revealHome,
  scrubWords,
  setupMagneticCta,
  setupScrollProgress,
} from './reveal'
import { DUR, EASE } from './tokens'

const PRE_PAINT_CLASS = 'anim'
const ROUTING_CLASS = 'route-transitioning'

interface FailsafeWindow extends Window {
  __moFailsafe?: ReturnType<typeof setTimeout>
}

function releasePrePaint(): void {
  const runtime = window as FailsafeWindow
  if (runtime.__moFailsafe !== undefined) {
    clearTimeout(runtime.__moFailsafe)
    delete runtime.__moFailsafe
  }
  document.documentElement.classList.remove(PRE_PAINT_CLASS)
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

export function usePageMotion(): void {
  const router = useRouter()
  const { frontmatter } = useData()

  let bundle: GsapBundle | null = null
  let pageContext: { revert(): void } | null = null
  let pageMedia: { revert(): void } | null = null
  let pageCleanups: Array<() => void> = []
  let globalCleanups: Array<() => void> = []
  let generation = 0
  let pendingHref = ''
  let firstSetup = true
  let disposed = false

  const previousBefore = router.onBeforeRouteChange
  const previousAfter = router.onAfterRouteChange ?? router.onAfterRouteChanged

  function teardownPage(): void {
    pageCleanups.splice(0).forEach((cleanup) => cleanup())
    pageMedia?.revert()
    pageMedia = null
    pageContext?.revert()
    pageContext = null
  }

  function setupPage(expectedGeneration: number): boolean {
    if (!bundle || disposed || expectedGeneration !== generation) return false

    const skip = firstSetup && !document.documentElement.classList.contains(PRE_PAINT_CLASS)
    firstSetup = false
    if (skip) {
      releasePrePaint()
      bundle.ScrollTrigger.refresh()
      return false
    }

    const current = bundle
    const isHome = frontmatter.value.layout === 'home'
    pageContext = current.gsap.context(() => {
      const media = current.gsap.matchMedia()
      pageMedia = media
      media.add('(prefers-reduced-motion: no-preference)', () => {
        if (isHome) {
          animateHero(current, document)
          revealHome(current, document)
          scrubWords(current, document)
          pageCleanups.push(setupMagneticCta(current, document))
        } else {
          revealDocs(current, document)
          setupScrollProgress(current, document)
        }

        return () => {
          pageCleanups.splice(0).forEach((cleanup) => cleanup())
        }
      })
    }, document.body)

    releasePrePaint()
    current.ScrollTrigger.refresh()
    return true
  }

  function routeOut(): void {
    if (!bundle || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const content = document.querySelector<HTMLElement>('.VPContent')
    if (!content) return

    document.documentElement.classList.add(ROUTING_CLASS)
    bundle.gsap.to(content, {
      autoAlpha: 0,
      y: -6,
      duration: 0.12,
      ease: EASE.exit,
      overwrite: true,
    })
  }

  function routeIn(): void {
    document.documentElement.classList.remove(ROUTING_CLASS)
    if (!bundle) return
    const content = document.querySelector<HTMLElement>('.VPContent')
    if (!content) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      bundle.gsap.set(content, { clearProps: 'opacity,visibility,transform' })
      return
    }

    bundle.gsap.fromTo(
      content,
      { autoAlpha: 0, y: 8 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.28,
        ease: EASE.enter,
        clearProps: 'opacity,visibility,transform',
        overwrite: true,
      },
    )
  }

  onMounted(async () => {
    const loading = loadGsap()
    if (!loading) return

    try {
      bundle = await loading
    } catch {
      releasePrePaint()
      return
    }
    if (disposed || !bundle) return

    globalCleanups = [
      setupNavbarMaterial(bundle),
      setupPointerReveal(),
    ]

    router.onBeforeRouteChange = async (to) => {
      const allowed = await previousBefore?.(to)
      if (allowed === false) return false

      pendingHref = to
      generation += 1
      teardownPage()
      routeOut()
    }

    router.onAfterRouteChange = async (to) => {
      await previousAfter?.(to)
      if (to !== pendingHref || disposed) return

      const expectedGeneration = generation
      await nextTick()
      await nextFrame()
      if (to !== pendingHref || expectedGeneration !== generation || disposed) return

      setupPage(expectedGeneration)
      routeIn()
    }

    setupPage(generation)
  })

  onUnmounted(() => {
    disposed = true
    generation += 1
    teardownPage()
    globalCleanups.splice(0).forEach((cleanup) => cleanup())
    document.documentElement.classList.remove(ROUTING_CLASS)

    router.onBeforeRouteChange = previousBefore
    router.onAfterRouteChange = previousAfter
  })
}
