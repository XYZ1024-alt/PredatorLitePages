<script setup lang="ts">
/**
 * Pinned horizontal gallery: vertical scroll pans the panel track sideways
 * (GSAP ScrollTrigger, canonical start "top top" + pin + scrub). Shows the
 * five product screens at large scale.
 *
 * Fallbacks: below 960px, or under prefers-reduced-motion, or if the motion
 * chunk fails, the track becomes a regular horizontal scroll-snap row.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { loadGsap } from '../motion/gsap'

export interface GalleryPanel {
  title: string
  body: string
  image: string
  alt: string
}

const props = defineProps<{
  title: string
  description: string
  panels: GalleryPanel[]
}>()

const root = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
let revert: (() => void) | null = null
let disposed = false

onMounted(async () => {
  const loading = loadGsap()

  try {
    const bundle = await loading
    if (disposed || !root.value || !track.value || !bundle) return

    const { gsap } = bundle
    const context = gsap.context(() => {
      const media = gsap.matchMedia()
      media.add('(min-width: 960px) and (prefers-reduced-motion: no-preference)', () => {
        if (!root.value || !track.value) return

        const distance = () =>
          Math.max(0, track.value!.scrollWidth - document.documentElement.clientWidth)

        gsap.to(track.value, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.value,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
      })

      revert = () => media.revert()
    }, root.value)

    const previousRevert = revert
    revert = () => {
      previousRevert?.()
      context.revert()
    }
  } catch {
    /* The static scroll-snap row remains fully usable. */
  }
})

onUnmounted(() => {
  disposed = true
  revert?.()
})
</script>

<template>
  <section id="capabilities" ref="root" class="hgal" :aria-label="props.title">
    <div class="hgal__pin">
      <header class="hgal__head sc-shell">
        <h2 class="hgal__title">{{ props.title }}</h2>
        <p class="hgal__description">{{ props.description }}</p>
      </header>

      <div ref="track" class="hgal__track">
        <article v-for="panel in props.panels" :key="panel.title" class="hgal__panel">
          <figure class="hgal__figure">
            <img
              :src="panel.image"
              :alt="panel.alt"
              width="1600"
              height="900"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <h3 class="hgal__panel-title">{{ panel.title }}</h3>
          <p class="hgal__panel-body">{{ panel.body }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hgal {
  position: relative;
  overflow: clip;
  border-block: 1px solid var(--sc-line);
  background: var(--sc-bg-deep);
}

.hgal__pin {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(36px, 6vh, 72px);
  min-height: 100dvh;
  padding-block: 56px;
}

.hgal__title {
  font-size: clamp(30px, 3.6vw, 56px);
  font-weight: 620;
  line-height: 1.05;
  letter-spacing: -0.02em;
}

.hgal__description {
  max-width: 46ch;
  margin-top: 16px;
  color: var(--sc-ink-dim);
  font-size: 16px;
  line-height: 1.6;
}

.hgal__track {
  display: flex;
  align-items: stretch;
  gap: clamp(28px, 4vw, 64px);
  width: max-content;
  padding-inline: max(24px, calc((100vw - 1440px) / 2 + 24px));
  will-change: transform;
}

.hgal__panel {
  width: min(62vw, 860px);
  flex: none;
}

.hgal__figure {
  overflow: clip;
  border: 1px solid var(--sc-line);
  background: var(--sc-bg-raise);
  clip-path: polygon(
    0 0,
    calc(100% - 18px) 0,
    100% 18px,
    100% 100%,
    0 100%
  );
}

.hgal__figure img {
  width: 100%;
  height: auto;
}

.hgal__panel-title {
  margin-top: 22px;
  font-size: 19px;
  font-weight: 620;
  letter-spacing: -0.01em;
}

.hgal__panel-body {
  max-width: 52ch;
  margin-top: 8px;
  color: var(--sc-ink-dim);
  font-size: 14.5px;
  line-height: 1.6;
}

@media (max-width: 959px), (prefers-reduced-motion: reduce) {
  .hgal__pin {
    min-height: 0;
    padding-block: clamp(72px, 12vh, 120px);
  }

  .hgal__track {
    width: auto;
    overflow-x: auto;
    padding-bottom: 16px;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    will-change: auto;
  }

  .hgal__track::-webkit-scrollbar {
    display: none;
  }

  .hgal__panel {
    width: min(84vw, 560px);
    scroll-snap-align: start;
  }
}
</style>
