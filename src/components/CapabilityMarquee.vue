<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  items: string[]
  ariaLabel: string
  pauseLabel: string
  playLabel: string
}>()

const root = ref<HTMLElement | null>(null)
const running = ref(false)
const userPaused = ref(false)
let visible = false
let observer: IntersectionObserver | null = null

function syncPlayback(): void {
  running.value = visible && !document.hidden && !userPaused.value
}

function togglePlayback(): void {
  userPaused.value = !userPaused.value
  syncPlayback()
}

function onVisibilityChange(): void {
  syncPlayback()
}

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? false
      syncPlayback()
    },
    { rootMargin: '120px 0px' },
  )

  if (root.value) observer.observe(root.value)
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  observer?.disconnect()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <section ref="root" class="capability-marquee" :aria-label="props.ariaLabel">
    <div class="capability-marquee__viewport">
      <div class="capability-marquee__track" :class="{ 'is-running': running }">
        <ul
          v-for="copy in 2"
          :key="copy"
          class="capability-marquee__group"
          :aria-hidden="copy === 2 ? 'true' : undefined"
        >
          <li v-for="item in props.items" :key="`${copy}-${item}`">{{ item }}</li>
        </ul>
      </div>
    </div>
    <button
      class="capability-marquee__control"
      type="button"
      :aria-label="userPaused ? props.playLabel : props.pauseLabel"
      :title="userPaused ? props.playLabel : props.pauseLabel"
      :aria-pressed="userPaused"
      @click="togglePlayback"
    >
      <span aria-hidden="true">{{ userPaused ? '▶' : 'Ⅱ' }}</span>
    </button>
  </section>
</template>

<style scoped>
.capability-marquee {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 56px;
  overflow: hidden;
  border-block: 1px solid var(--vp-c-divider);
}

.capability-marquee__viewport {
  width: 100%;
  overflow: hidden;
}

.capability-marquee__track {
  display: flex;
  width: max-content;
  transform: translate3d(0, 0, 0);
  animation: marquee-shift 34s linear infinite;
  animation-play-state: paused;
  will-change: transform;
}

.capability-marquee__track.is-running {
  animation-play-state: running;
}

.capability-marquee__group {
  display: flex;
  align-items: center;
  gap: 48px;
  margin: 0;
  padding: 23px 48px 23px 0;
  list-style: none;
}

.capability-marquee__group li {
  display: flex;
  align-items: center;
  gap: 48px;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  font-weight: 520;
  line-height: 1;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.capability-marquee__group li::after {
  content: '/';
  color: var(--site-accent);
  font-weight: 450;
}

.capability-marquee__control {
  display: grid;
  place-items: center;
  width: 56px;
  min-height: 58px;
  border: 0;
  border-left: 1px solid var(--vp-c-divider);
  border-radius: 0;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition:
    background-color var(--site-duration-micro) var(--site-ease-out),
    transform var(--site-duration-micro) var(--site-ease-out);
}

.capability-marquee__control span {
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  line-height: 1;
}

.capability-marquee__control:active {
  transform: scale(0.97);
}

.capability-marquee__control:focus-visible {
  outline: 2px solid var(--site-focus);
  outline-offset: -4px;
}

@media (hover: hover) and (pointer: fine) {
  .capability-marquee__control:hover {
    background: var(--site-accent-soft);
    color: var(--site-accent);
  }
}

@keyframes marquee-shift {
  to {
    transform: translate3d(-50%, 0, 0);
  }
}

@media (max-width: 767px) {
  .capability-marquee__group {
    gap: 32px;
    padding-right: 32px;
  }

  .capability-marquee__group li {
    gap: 32px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .capability-marquee {
    grid-template-columns: minmax(0, 1fr);
  }

  .capability-marquee__track {
    width: 100%;
    animation: none;
    will-change: auto;
  }

  .capability-marquee__group {
    flex-wrap: wrap;
    width: 100%;
    padding: 20px;
  }

  .capability-marquee__group[aria-hidden='true'],
  .capability-marquee__control {
    display: none;
  }
}
</style>
