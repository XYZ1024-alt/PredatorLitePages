<script setup lang="ts">
/**
 * Replaces the default theme hero.
 *
 * Rendered through the `home-hero-before` slot while home.css hides the
 * default `.VPHero .container`, so no internal component is forked: the
 * default hero simply has nothing visible left to render. Copy still comes
 * from the `hero` frontmatter block, so both locales keep editing markdown.
 */
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import HeroVisual from './HeroVisual.vue'

interface HeroAction {
  theme?: string
  text: string
  link: string
}

const { frontmatter } = useData()
const hero = computed(() => frontmatter.value.hero ?? {})
const actions = computed<HeroAction[]>(() => hero.value.actions ?? [])

function resolveLink(link: string): string {
  return link.startsWith('/') ? withBase(link) : link
}
</script>

<template>
  <div class="home-hero">
    <div class="home-hero__copy">
      <p v-if="hero.name" class="home-hero__name">{{ hero.name }}</p>
      <h1 v-if="hero.text" class="home-hero__title">{{ hero.text }}</h1>
      <p v-if="hero.tagline" class="home-hero__tagline">{{ hero.tagline }}</p>
      <div v-if="actions.length > 0" class="home-hero__actions">
        <a
          v-for="action in actions"
          :key="action.link"
          class="home-hero__action"
          :class="action.theme === 'brand' ? 'home-hero__action--brand' : 'home-hero__action--alt'"
          :href="resolveLink(action.link)"
        >
          {{ action.text }}
        </a>
      </div>
    </div>
    <div class="home-hero__visual">
      <HeroVisual />
    </div>
  </div>
</template>
