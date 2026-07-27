/**
 * One pointer listener for the whole page.
 *
 * Attaching a `pointermove` handler per element is the usual way this gets built
 * and the usual reason the page stutters: every handler runs on every move, at
 * whatever rate the mouse reports. This keeps a single passive listener, samples
 * once per animation frame no matter how many events arrived, and fans the result
 * out to subscribers.
 *
 * Coordinates are normalised to -1..1 across the viewport with the origin at the
 * centre, which is the form both the hero tilt and the aurora drift want.
 */

export interface PointerSample {
  /** -1 at the left edge, 1 at the right. */
  x: number
  /** -1 at the top edge, 1 at the bottom. */
  y: number
}

type Listener = (sample: PointerSample) => void

const listeners = new Set<Listener>()
const sample: PointerSample = { x: 0, y: 0 }

let clientX = 0
let clientY = 0
let frame = 0
let attached = false

function flush(): void {
  frame = 0
  // Read the viewport here rather than in the event: this runs once per frame,
  // so it is the cheaper place to touch layout-dependent globals.
  sample.x = (clientX / window.innerWidth) * 2 - 1
  sample.y = (clientY / window.innerHeight) * 2 - 1
  for (const listener of listeners) listener(sample)
}

function onMove(event: PointerEvent): void {
  clientX = event.clientX
  clientY = event.clientY
  // Coalesce: the newest position wins, and only one frame is ever queued.
  if (frame === 0) frame = requestAnimationFrame(flush)
}

/** Subscribes to pointer movement. Returns the unsubscribe function. */
export function onPointer(listener: Listener): () => void {
  listeners.add(listener)

  if (!attached) {
    window.addEventListener('pointermove', onMove, { passive: true })
    attached = true
  }

  return () => {
    listeners.delete(listener)
    if (listeners.size > 0) return

    window.removeEventListener('pointermove', onMove)
    attached = false
    if (frame !== 0) {
      cancelAnimationFrame(frame)
      frame = 0
    }
  }
}
