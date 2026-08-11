import DefaultTheme from 'vitepress/theme'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp() {
    if (typeof document !== 'undefined') {
      document.body.style.webkitFontSmoothing = 'auto'
    }
  }
}
