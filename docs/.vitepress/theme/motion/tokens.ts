/**
 * Shared motion tokens.
 *
 * Every animation on the site, CSS transition or GSAP tween, takes its curve,
 * duration and travel distance from here. That shared vocabulary is what makes
 * the motion read as one system instead of a pile of separate effects, so
 * prefer adding a token over hard-coding a one-off value.
 *
 * The curves are the Fluent Design easings, the same ones the WinUI application
 * this site documents animates with.
 *
 * `styles/tokens.css` mirrors these values as CSS custom properties. The two
 * lists have to be edited together; nothing syncs them at build time.
 */

/** Cubic-bezier control points, `[x1, y1, x2, y2]`. */
type Bezier = readonly [number, number, number, number]

/** GSAP ease names, registered by {@link registerFluentEases}. */
export const EASE = {
  /** Decelerate. Entrances: reveals, fades, rises. */
  enter: 'fluentEnter',
  /** Accelerate. Exits: fade-outs, the first half of a route change. */
  exit: 'fluentExit',
  /** Point to point: sliding indicators, pill selection. */
  standard: 'fluentStandard',
} as const

const CURVES: Readonly<Record<string, Bezier>> = {
  [EASE.enter]: [0.1, 0.9, 0.2, 1],
  [EASE.exit]: [0.7, 0, 1, 0.5],
  [EASE.standard]: [0.8, 0, 0.2, 1],
}

/** Seconds, GSAP's unit. `styles/tokens.css` carries the same values in ms. */
export const DUR = {
  micro: 0.15,
  standard: 0.25,
  enter: 0.3,
  /** Scroll reveals. Shorter on doc pages, where the reader is reading. */
  reveal: 0.4,
  hero: 0.7,
  heroImage: 0.9,
} as const

/**
 * Travel distance in px. Capped deliberately: long travel is the first thing
 * that makes a scroll animation feel cheap, and it buys nothing.
 */
export const TRAVEL = {
  micro: 8,
  standard: 16,
  hero: 24,
} as const

/** Seconds between staggered siblings. */
export const STAGGER = 0.06

/** Degrees. The hero tilt ceiling; more than this reads as a gimmick. */
export const TILT_MAX = 3.5

/**
 * Turns control points into the SVG path CustomEase parses. A plain cubic
 * bezier from (0,0) to (1,1) is one C segment.
 */
function toPath([x1, y1, x2, y2]: Bezier): string {
  return `M0,0 C${x1},${y1} ${x2},${y2} 1,1`
}

let registered = false

/** Idempotent: several callers may await the same {@link loadGsap} promise. */
export function registerFluentEases(
  CustomEase: { create(name: string, data: string): unknown },
): void {
  if (registered) return
  for (const [name, curve] of Object.entries(CURVES)) {
    CustomEase.create(name, toPath(curve))
  }
  registered = true
}
