import type { GsapBundle } from './gsap'
import { DUR, EASE, STAGGER, TRAVEL } from './tokens'

const HOME_SOLO = '[data-reveal], .home-block > h2'
const HOME_GROUPS = '[data-reveal-group]'
const DOC_TARGETS = [
  '.vp-doc > h2',
  '.vp-doc > h3',
  '.vp-doc > p',
  '.vp-doc > ul',
  '.vp-doc > ol',
  '.vp-doc > table',
  '.vp-doc > .custom-block',
  '.vp-doc > .vp-code-group',
  '.vp-doc > div[class*="language-"]',
].join(',')

interface RevealBatch {
  trigger: Element
  targets: Element[]
}

function collectHomeBatches(root: ParentNode): RevealBatch[] {
  const batches: RevealBatch[] = []
  for (const element of root.querySelectorAll(HOME_SOLO)) {
    batches.push({ trigger: element, targets: [element] })
  }
  for (const group of root.querySelectorAll(HOME_GROUPS)) {
    const targets = Array.from(group.children)
    if (targets.length > 0) batches.push({ trigger: group, targets })
  }
  return batches
}

export function revealHome({ gsap }: GsapBundle, root: ParentNode): void {
  let firstGroup = true
  for (const { trigger, targets } of collectHomeBatches(root)) {
    // The first block sits closest to the hero, so it enters a touch faster;
    // later blocks keep the standard reveal pace. Same curve throughout, so
    // the difference reads as hierarchy rather than as two animation systems.
    const duration = firstGroup ? DUR.enter : DUR.reveal
    firstGroup = false

    gsap.set(targets, { opacity: 0, y: TRAVEL.standard })
    gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration,
      ease: EASE.enter,
      stagger: STAGGER,
      clearProps: 'willChange',
      scrollTrigger: {
        trigger,
        start: 'top 80%',
        once: true,
      },
    })
  }
}

export function revealDocs({ gsap, ScrollTrigger }: GsapBundle, root: ParentNode): void {
  const targets = Array.from(root.querySelectorAll<HTMLElement>(DOC_TARGETS))
  if (targets.length === 0) return

  gsap.set(targets, { opacity: 0, y: 12 })
  ScrollTrigger.batch(targets, {
    start: 'top 85%',
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: DUR.enter,
        ease: EASE.enter,
        stagger: STAGGER,
        clearProps: 'willChange',
        overwrite: 'auto',
      })
    },
  })
}

export function animateHero({ gsap, SplitText }: GsapBundle, root: ParentNode): void {
  const name = root.querySelector<HTMLElement>('.home-hero__name')
  const title = root.querySelector<HTMLElement>('.home-hero__title')
  const tagline = root.querySelector<HTMLElement>('.home-hero__tagline')
  const actions = root.querySelector<HTMLElement>('.home-hero__actions')
  const actionItems = root.querySelectorAll<HTMLElement>('.home-hero__action')
  const visual = root.querySelector<HTMLElement>('.hero-visual')
  const shine = root.querySelector<HTMLElement>('.hero-visual__shine')
  const headings = [name, title].filter((element): element is HTMLElement => Boolean(element))
  const timeline = gsap.timeline({ defaults: { ease: EASE.enter } })

  let lines: Element[] = headings
  try {
    if (headings.length > 0) {
      const split = new SplitText(headings, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'hero-line',
      })
      lines = split.lines
    }
  } catch {
    // CJK wrapping or a future SplitText change can fall back to whole blocks.
  }

  gsap.set(headings, { autoAlpha: 1 })
  if (lines.length > 0) {
    timeline.fromTo(
      lines,
      { autoAlpha: 0, yPercent: 105 },
      { autoAlpha: 1, yPercent: 0, duration: DUR.hero, stagger: STAGGER },
      0,
    )
  }

  if (tagline) {
    timeline.fromTo(
      tagline,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: DUR.enter },
      0.15,
    )
  }

  if (actions) {
    gsap.set(actions, { autoAlpha: 1 })
    timeline.fromTo(
      actionItems,
      { autoAlpha: 0, y: TRAVEL.micro },
      { autoAlpha: 1, y: 0, duration: DUR.enter, stagger: STAGGER },
      0.24,
    )
  }

  if (visual) {
    timeline.fromTo(
      visual,
      { autoAlpha: 0, scale: 0.96, y: TRAVEL.hero },
      {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration: DUR.heroImage,
        clearProps: 'opacity,visibility,scale,y,willChange',
      },
      0.08,
    )
  }

  if (shine) {
    timeline.fromTo(
      shine,
      { xPercent: -75 },
      { xPercent: 75, duration: 0.8, ease: EASE.standard },
      0.5,
    )
  }
}

/**
 * Scroll-scrubbed character reveal for `[data-scrub-words]` blocks.
 *
 * The pre-paint state hides the element itself; here it is set visible and the
 * scrub owns the per-character opacity from there on. SplitText failure (CJK
 * edge cases, future API changes) falls back to a plain whole-block fade.
 */
export function scrubWords({ gsap, SplitText }: GsapBundle, root: ParentNode): void {
  const elements = root.querySelectorAll<HTMLElement>('[data-scrub-words]')

  for (const element of elements) {
    let units: Element[] = []
    try {
      const split = new SplitText(element, { type: 'words,chars' })
      units = split.chars.length > 0 ? split.chars : split.words
    } catch {
      units = []
    }

    gsap.set(element, { opacity: 1, clearProps: 'willChange' })

    if (units.length === 0) {
      gsap.fromTo(
        element,
        { opacity: 0 },
        { opacity: 1, duration: DUR.reveal, ease: EASE.enter },
      )
      continue
    }

    gsap.fromTo(
      units,
      { opacity: 0.12 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.04,
        scrollTrigger: {
          trigger: element,
          start: 'top 82%',
          end: 'top 38%',
          scrub: true,
        },
      },
    )
  }
}

export function setupScrollProgress({ gsap }: GsapBundle, root: ParentNode): void {  const bar = root.querySelector<HTMLElement>('.scroll-progress__bar')
  if (!bar) return

  gsap.fromTo(
    bar,
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        start: 0,
        end: 'max',
        scrub: true,
      },
    },
  )
}

export function setupMagneticCta(
  { gsap }: GsapBundle,
  root: ParentNode,
): () => void {
  const button = root.querySelector<HTMLElement>('.docs-callout a')
  if (!button) return () => undefined

  const moveX = gsap.quickTo(button, 'x', { duration: DUR.standard, ease: EASE.enter })
  const moveY = gsap.quickTo(button, 'y', { duration: DUR.standard, ease: EASE.enter })
  const onMove = (event: PointerEvent) => {
    const rect = button.getBoundingClientRect()
    moveX(((event.clientX - rect.left) / rect.width - 0.5) * 8)
    moveY(((event.clientY - rect.top) / rect.height - 0.5) * 8)
  }
  const onLeave = () => {
    moveX(0)
    moveY(0)
  }

  button.addEventListener('pointermove', onMove, { passive: true })
  button.addEventListener('pointerleave', onLeave)
  return () => {
    button.removeEventListener('pointermove', onMove)
    button.removeEventListener('pointerleave', onLeave)
    gsap.killTweensOf(button)
  }
}
