<script setup lang="ts">
/**
 * Scroll-scrubbed manifesto: words light up one by one as the section moves
 * through the viewport (storytelling emphasis). GSAP ScrollTrigger drives the
 * scrub; an IntersectionObserver fallback lights everything if the motion
 * chunk fails. Static full opacity under prefers-reduced-motion (handled in
 * home.css).
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { loadGsap } from '../motion/gsap'

export interface ManifestoWord {
  t: string
  accent?: boolean
}

const props = defineProps<{
  lines: ManifestoWord[][]
}>()

const root = ref<HTMLElement | null>(null)
let revert: (() => void) | null = null
let fallbackObserver: IntersectionObserver | null = null
let disposed = false

function lightAll(): void {
  root.value?.querySelectorAll('.sc-manifesto__word').forEach((el) => {
    el.classList.add('is-lit')
  })
}

onMounted(async () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    lightAll()
    return
  }

  const loading = loadGsap()

  try {
    const bundle = await loading
    if (disposed || !root.value || !bundle) throw new Error('unavailable')

    const { gsap, ScrollTrigger } = bundle
    const words = root.value.querySelectorAll<HTMLElement>('.sc-manifesto__word')

    const tween = gsap.to(words, {
      opacity: 1,
      ease: 'none',
      stagger: 0.35,
      scrollTrigger: {
        trigger: root.value,
        start: 'top 78%',
        end: 'bottom 55%',
        scrub: 0.6,
      },
    })

    revert = () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      ScrollTrigger.refresh()
    }
  } catch {
    if (disposed || !root.value) return
    fallbackObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          lightAll()
          fallbackObserver?.disconnect()
          fallbackObserver = null
        }
      },
      { threshold: 0.35 },
    )
    fallbackObserver.observe(root.value)
  }
})

onUnmounted(() => {
  disposed = true
  revert?.()
  fallbackObserver?.disconnect()
})
</script>

<template>
  <section ref="root" class="sc-manifesto sc-shell" aria-label="PredatorLite">
    <h2 class="sc-manifesto__lines">
      <span v-for="(line, i) in props.lines" :key="i" class="sc-manifesto__line">
        <span
          v-for="(word, j) in line"
          :key="j"
          class="sc-manifesto__word"
          :class="{ 'sc-manifesto__word--accent': word.accent }"
          >{{ word.t }}</span
        >
      </span>
    </h2>
  </section>
</template>
