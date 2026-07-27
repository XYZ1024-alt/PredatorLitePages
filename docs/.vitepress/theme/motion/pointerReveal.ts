const TARGETS = [
  '.capability-item',
  '.VPButton',
  '.docs-callout a',
  '.VPSidebarItem .item',
  '.VPNavBarMenuLink',
].join(',')

/**
 * Installs one delegated pointer listener for Fluent surface reveal.
 * Coordinates are written relative to the hovered target and consumed by CSS.
 */
export function setupPointerReveal(): () => void {
  const media = window.matchMedia('(hover: hover) and (pointer: fine)')
  let frame = 0
  let target: HTMLElement | null = null
  let clientX = 0
  let clientY = 0

  const flush = () => {
    frame = 0
    if (!target) return
    const rect = target.getBoundingClientRect()
    target.style.setProperty('--mx', `${clientX - rect.left}px`)
    target.style.setProperty('--my', `${clientY - rect.top}px`)
  }

  const onMove = (event: PointerEvent) => {
    if (!media.matches || !(event.target instanceof Element)) return
    target = event.target.closest<HTMLElement>(TARGETS)
    if (!target) return
    clientX = event.clientX
    clientY = event.clientY
    if (frame === 0) frame = requestAnimationFrame(flush)
  }

  const onFocus = (event: FocusEvent) => {
    if (!(event.target instanceof Element)) return
    const focused = event.target.closest<HTMLElement>(TARGETS)
    if (!focused) return
    const rect = focused.getBoundingClientRect()
    focused.style.setProperty('--mx', `${rect.width / 2}px`)
    focused.style.setProperty('--my', `${rect.height / 2}px`)
  }

  document.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('focusin', onFocus)

  return () => {
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('focusin', onFocus)
    if (frame !== 0) cancelAnimationFrame(frame)
  }
}
