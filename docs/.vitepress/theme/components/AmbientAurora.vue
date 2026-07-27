<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { loadGsap } from '../motion/gsap'
import { onPointer } from '../motion/pointer'

withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const root = ref<HTMLElement | null>(null)
let disposed = false
let revert: (() => void) | null = null

onMounted(async () => {
  const loading = loadGsap()
  if (!loading) return

  try {
    const { gsap } = await loading
    if (disposed || !root.value) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const fields = root.value?.querySelectorAll<HTMLElement>('.ambient-aurora__field')
      if (!fields) return

      gsap.to(fields[0], {
        xPercent: 5,
        yPercent: -4,
        duration: 68,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
      gsap.to(fields[1], {
        xPercent: -6,
        yPercent: 5,
        duration: 84,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    })

    mm.add(
      '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
      () => {
        if (!root.value) return
        const moveX = gsap.quickTo(root.value, 'x', { duration: 0.6, ease: 'power3.out' })
        const moveY = gsap.quickTo(root.value, 'y', { duration: 0.6, ease: 'power3.out' })
        return onPointer(({ x, y }) => {
          moveX(x * 12)
          moveY(y * 10)
        })
      },
    )

    revert = () => mm.revert()
  } catch {
    // Decorative motion fails open; the static ambient field remains visible.
  }
})

onUnmounted(() => {
  disposed = true
  revert?.()
})
</script>

<template>
  <div ref="root" class="ambient-aurora" :class="{ 'ambient-aurora--compact': compact }" aria-hidden="true">
    <span class="ambient-aurora__field ambient-aurora__field--one" />
    <span class="ambient-aurora__field ambient-aurora__field--two" />
  </div>
</template>

<style scoped>
.ambient-aurora {
  position: absolute;
  top: -120px;
  right: 0;
  left: 0;
  z-index: 0;
  height: 820px;
  overflow: clip;
  pointer-events: none;
  opacity: var(--mo-aurora-opacity);
  will-change: transform;
}

.ambient-aurora__field {
  position: absolute;
  inset: -12%;
  background-repeat: no-repeat;
  will-change: transform;
}

.ambient-aurora__field--one {
  background-image:
    radial-gradient(ellipse 78% 58% at 14% 18%, var(--vp-c-brand-1), transparent 72%),
    radial-gradient(ellipse 66% 52% at 86% 44%, #72d7c5, transparent 74%);
}

.ambient-aurora__field--two {
  background-image:
    radial-gradient(ellipse 70% 54% at 58% 4%, #7ea6ff, transparent 72%),
    radial-gradient(ellipse 82% 48% at 38% 78%, var(--vp-c-brand-2), transparent 76%);
  mix-blend-mode: multiply;
}

:global(.dark .ambient-aurora__field--two) {
  mix-blend-mode: screen;
}

.ambient-aurora--compact {
  top: -45%;
  height: 190%;
  opacity: calc(var(--mo-aurora-opacity) * 0.65);
}

@media (max-width: 767px) {
  .ambient-aurora {
    top: -80px;
    height: 660px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-aurora {
    transform: none !important;
    will-change: auto;
  }
}
</style>
