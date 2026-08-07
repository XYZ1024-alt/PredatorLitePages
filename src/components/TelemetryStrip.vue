<script setup lang="ts">
/**
 * Telemetry strip: mono readouts that count up once when scrolled into view
 * (feedback: signals "live device data"). Values are illustrative samples and
 * labeled as such on the page. Reduced motion renders final values instantly.
 */
import { onMounted, onUnmounted, ref } from 'vue'

export interface TelemetryItem {
  label: string
  value: number
  unit: string
  note: string
}

const props = defineProps<{
  items: TelemetryItem[]
  caption: string
}>()

const root = ref<HTMLElement | null>(null)
const display = ref<number[]>(props.items.map(() => 0))
let observer: IntersectionObserver | null = null
let raf = 0

function setFinal(): void {
  display.value = props.items.map((item) => item.value)
}

function animate(): void {
  const duration = 1400
  const start = performance.now()

  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration)
    const eased = 1 - Math.pow(1 - t, 4)
    display.value = props.items.map((item) => Math.round(item.value * eased))
    if (t < 1) raf = requestAnimationFrame(tick)
  }

  raf = requestAnimationFrame(tick)
}

function format(value: number): string {
  return value.toLocaleString('en-US')
}

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce || !root.value) {
    setFinal()
    return
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        animate()
        observer?.disconnect()
        observer = null
      }
    },
    { threshold: 0.4 },
  )
  observer.observe(root.value)
})

onUnmounted(() => {
  observer?.disconnect()
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <section ref="root" class="sc-telemetry" aria-label="PredatorLite">
    <div class="sc-shell">
      <dl class="sc-telemetry__grid">
        <div v-for="(item, i) in props.items" :key="item.label" class="sc-telemetry__cell">
          <dt class="sc-telemetry__label">{{ item.label }}</dt>
          <dd class="sc-telemetry__value">
            <span>{{ format(display[i] ?? 0) }}</span>
            <span class="sc-telemetry__unit">{{ item.unit }}</span>
          </dd>
          <dd class="sc-telemetry__note">{{ item.note }}</dd>
        </div>
      </dl>
      <p class="sc-telemetry__caption">{{ props.caption }}</p>
    </div>
  </section>
</template>

<style scoped>
.sc-telemetry__grid {
  margin: 0;
  padding: 0;
}

.sc-telemetry__grid dd {
  margin: 0;
}

.sc-telemetry__caption {
  padding: 0 clamp(20px, 3vw, 44px) 20px;
  color: var(--sc-ink-faint);
  font-family: var(--site-font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-align: right;
  text-transform: uppercase;
}
</style>
