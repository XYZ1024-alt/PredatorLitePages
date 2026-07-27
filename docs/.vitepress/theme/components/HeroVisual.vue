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
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(100%, 360px);
  aspect-ratio: 45 / 64;
  transform: translate(-50%, -50%);
  perspective: 1000px;
  will-change: opacity, transform;
}

.hero-visual__frame {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  box-shadow: 0 24px 64px rgb(25 33 38 / 18%);
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
  background: linear-gradient(112deg, transparent 38%, rgb(255 255 255 / 0.32) 50%, transparent 62%);
  transform: translateX(-65%);
}

:global(.dark .hero-visual__frame) {
  border-color: rgb(255 255 255 / 9%);
  box-shadow: 0 28px 72px rgb(0 0 0 / 38%);
}

@media (min-width: 960px) {
  .hero-visual {
    top: calc(50% + 64px);
  }
}

@media (max-width: 959px) {
  .hero-visual {
    width: min(100%, 300px);
  }
}

@media (max-width: 767px) {
  .hero-visual {
    width: 170px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-visual,
  .hero-visual__frame,
  .hero-visual__shine {
    transform: none !important;
    will-change: auto;
  }

  .hero-visual {
    transform: translate(-50%, -50%) !important;
  }
}
</style>
