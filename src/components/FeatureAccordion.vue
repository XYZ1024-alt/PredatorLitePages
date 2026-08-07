<script setup lang="ts">
import { ref } from 'vue'

export interface FeatureAccordionItem {
  title: string
  body: string
  image?: string
  focus?: string
}

const props = defineProps<{
  items: FeatureAccordionItem[]
  image?: string
  ariaLabel: string
}>()

const active = ref(0)
const instant = ref(false)

function resolveImage(source?: string): string {
  return source ?? props.image ?? '/img/screens/main.svg'
}

function select(index: number, event: MouseEvent): void {
  instant.value = event.detail === 0
  active.value = index
  if (instant.value) requestAnimationFrame(() => { instant.value = false })
}

function preview(index: number): void {
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    active.value = index
  }
}
</script>

<template>
  <div
    class="feature-accordion"
    :class="{ 'is-instant': instant }"
    role="group"
    :aria-label="props.ariaLabel"
  >
    <div class="feature-accordion__media" aria-hidden="true">
      <img
        v-for="(item, index) in props.items"
        :key="`${item.title}-image`"
        class="feature-accordion__image"
        :class="{ 'is-active': active === index }"
        :src="resolveImage(item.image)"
        alt=""
        width="1672"
        height="941"
        loading="lazy"
        decoding="async"
      />
    </div>

    <div class="feature-accordion__list">
      <article
        v-for="(item, index) in props.items"
        :key="item.title"
        class="feature-accordion__item"
        :class="{ 'is-active': active === index }"
        @pointerenter="preview(index)"
      >
        <button
          :id="`feature-trigger-${index}`"
          type="button"
          :aria-expanded="active === index"
          :aria-controls="`feature-panel-${index}`"
          @click="select(index, $event)"
        >
          <span class="feature-accordion__title">{{ item.title }}</span>
          <span class="feature-accordion__symbol" aria-hidden="true">
            {{ active === index ? '−' : '+' }}
          </span>
        </button>
        <div
          :id="`feature-panel-${index}`"
          class="feature-accordion__panel"
          role="region"
          :aria-labelledby="`feature-trigger-${index}`"
          :hidden="active !== index"
        >
          <p class="feature-accordion__body">{{ item.body }}</p>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.feature-accordion {
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(0, 1.1fr);
  min-height: 560px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--site-radius);
  background: var(--vp-c-bg-elv);
}

.feature-accordion__media {
  display: grid;
  place-items: center;
  min-width: 0;
  padding: 34px;
  overflow: hidden;
  border-right: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.feature-accordion__image {
  grid-area: 1 / 1;
  display: block;
  width: min(100%, 480px);
  height: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--site-radius);
  box-shadow: var(--site-media-shadow);
  opacity: 0;
  pointer-events: none;
  transform: translate3d(14px, 0, 0) scale(0.98);
  transition:
    opacity 180ms var(--site-ease-out),
    transform 240ms var(--site-ease-out);
}

.feature-accordion__image.is-active {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
}

.feature-accordion__list {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.feature-accordion__item {
  border-bottom: 1px solid var(--vp-c-divider);
}

.feature-accordion__item:last-child {
  border-bottom: 0;
}

.feature-accordion button {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 20px;
  width: 100%;
  min-height: 96px;
  padding: 24px 28px;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-1);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background-color var(--site-duration-micro) var(--site-ease-out),
    transform var(--site-duration-micro) var(--site-ease-out);
}

.feature-accordion__item.is-active .feature-accordion__title {
  color: var(--vp-c-brand-1);
}

.feature-accordion__item.is-active .feature-accordion__symbol {
  color: var(--site-accent);
}

.feature-accordion__title {
  font-size: 21px;
  font-weight: 620;
  line-height: 1.2;
  letter-spacing: 0;
  transition: color var(--site-duration-micro) var(--site-ease-out);
}

.feature-accordion__symbol {
  font-family: var(--vp-font-family-mono);
  font-size: 18px;
  font-weight: 450;
  line-height: 1;
}

.feature-accordion__panel {
  padding: 0 56px 28px 28px;
}

.feature-accordion__body {
  max-width: 42ch;
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 15px;
  line-height: 1.65;
}

.feature-accordion button:active {
  transform: scale(0.99);
}

.feature-accordion button:focus-visible {
  outline: 2px solid var(--site-focus);
  outline-offset: -4px;
}

.feature-accordion.is-instant .feature-accordion__image {
  transition-duration: 0ms;
}

@media (hover: hover) and (pointer: fine) {
  .feature-accordion button:hover {
    background: var(--vp-c-default-soft);
  }
}

@media (max-width: 767px) {
  .feature-accordion {
    grid-template-columns: minmax(0, 1fr);
    min-height: 0;
  }

  .feature-accordion__media {
    min-height: 340px;
    padding: 28px 20px;
    border-right: 0;
    border-bottom: 1px solid var(--vp-c-divider);
  }

  .feature-accordion__image {
    width: min(100%, 500px);
  }

  .feature-accordion button {
    min-height: 72px;
    padding: 19px 20px;
  }

  .feature-accordion__title {
    font-size: 19px;
  }

  .feature-accordion__panel {
    padding: 0 44px 22px 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .feature-accordion__image {
    transform: none;
    transition: opacity 150ms ease;
  }

  .feature-accordion button:active {
    transform: none;
  }
}
</style>
