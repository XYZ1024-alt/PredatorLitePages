import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import ModeShowcase from './components/ModeShowcase.vue'
import { loadGsap } from './motion/gsap'

// Import order is the cascade order: tokens, then chrome, then page styles,
// then the motion states that have to win over all of them.
import './styles/tokens.css'
import './styles/base.css'
import './styles/home.css'
import './styles/motion.css'

export default {
  extends: DefaultTheme,
  Layout,

  enhanceApp({ app }) {
    app.component('ModeShowcase', ModeShowcase)

    // Start fetching the GSAP chunk during app creation rather than waiting for
    // the first `onMounted`. The motion controllers await the same singleton
    // promise, so this only moves the request earlier — it shortens the window
    // in which `html.anim` is hiding content before the failsafe fires.
    void loadGsap()?.catch(() => undefined)
  },
} satisfies Theme
