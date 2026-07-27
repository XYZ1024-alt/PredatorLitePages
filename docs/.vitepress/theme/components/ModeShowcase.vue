<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { loadGsap, type GsapBundle } from '../motion/gsap'
import { DUR, EASE } from '../motion/tokens'

const props = defineProps<{
  title: string
  description: string
  quiet: string
  balanced: string
  performance: string
  caption: string
  ariaLabel: string
}>()

const labels = computed(() => [props.quiet, props.balanced, props.performance])
const active = ref(1)
const indicatorHydrated = ref(false)
const root = ref<HTMLElement | null>(null)
const indicator = ref<HTMLElement | null>(null)
const indicatorFill = ref<HTMLElement | null>(null)
const path = ref<SVGPathElement | null>(null)
const buttons = ref<HTMLButtonElement[]>([])

const paths = [
  {
    base: 'M0 70 C54 66 92 72 140 67 S230 71 284 66 S354 69 400 65',
    alternate: 'M0 68 C54 72 92 64 140 70 S230 65 284 71 S354 64 400 68',
  },
  {
    base: 'M0 72 C48 54 92 82 140 60 S226 78 282 56 S350 78 400 62',
    alternate: 'M0 62 C48 80 92 52 140 76 S226 54 282 79 S350 52 400 70',
  },
  {
    base: 'M0 76 C45 36 86 94 132 43 S220 92 274 38 S350 96 400 49',
    alternate: 'M0 50 C45 94 86 35 132 88 S220 38 274 94 S350 35 400 78',
  },
] as const

let bundle: GsapBundle | null = null
let media: { revert(): void } | null = null
let motionTween: { kill(): void; paused(value?: boolean): boolean } | null = null
let autoCall: { kill(): void; paused(value?: boolean): boolean } | null = null
let scrollTrigger: { kill(): void } | null = null
let indicatorTween: { kill(): void } | null = null
let motionEnabled = false
let inView = false
let userControlled = false
let disposed = false

function setStaticState(): void {
  if (indicator.value) {
    indicator.value.style.transform = `translateX(${active.value * 100}%)`
  }
  path.value?.setAttribute('d', paths[active.value].base)
}

function animateIndicator(animate: boolean): void {
  if (!indicator.value || !indicatorFill.value) return
  indicatorTween?.kill()

  if (!bundle || !motionEnabled || !animate) {
    if (bundle) {
      bundle.gsap.set(indicator.value, {
        x: active.value * indicator.value.offsetWidth,
        xPercent: 0,
      })
      bundle.gsap.set(indicatorFill.value, { scaleX: 1 })
    } else {
      setStaticState()
    }
    return
  }

  const { gsap } = bundle
  const timeline = gsap.timeline()
  timeline
    .to(indicatorFill.value, {
      scaleX: 1.08,
      duration: DUR.micro,
      ease: EASE.enter,
    }, 0)
    .to(indicator.value, {
      x: active.value * indicator.value.offsetWidth,
      xPercent: 0,
      duration: DUR.standard,
      ease: EASE.standard,
    }, 0)
    .to(indicatorFill.value, {
      scaleX: 1,
      duration: DUR.micro,
      ease: EASE.enter,
    }, DUR.micro)
  indicatorTween = timeline
}

function syncPlayback(): void {
  const paused = !inView || document.hidden
  motionTween?.paused(paused)
  autoCall?.paused(paused)
}

function startPathMotion(): void {
  if (!bundle || !path.value || !motionEnabled) return
  const { gsap } = bundle
  const selected = paths[active.value]

  motionTween?.kill()
  gsap.killTweensOf(path.value)
  const timeline = gsap.timeline()
  timeline
    .to(path.value, {
      attr: { d: selected.base },
      duration: 0.6,
      ease: EASE.standard,
    })
    .to(path.value, {
      attr: { d: selected.alternate },
      duration: 4,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    })
  motionTween = timeline
  syncPlayback()
}

function scheduleAuto(): void {
  autoCall?.kill()
  if (!bundle || !motionEnabled || userControlled) return
  autoCall = bundle.gsap.delayedCall(4, () => {
    select((active.value + 1) % labels.value.length, false)
    scheduleAuto()
  })
  syncPlayback()
}

function claimControl(): void {
  userControlled = true
  autoCall?.kill()
  autoCall = null
}

function select(index: number, fromUser = true): void {
  const length = labels.value.length
  active.value = (index + length) % length
  if (fromUser) claimControl()

  void nextTick(() => {
    animateIndicator(true)
    if (motionEnabled) startPathMotion()
    else setStaticState()
  })
}

function onKeydown(event: KeyboardEvent, index: number): void {
  let next = index
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next += 1
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next -= 1
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = labels.value.length - 1
  else return

  event.preventDefault()
  select(next, true)
  void nextTick(() => buttons.value[active.value]?.focus())
}

function onVisibilityChange(): void {
  syncPlayback()
}

onMounted(async () => {
  document.addEventListener('visibilitychange', onVisibilityChange)
  setStaticState()
  indicatorHydrated.value = true

  const loading = loadGsap()
  if (!loading) return

  try {
    bundle = await loading
    if (disposed || !root.value) return

    const mm = bundle.gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (!bundle || !root.value) return
      motionEnabled = true
      animateIndicator(false)

      const bounds = root.value.getBoundingClientRect()
      inView = bounds.bottom > 0 && bounds.top < window.innerHeight
      scrollTrigger = bundle.ScrollTrigger.create({
        trigger: root.value,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: ({ isActive }) => {
          inView = isActive
          syncPlayback()
        },
      })

      startPathMotion()
      scheduleAuto()

      return () => {
        motionEnabled = false
        motionTween?.kill()
        autoCall?.kill()
        indicatorTween?.kill()
        scrollTrigger?.kill()
        motionTween = null
        autoCall = null
        scrollTrigger = null
        indicatorTween = null
        setStaticState()
      }
    })
    media = mm
  } catch {
    setStaticState()
  }
})

onUnmounted(() => {
  disposed = true
  document.removeEventListener('visibilitychange', onVisibilityChange)
  media?.revert()
})
</script>

<template>
  <article ref="root" class="capability-item mode-showcase">
    <div class="mode-showcase__copy">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>

    <div
      class="mode-showcase__selector"
      role="radiogroup"
      :aria-label="ariaLabel"
      aria-orientation="horizontal"
      @focusin="claimControl"
    >
      <span
        ref="indicator"
        class="mode-showcase__indicator"
        :class="{ 'mode-showcase__indicator--initial': !indicatorHydrated }"
        aria-hidden="true"
      >
        <span ref="indicatorFill" />
      </span>
      <button
        v-for="(label, index) in labels"
        :key="label"
        :ref="(el) => { if (el) buttons[index] = el as HTMLButtonElement }"
        type="button"
        role="radio"
        :aria-checked="active === index"
        :tabindex="active === index ? 0 : -1"
        @click="select(index)"
        @keydown="onKeydown($event, index)"
      >
        {{ label }}
      </button>
    </div>

    <div class="mode-showcase__graph" aria-hidden="true">
      <svg viewBox="0 0 400 132" preserveAspectRatio="none">
        <path class="mode-showcase__baseline" d="M0 100 H400" />
        <path ref="path" class="mode-showcase__path" :d="paths[active].base" />
      </svg>
    </div>

    <p class="mode-showcase__caption">{{ caption }}</p>
  </article>
</template>

<style scoped>
.mode-showcase {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 0.95fr);
  grid-template-rows: auto 1fr auto;
  gap: 18px 28px;
  overflow: hidden;
}

.mode-showcase__copy {
  grid-column: 1;
}

.mode-showcase__copy p {
  margin-top: 12px;
}

.mode-showcase__selector {
  position: relative;
  grid-column: 1;
  align-self: end;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  min-height: 38px;
  padding: 3px;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--mo-radius-small);
  background: color-mix(in srgb, var(--vp-c-bg) 60%, transparent);
}

.mode-showcase__selector button {
  position: relative;
  z-index: 1;
  min-width: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--vp-c-text-2);
  font: inherit;
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0;
  cursor: pointer;
}

.mode-showcase__selector button[aria-checked="true"] {
  color: var(--vp-c-text-1);
}

.mode-showcase__selector button:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.mode-showcase__indicator {
  position: absolute;
  inset: 3px auto 3px 3px;
  width: calc((100% - 6px) / 3);
  pointer-events: none;
}

.mode-showcase__indicator--initial {
  transform: translateX(100%);
}

.mode-showcase__indicator span {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  background: color-mix(in srgb, var(--vp-c-text-1) 10%, transparent);
  box-shadow: 0 1px 2px rgb(0 0 0 / 20%);
}

.mode-showcase__graph {
  grid-column: 2;
  grid-row: 1 / span 2;
  align-self: stretch;
  min-height: 132px;
}

.mode-showcase__graph svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.mode-showcase__baseline {
  fill: none;
  stroke: var(--vp-c-divider);
  stroke-width: 1;
  stroke-dasharray: 2 5;
}

.mode-showcase__path {
  fill: none;
  stroke: var(--vp-c-brand-1);
  stroke-width: 3;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
  filter: drop-shadow(0 5px 8px color-mix(in srgb, var(--vp-c-brand-1) 20%, transparent));
}

.mode-showcase__caption {
  grid-column: 1 / -1;
  margin: 0 !important;
  color: var(--vp-c-text-3) !important;
  font-size: 12px;
  line-height: 1.45 !important;
}

@media (max-width: 767px) {
  .mode-showcase {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }

  .mode-showcase__copy,
  .mode-showcase__selector,
  .mode-showcase__graph,
  .mode-showcase__caption {
    grid-column: 1;
    grid-row: auto;
  }

  .mode-showcase__graph {
    min-height: 112px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mode-showcase__indicator,
  .mode-showcase__indicator span,
  .mode-showcase__path {
    transition: none !important;
  }
}
</style>
