<script setup lang="ts">
import { computed, ref } from 'vue'
import HeroCanvas, { type HeroMode } from './HeroCanvas.vue'

interface HeroAction {
  theme?: string
  text: string
  link: string
}

interface ModeOption {
  id: HeroMode
  label: string
  note: string
}

const props = defineProps<{
  eyebrow: string
  titleLead: string
  titleAccent: string
  text: string
  actions: HeroAction[]
  modesLabel: string
  modes: ModeOption[]
}>()

const activeMode = ref<HeroMode>('balanced')

const activeNote = computed(
  () => props.modes.find((mode) => mode.id === activeMode.value)?.note ?? '',
)

function selectMode(id: HeroMode): void {
  activeMode.value = id
}
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <HeroCanvas :mode="activeMode" />
    <div class="hero__scrim" aria-hidden="true"></div>

    <div class="hero__inner">
      <div class="hero__copy">
        <p class="hero__eyebrow">{{ props.eyebrow }}</p>
        <h1 id="hero-title" class="hero__title">
          <span class="hero__title-line">{{ props.titleLead }}</span>
          <span class="hero__title-line hero__title-line--accent">{{ props.titleAccent }}</span>
        </h1>
        <p class="hero__statement">{{ props.text }}</p>
        <div class="hero__actions">
          <a
            v-for="action in props.actions"
            :key="action.link"
            class="sc-button"
            :class="{ 'sc-button--ghost': action.theme !== 'brand' }"
            :href="action.link"
          >
            {{ action.text }}
          </a>
        </div>
      </div>
    </div>

    <div class="hero__deck">
      <span class="hero__deck-label">{{ props.modesLabel }}</span>
      <div class="hero__deck-modes" role="group" :aria-label="props.modesLabel">
        <button
          v-for="mode in props.modes"
          :key="mode.id"
          type="button"
          class="hero__mode"
          :class="{ 'hero__mode--active': mode.id === activeMode }"
          :aria-pressed="mode.id === activeMode"
          @click="selectMode(mode.id)"
        >
          {{ mode.label }}
        </button>
      </div>
      <p :key="activeMode" class="hero__deck-note" aria-live="polite">{{ activeNote }}</p>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - var(--vp-nav-height, 64px));
  overflow: clip;
  background: var(--sc-bg);
}

.hero__scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(to right, rgb(10 12 11 / 72%) 0%, rgb(10 12 11 / 28%) 52%, transparent 78%),
    linear-gradient(to top, rgb(10 12 11 / 88%) 0%, transparent 30%);
}

.hero__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  align-items: center;
  width: min(100% - 48px, 1440px);
  margin-inline: auto;
  padding-block: 56px 120px;
}

.hero__copy {
  max-width: 880px;
}

.hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 14px;
  color: var(--sc-accent);
  font-family: var(--site-font-mono);
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.hero__eyebrow::before {
  content: '';
  flex: none;
  width: 34px;
  height: 1px;
  background: var(--sc-accent);
}

.hero__title {
  display: flex;
  flex-direction: column;
  margin-top: 26px;
  font-size: clamp(58px, 10.6vw, 168px);
  font-weight: 680;
  line-height: 0.92;
  letter-spacing: -0.03em;
  text-transform: uppercase;
}

.hero__title-line {
  display: block;
  color: var(--sc-ink);
}

.hero__title-line--accent {
  color: var(--sc-accent);
}

@supports ((-webkit-text-stroke: 1px black)) {
  .hero__title-line--accent {
    color: transparent;
    -webkit-text-stroke: 2px var(--sc-accent);
  }
}

.hero__statement {
  max-width: 24em;
  margin-top: 30px;
  color: var(--sc-ink-dim);
  font-size: clamp(16px, 1.5vw, 20px);
  line-height: 1.55;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 40px;
}

/* --- Mode deck --- */

.hero__deck {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: clamp(16px, 2.4vw, 32px);
  padding: 18px clamp(20px, 3.4vw, 48px);
  border-top: 1px solid var(--sc-line);
  background: rgb(10 12 11 / 62%);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.hero__deck-label {
  flex: none;
  color: var(--sc-ink-faint);
  font-family: var(--site-font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero__deck-modes {
  display: flex;
  flex: none;
  gap: 6px;
}

.hero__mode {
  padding: 9px 18px;
  border: 0;
  background: transparent;
  box-shadow: inset 0 0 0 1px var(--sc-line);
  color: var(--sc-ink-dim);
  clip-path: polygon(
    0 0,
    calc(100% - 10px) 0,
    100% 10px,
    100% 100%,
    0 100%
  );
  font-family: var(--site-font-mono);
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.1em;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color var(--site-duration-ui) var(--sc-ease-out),
    box-shadow var(--site-duration-ui) var(--sc-ease-out),
    color var(--site-duration-ui) var(--sc-ease-out),
    transform var(--site-duration-micro) var(--sc-ease-out);
}

.hero__mode:active {
  transform: scale(0.96);
}

.hero__mode:focus-visible {
  outline: 2px solid var(--sc-accent-hi);
  outline-offset: 3px;
}

.hero__mode--active {
  background: var(--sc-accent);
  box-shadow: inset 0 0 0 1px var(--sc-accent);
  color: var(--sc-accent-ink);
}

@media (hover: hover) and (pointer: fine) {
  .hero__mode:not(.hero__mode--active):hover {
    box-shadow: inset 0 0 0 1px rgb(45 212 191 / 45%);
    color: var(--sc-accent-hi);
  }
}

.hero__deck-note {
  min-width: 0;
  margin-left: auto;
  overflow: hidden;
  color: var(--sc-ink-dim);
  font-size: 13.5px;
  line-height: 1.5;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
  animation: hero-note-in 320ms var(--sc-ease-out) both;
}

@keyframes hero-note-in {
  from {
    opacity: 0;
    transform: translate3d(0, 6px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

/* --- Entry choreography (skipped under reduced motion) --- */

@media (prefers-reduced-motion: no-preference) {
  .hero__scrim {
    animation: hero-fade 1400ms var(--sc-ease-out) both;
  }

  .hero__eyebrow {
    animation: hero-rise 700ms var(--sc-ease-out) 120ms both;
  }

  .hero__title-line {
    clip-path: inset(0 0 100% 0);
    animation: hero-line-reveal 900ms var(--sc-ease-out) both;
  }

  .hero__title-line:first-child {
    animation-delay: 220ms;
  }

  .hero__title-line--accent {
    animation-delay: 340ms;
  }

  .hero__statement {
    animation: hero-rise 700ms var(--sc-ease-out) 480ms both;
  }

  .hero__actions {
    animation: hero-rise 700ms var(--sc-ease-out) 580ms both;
  }

  .hero__deck {
    animation: hero-rise 800ms var(--sc-ease-out) 700ms both;
  }
}

@keyframes hero-fade {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translate3d(0, 18px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes hero-line-reveal {
  from {
    clip-path: inset(0 0 100% 0);
    transform: translate3d(0, 0.18em, 0);
  }

  to {
    clip-path: inset(0 0 -12% 0);
    transform: translate3d(0, 0, 0);
  }
}

/* --- Responsive --- */

@media (max-width: 959px) {
  .hero__deck {
    flex-wrap: wrap;
    row-gap: 12px;
  }

  .hero__deck-note {
    flex-basis: 100%;
    margin-left: 0;
    text-align: left;
    white-space: normal;
  }
}

@media (max-width: 767px) {
  .hero {
    min-height: 0;
  }

  .hero__inner {
    width: calc(100% - 40px);
    padding-block: 72px 88px;
  }

  .hero__title {
    font-size: clamp(52px, 14.5vw, 96px);
  }

  .hero__deck-modes {
    flex-wrap: wrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__deck-note {
    animation: none;
  }
}
</style>
