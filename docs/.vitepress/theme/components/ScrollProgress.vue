<script setup lang="ts">
defineProps<{ active: boolean }>()
</script>

<template>
  <div class="scroll-progress" :class="{ 'scroll-progress--active': active }" aria-hidden="true">
    <span class="scroll-progress__bar" />
  </div>
</template>

<style scoped>
.scroll-progress {
  position: fixed;
  top: calc(var(--vp-nav-height) - 2px);
  right: 0;
  left: 0;
  z-index: 50;
  height: 2px;
  overflow: hidden;
  pointer-events: none;
  opacity: 0;
}

.scroll-progress--active {
  opacity: 1;
}

.scroll-progress__bar {
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, var(--vp-c-brand-1), #38bfa8, var(--vp-c-brand-2));
  transform: scaleX(0);
  transform-origin: left center;
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .scroll-progress {
    display: none;
  }
}
</style>
