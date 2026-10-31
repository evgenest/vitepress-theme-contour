import { h, onMounted } from 'vue'
import { inBrowser, onContentUpdated, useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ThemeSwitch from './ThemeSwitch.vue'
import './custom.css'

const WRAP_KEY = 'code-wrap'
let wrapLabels = { on: 'Wrap lines', off: 'Do not wrap lines' }

// Keep every wrap button in step with the global state.
function syncWrapButtons() {
  const on = document.documentElement.classList.contains(WRAP_KEY)
  const label = on ? wrapLabels.off : wrapLabels.on
  document.querySelectorAll("div[class*='language-'] > button.wrap").forEach((button) => {
    button.setAttribute('aria-pressed', String(on))
    button.setAttribute('aria-label', label)
    button.setAttribute('title', label)
  })
}

// The stock mobile outline has no current-section highlight.
function markCurrentHeading() {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.VPLocalNavOutlineDropdown .outline-link')]
  const heading = (link: HTMLAnchorElement) => document.getElementById(decodeURIComponent(link.hash.slice(1)))
  const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1
  let current: HTMLAnchorElement | undefined = atBottom ? links.at(-1) : undefined
  if (!current) {
    for (const link of links) {
      const el = heading(link)
      if (!el) continue
      const margin = Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0
      if (el.getBoundingClientRect().top > margin + 4) break
      current = link
    }
  }
  links.forEach((link) => link.classList.toggle('active', link === current))
  current?.scrollIntoView({ block: 'nearest' })
}

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'nav-bar-content-after': () => h(ThemeSwitch),
    }),
  setup() {
    const { theme } = useData()
    const ui = (theme.value as any).contour
    if (ui) wrapLabels = { on: ui.wrapOn, off: ui.wrapOff }
    onMounted(syncWrapButtons)
    onContentUpdated(syncWrapButtons)
  },
  enhanceApp() {
    if (!inBrowser) return
    window.addEventListener('click', (e) => {
      const button = e.target as HTMLElement
      if (button.closest?.('.VPLocalNavOutlineDropdown > button')) {
        requestAnimationFrame(markCurrentHeading)
        return
      }
      if (!button.matches?.("div[class*='language-'] > button.wrap")) return
      // Blocks above change height: keep the pressed button where it is on screen.
      const top = button.getBoundingClientRect().top
      const on = document.documentElement.classList.toggle(WRAP_KEY)
      try {
        localStorage.setItem(WRAP_KEY, on ? '1' : '0')
      } catch {}
      syncWrapButtons()
      window.scrollBy({ top: button.getBoundingClientRect().top - top, behavior: 'instant' })
    })
  },
}
