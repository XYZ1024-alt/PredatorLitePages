<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { loadGsap } from '../motion/gsap'

export interface WalkthroughStep {
  title: string
  body: string
  image?: string
  focus: 'modes' | 'thermal' | 'power' | 'lighting' | 'monitoring' | 'display' | 'settings'
}

const props = defineProps<{
  title: string
  description: string
  image: string
  imageAlt: string
  steps: WalkthroughStep[]
}>()

const root = ref<HTMLElement | null>(null)
const intro = ref<HTMLElement | null>(null)
const imageSrc = computed(() => resolveImage(props.image))
let disposed = false
let revert: (() => void) | null = null

function resolveImage(src: string): string {
  return src
}

onMounted(async () => {
  const loading = loadGsap()
  if (!loading) return

  try {
    const { gsap } = await loading
    if (disposed || !root.value || !intro.value) return

    const context = gsap.context(() => {
      const media = gsap.matchMedia()
      media.add(
        '(min-width: 960px) and (prefers-reduced-motion: no-preference)',
        () => {
          if (!root.value || !intro.value) return

          const figures = gsap.utils.toArray<HTMLElement>('.product-walkthrough__figure')
          for (const figure of figures) {
            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: figure,
                start: 'top 88%',
                end: 'bottom 12%',
                scrub: 0.8,
              },
            })

            timeline
              .fromTo(
                figure,
                { opacity: 0.26, transform: 'scale(0.92)' },
                { opacity: 1, transform: 'scale(1)', duration: 0.46, ease: 'none' },
              )
              .to(
                figure,
                { opacity: 0.2, transform: 'scale(0.96)', duration: 0.54, ease: 'none' },
              )
          }
        },
      )

      revert = () => media.revert()
    }, root.value)

    const previousRevert = revert
    revert = () => {
      previousRevert?.()
      context.revert()
    }
  } catch {
    // The complete static walkthrough remains visible if the motion chunk fails.
  }
})

onUnmounted(() => {
  disposed = true
  revert?.()
})
</script>

<template>
  <section id="product-walkthrough" ref="root" class="product-walkthrough">
    <div class="product-walkthrough__shell">
      <header ref="intro" class="product-walkthrough__intro">
        <h2>{{ props.title }}</h2>
        <p>{{ props.description }}</p>
        <img
          class="product-walkthrough__full-image"
          :src="imageSrc"
          :alt="props.imageAlt"
          width="1672"
          height="941"
          loading="lazy"
          decoding="async"
        />
      </header>

      <div class="product-walkthrough__gallery">
        <article v-for="step in props.steps" :key="step.title" class="product-walkthrough__step">
          <figure class="product-walkthrough__figure">
            <img
              :class="`product-walkthrough__crop--${step.focus}`"
              :src="resolveImage(step.image ?? props.image)"
              alt=""
              width="1672"
              height="941"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <h3>{{ step.title }}</h3>
          <p>{{ step.body }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.product-walkthrough {
  padding: 160px 0;
  border-top: 1px solid var(--vp-c-divider);
  scroll-margin-top: calc(var(--vp-nav-height) + 24px);
}

.product-walkthrough__shell {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 24px;
  width: min(100% - 48px, 1360px);
  margin: 0 auto;
}

.product-walkthrough__intro {
  position: sticky;
  top: 0;
  grid-column: 1 / span 5;
  align-self: start;
  padding-top: calc(var(--vp-nav-height) + 32px);
}

.product-walkthrough__intro h2 {
  max-width: 9ch;
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 52px;
  font-weight: 620;
  line-height: 1.02;
  letter-spacing: 0;
}

.product-walkthrough__intro p {
  max-width: 40ch;
  margin: 22px 0 0;
  color: var(--vp-c-text-2);
  font-size: 17px;
  line-height: 1.7;
}

.product-walkthrough__full-image {
  display: block;
  width: 260px;
  height: auto;
  margin-top: 36px;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--site-radius);
  box-shadow: var(--site-media-shadow);
}

.product-walkthrough__gallery {
  grid-column: 7 / -1;
}

.product-walkthrough__step {
  margin-bottom: 96px;
}

.product-walkthrough__step:last-child {
  margin-bottom: 0;
}

.product-walkthrough__figure {
  width: min(100%, 560px);
  margin: 0 0 0 auto;
  transform-origin: center center;
  will-change: transform, opacity;
}

.product-walkthrough__figure img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--site-radius);
  box-shadow: var(--site-media-shadow);
}

.product-walkthrough__step h3 {
  width: min(100%, 560px);
  margin: 24px 0 0 auto;
  color: var(--vp-c-text-1);
  font-size: 24px;
  font-weight: 620;
  line-height: 1.2;
  letter-spacing: 0;
}

.product-walkthrough__step p {
  width: min(100%, 560px);
  max-width: 48ch;
  margin: 12px 0 0 auto;
  color: var(--vp-c-text-2);
  font-size: 16px;
  line-height: 1.7;
}

@media (max-width: 959px) {
  .product-walkthrough {
    padding: 112px 0;
  }

  .product-walkthrough__shell {
    grid-template-columns: minmax(0, 1fr);
  }

  .product-walkthrough__intro,
  .product-walkthrough__gallery {
    grid-column: 1;
  }

  .product-walkthrough__intro {
    position: static;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0 32px;
    padding-top: 0;
  }

  .product-walkthrough__intro h2,
  .product-walkthrough__intro p {
    grid-column: 1;
  }

  .product-walkthrough__full-image {
    grid-column: 2;
    grid-row: 1 / span 2;
    width: 240px;
    margin-top: 0;
  }

  .product-walkthrough__gallery {
    margin-top: 72px;
  }

  .product-walkthrough__step {
    margin-bottom: 88px;
  }
}

@media (max-width: 767px) {
  .product-walkthrough {
    padding: 80px 0;
  }

  .product-walkthrough__shell {
    width: 100%;
    padding: 0 20px;
  }

  .product-walkthrough__intro {
    display: block;
  }

  .product-walkthrough__intro h2 {
    font-size: 38px;
  }

  .product-walkthrough__full-image {
    width: min(100%, 320px);
    margin-top: 30px;
  }

  .product-walkthrough__gallery {
    margin-top: 56px;
  }

  .product-walkthrough__step {
    margin-bottom: 64px;
  }

  .product-walkthrough__figure {
    width: 100%;
    margin-left: 0;
    opacity: 1 !important;
    transform: none !important;
    will-change: auto;
  }

  .product-walkthrough__step h3,
  .product-walkthrough__step p {
    width: 100%;
    margin-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .product-walkthrough__figure {
    opacity: 1 !important;
    transform: none !important;
    will-change: auto;
  }
}
</style>
