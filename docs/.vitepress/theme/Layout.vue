<script setup lang="ts">
/**
 * Wraps the default theme layout.
 *
 * Everything custom is injected through the default theme's public slots, so no
 * VitePress internal component is overridden and theme updates stay drop-in.
 */
import { computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import AmbientAurora from './components/AmbientAurora.vue'
import HeroVisual from './components/HeroVisual.vue'
import ScrollProgress from './components/ScrollProgress.vue'
import { usePageMotion } from './motion/usePageMotion'

const { Layout } = DefaultTheme
const { frontmatter, page } = useData()
const isHome = computed(() => frontmatter.value.layout === 'home')
const showProgress = computed(() => !isHome.value && !page.value.isNotFound)

usePageMotion()
</script>

<template>
  <Layout>
    <template #layout-top>
      <ScrollProgress :active="showProgress" />
    </template>
    <template #home-hero-before>
      <AmbientAurora v-if="isHome" />
    </template>
    <template #home-hero-image>
      <HeroVisual v-if="isHome" />
    </template>
  </Layout>
</template>
