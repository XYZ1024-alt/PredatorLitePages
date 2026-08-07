<script setup lang="ts">
/**
 * Interactive thermal flow-field behind the hero.
 *
 * A 2D canvas of streak particles driven by a cheap pseudo-curl noise field.
 * The selected operating mode retunes speed, density, turbulence and trail
 * persistence with per-frame lerp, so switching modes feels like the device
 * physically spooling up. The pointer injects local turbulence.
 *
 * Performance guards: DPR capped at 1.75, paused offscreen / on hidden tab,
 * single static frame under prefers-reduced-motion.
 */
import { onMounted, onUnmounted, ref, watch } from 'vue'

export type HeroMode = 'quiet' | 'balanced' | 'performance' | 'turbo'

interface ModeTuning {
  speed: number
  trail: number
  turbulence: number
  density: number
  accentShare: number
}

const TUNING: Record<HeroMode, ModeTuning> = {
  quiet: { speed: 0.34, trail: 0.055, turbulence: 0.7, density: 0.55, accentShare: 0.1 },
  balanced: { speed: 0.62, trail: 0.075, turbulence: 1.0, density: 0.8, accentShare: 0.16 },
  performance: { speed: 1.0, trail: 0.095, turbulence: 1.35, density: 1.0, accentShare: 0.2 },
  turbo: { speed: 1.55, trail: 0.12, turbulence: 1.8, density: 1.15, accentShare: 0.26 },
}

const props = defineProps<{
  mode: HeroMode
}>()

const canvas = ref<HTMLCanvasElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let visible = false
let disposed = false
let observer: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null

interface Particle {
  x: number
  y: number
  px: number
  py: number
  life: number
  maxLife: number
  accent: boolean
}

let particles: Particle[] = []
let width = 0
let height = 0
let time = 0

const pointer = { x: -9999, y: -9999, active: false }

/* Current (lerped) tuning values, so mode changes ease in physically. */
const live: ModeTuning = { ...TUNING.quiet }
let target: ModeTuning = TUNING[props.mode] ?? TUNING.quiet

watch(
  () => props.mode,
  (mode) => {
    target = TUNING[mode] ?? TUNING.quiet
  },
)

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function spawn(): Particle {
  const x = Math.random() * width
  const y = Math.random() * height
  const maxLife = 140 + Math.random() * 220
  return {
    x,
    y,
    px: x,
    py: y,
    life: Math.random() * maxLife,
    maxLife,
    accent: Math.random() < live.accentShare,
  }
}

function resize(): void {
  if (!canvas.value || !ctx) return
  const rect = canvas.value.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
  width = Math.max(1, Math.round(rect.width))
  height = Math.max(1, Math.round(rect.height))
  canvas.value.width = Math.round(width * dpr)
  canvas.value.height = Math.round(height * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = '#0a0c0b'
  ctx.fillRect(0, 0, width, height)

  const base = Math.round((width * height) / 8500)
  const count = Math.max(110, Math.min(340, Math.round(base * live.density)))
  particles = Array.from({ length: count }, spawn)
}

/* Layered sin/cos field: cheap stand-in for curl noise. */
function fieldAngle(x: number, y: number, t: number): number {
  const s = 0.0021 * live.turbulence
  return (
    Math.sin(x * s + t * 0.32) * 1.7 +
    Math.cos(y * s * 1.3 - t * 0.21) * 1.4 +
    Math.sin((x + y) * s * 0.6 + t * 0.13)
  )
}

function frame(): void {
  if (disposed || !ctx) return
  raf = 0

  const ease = 0.045
  live.speed = lerp(live.speed, target.speed, ease)
  live.trail = lerp(live.trail, target.trail, ease)
  live.turbulence = lerp(live.turbulence, target.turbulence, ease)
  live.density = lerp(live.density, target.density, ease)
  live.accentShare = lerp(live.accentShare, target.accentShare, ease)

  time += 0.016 * Math.max(0.35, live.speed)

  /* Fade the previous frame: longer trails at higher modes. */
  ctx.fillStyle = `rgba(10, 12, 11, ${Math.min(0.32, live.trail)})`
  ctx.fillRect(0, 0, width, height)

  ctx.lineWidth = 1

  for (const p of particles) {
    const angle = fieldAngle(p.x, p.y, time)
    let vx = Math.cos(angle) * live.speed
    let vy = Math.sin(angle) * live.speed * 0.82

    if (pointer.active) {
      const dx = p.x - pointer.x
      const dy = p.y - pointer.y
      const distSq = dx * dx + dy * dy
      const radius = 170
      if (distSq < radius * radius && distSq > 0.01) {
        const dist = Math.sqrt(distSq)
        const force = ((radius - dist) / radius) * 2.4
        /* Push outward plus a tangential swirl. */
        vx += (dx / dist) * force - (dy / dist) * force * 0.7
        vy += (dy / dist) * force + (dx / dist) * force * 0.7
      }
    }

    p.px = p.x
    p.py = p.y
    p.x += vx * 1.6
    p.y += vy * 1.6
    p.life += 1

    if (p.life > p.maxLife || p.x < -8 || p.x > width + 8 || p.y < -8 || p.y > height + 8) {
      Object.assign(p, spawn())
      continue
    }

    const fade = Math.sin((p.life / p.maxLife) * Math.PI)
    const alpha = (p.accent ? 0.5 : 0.24) * fade * Math.min(1, 0.4 + live.speed * 0.5)
    ctx.strokeStyle = p.accent
      ? `rgba(45, 212, 191, ${alpha})`
      : `rgba(214, 220, 210, ${alpha})`
    ctx.beginPath()
    ctx.moveTo(p.px, p.py)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }

  schedule()
}

function schedule(): void {
  if (disposed || raf || !visible || document.hidden) return
  raf = requestAnimationFrame(frame)
}

function renderStaticFrame(): void {
  if (!ctx) return
  ctx.fillStyle = '#0a0c0b'
  ctx.fillRect(0, 0, width, height)
  for (let i = 0; i < 420; i += 1) {
    const x = Math.random() * width
    const y = Math.random() * height
    const angle = fieldAngle(x, y, 2.4)
    const len = 8 + Math.random() * 14
    ctx.strokeStyle =
      Math.random() < 0.16 ? 'rgba(45, 212, 191, 0.28)' : 'rgba(214, 220, 210, 0.14)'
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len)
    ctx.stroke()
  }
}

function onPointerMove(event: PointerEvent): void {
  if (!canvas.value) return
  const rect = canvas.value.getBoundingClientRect()
  pointer.x = event.clientX - rect.left
  pointer.y = event.clientY - rect.top
  pointer.active = true
}

function onPointerLeave(): void {
  pointer.active = false
  pointer.x = -9999
  pointer.y = -9999
}

function onVisibilityChange(): void {
  schedule()
}

onMounted(() => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d')
  if (!ctx) return

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  resizeObserver = new ResizeObserver(() => {
    resize()
    if (reduce) renderStaticFrame()
  })
  resizeObserver.observe(canvas.value)
  resize()

  if (reduce) {
    renderStaticFrame()
    return
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? false
      schedule()
    },
    { rootMargin: '80px 0px' },
  )
  observer.observe(canvas.value)

  const host = canvas.value.parentElement
  host?.addEventListener('pointermove', onPointerMove, { passive: true })
  host?.addEventListener('pointerleave', onPointerLeave, { passive: true })
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  disposed = true
  if (raf) cancelAnimationFrame(raf)
  observer?.disconnect()
  resizeObserver?.disconnect()
  const host = canvas.value?.parentElement
  host?.removeEventListener('pointermove', onPointerMove)
  host?.removeEventListener('pointerleave', onPointerLeave)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <canvas ref="canvas" class="hero-canvas" aria-hidden="true"></canvas>
</template>

<style scoped>
.hero-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
