<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { loadGsap } from '../motion/gsap'
import { onPointer } from '../motion/pointer'
import { TILT_MAX } from '../motion/tokens'

const { frontmatter } = useData()
const frame = ref<HTMLElement | null>(null)
let disposed = false
let revert: (() => void) | null = null

const image = computed(() => {
  const value = frontmatter.value.hero?.image
  if (typeof value === 'string') return { src: value, alt: '' }
  return {
    src: value?.src ?? '/img/main.png',
    alt: value?.alt ?? '',
  }
})

const imageSrc = computed(() => {
  const src = image.value.src
  return typeof src === 'string' && src.startsWith('/') ? withBase(src) : src
})

onMounted(async () => {
  const loading = loadGsap()
  if (!loading) return

  try {
    const { gsap } = await loading
    if (disposed || !frame.value) return

    gsap.set(frame.value, { transformPerspective: 1000, transformStyle: 'preserve-3d' })
    const mm = gsap.matchMedia()
    mm.add(
      '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
      () => {
        if (!frame.value) return
        const rotateX = gsap.quickTo(frame.value, 'rotateX', { duration: 0.6, ease: 'power3.out' })
        const rotateY = gsap.quickTo(frame.value, 'rotateY', { duration: 0.6, ease: 'power3.out' })
        return onPointer(({ x, y }) => {
          rotateX(-y * TILT_MAX)
          rotateY(x * TILT_MAX)
        })
      },
    )
    revert = () => mm.revert()
  } catch {
    // The screenshot is useful without motion and remains rendered on failure.
  }
})

onUnmounted(() => {
  disposed = true
  revert?.()
})
</script>

<template>
  <div class="hero-visual">
    <div ref="frame" class="hero-visual__frame">
      <img class="hero-visual__image" :src="imageSrc" :alt="image.alt" width="720" height="1024" />
      <span class="hero-visual__shine" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
.hero-visual {
  position: relative;
  width: min(100%, 340px);
  aspect-ratio: 45 / 64;
  margin-inline: auto;
  perspective: 1000px;
  will-change: opacity, transform;
}

/* Accent halo behind the frame; intensity is a design token. */
.hero-visual::before {
  position: absolute;
  inset: -12% -18%;
  background: radial-gradient(
    ellipse 62% 54% at 50% 46%,
    color-mix(in srgb, var(--vp-c-brand-1) calc(var(--mo-glow-opacity) * 100%), transparent),
    transparent 72%
  );
  content: "";
  pointer-events: none;
}

.hero-visual__frame {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--mo-radius-card);
  background: var(--vp-c-bg-elv);
  box-shadow: var(--mo-surface-shadow-lift);
  transform-origin: center;
  will-change: transform;
}

.hero-visual__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.hero-visual__shine {
  position: absolute;
  inset: -35% -70%;
  pointer-events: none;
  background: linear-gradient(112deg, transparent 38%, rgb(255 255 255 / 0.28) 50%, transparent 62%);
  transform: translateX(-65%);
}

@media (max-width: 959px) {
  .hero-visual {
    width: min(100%, 300px);
  }
}

@media (max-width: 767px) {
  .hero-visual {
    width: 190px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-visual,
  .hero-visual__frame,
  .hero-visual__shine {
    transform: none !important;
    will-change: auto;
  }
}
</style>
