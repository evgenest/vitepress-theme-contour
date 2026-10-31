import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const PACKAGE = '@evgenest/vitepress-theme-contour'

const LABELS = {
  en: {
    contour: { theme: 'Theme', auto: 'Auto', light: 'Light', dark: 'Dark', wrapOn: 'Wrap lines', wrapOff: 'Do not wrap lines' },
    copy: 'Copy code',
    copied: 'Copied!',
    themeConfig: { docFooter: { prev: 'Previous', next: 'Next' } },
  },
  ru: {
    contour: { theme: 'Тема', auto: 'Авто', light: 'Светлая', dark: 'Тёмная', wrapOn: 'Переносить строки', wrapOff: 'Не переносить строки' },
    copy: 'Копировать',
    copied: 'Скопировано!',
    permalink: 'Ссылка на раздел',
    themeConfig: {
      search: {
        provider: 'local',
        options: {
          translations: {
            button: { buttonText: 'Поиск', buttonAriaLabel: 'Поиск' },
            modal: {
              noResultsText: 'Ничего не найдено по запросу',
              displayDetails: 'Показать развёрнутые результаты',
              resetButtonTitle: 'Очистить',
              backButtonTitle: 'Закрыть',
              footer: {
                selectText: 'открыть',
                selectKeyAriaLabel: 'Enter',
                navigateText: 'выбрать',
                navigateUpKeyAriaLabel: 'стрелка вверх',
                navigateDownKeyAriaLabel: 'стрелка вниз',
                closeText: 'закрыть',
                closeKeyAriaLabel: 'Escape',
              },
            },
          },
        },
      },
      outline: { label: 'На этой странице' },
      sidebarMenuLabel: 'Меню',
      returnToTopLabel: 'Наверх',
      darkModeSwitchLabel: 'Тема',
      lightModeSwitchTitle: 'Включить светлую тему',
      darkModeSwitchTitle: 'Включить тёмную тему',
      skipToContentLabel: 'Перейти к содержимому',
      langMenuLabel: 'Сменить язык',
      navMenuLabel: 'Навигация',
      mobileMenuLabel: 'Меню',
      extraMenuLabel: 'Ещё',
      notFound: {
        title: 'СТРАНИЦА НЕ НАЙДЕНА',
        quote: 'Такой страницы здесь нет. Вернитесь на главную или воспользуйтесь поиском.',
        linkLabel: 'на главную',
        linkText: 'На главную',
      },
      docFooter: { prev: 'Предыдущая', next: 'Следующая' },
    },
  },
}

// markdown-it plugin: adds the wrap button to every code block.
function contourMarkdown(md, { locale = 'en' } = {}) {
  const labels = LABELS[locale]
  const fence = md.renderer.rules.fence
  const label = labels.contour.wrapOn
  md.renderer.rules.fence = (...args) =>
    fence(...args).replace(
      '<button',
      `<button type="button" class="wrap" title="${label}" aria-label="${label}" aria-pressed="false"></button><button`,
    )
  if (labels.permalink) {
    md.core.ruler.push('contour-permalink', (state) => {
      for (const token of state.tokens) {
        for (const child of token.children ?? []) {
          if (child.type !== 'link_open') continue
          const value = child.attrGet('aria-label')
          if (value?.startsWith('Permalink to')) {
            child.attrSet('aria-label', value.replace('Permalink to', labels.permalink))
          }
        }
      }
    })
  }
}

/** Base config to pass to `extends`. */
export function contourConfig({ locale = 'en' } = {}) {
  const labels = LABELS[locale]
  if (!labels) throw new Error(`${PACKAGE}: unknown locale "${locale}", use one of: ${Object.keys(LABELS).join(', ')}`)
  return {
    lang: locale,
    // Applied before first paint so code blocks do not jump on load.
    head: [
      ['script', {}, "try{if(localStorage.getItem('code-wrap')==='1')document.documentElement.classList.add('code-wrap')}catch(e){}"],
    ],
    vite: { ssr: { noExternal: [PACKAGE] } },
    markdown: {
      codeCopyButton: { tooltipText: labels.copy, copiedText: labels.copied },
      config: (md) => contourMarkdown(md, { locale }),
    },
    themeConfig: {
      search: { provider: 'local' },
      ...labels.themeConfig,
      contour: labels.contour,
    },
  }
}

function pageTitle(file, fallback) {
  const text = readFileSync(file, 'utf8')
  const front = text.match(/^---\r?\n[\s\S]*?^title:\s*(.+)$[\s\S]*?^---/m)
  const heading = text.match(/^# (.+)$/m)
  return (front?.[1] ?? heading?.[1] ?? fallback).trim().replace(/^['"]|['"]$/g, '')
}

/** Builds a sidebar tree from the folders in `srcDir`. */
export function sidebarTree({ srcDir = '.', exclude = [], titles = {}, order = [], rootLabel, collapsed = false } = {}) {
  const isHome = (path) => path === 'README.md' || path === 'index.md'
  const rank = (path) => {
    const i = order.indexOf(path)
    if (i !== -1) return i
    return isHome(path) ? -1 : order.length
  }
  const walk = (rel) =>
    readdirSync(join(srcDir, rel), { withFileTypes: true })
      .filter((e) => !e.name.startsWith('.') && e.name !== 'node_modules' && e.name !== 'public')
      .map((e) => ({ e, path: rel ? `${rel}/${e.name}` : e.name }))
      .filter(({ e, path }) => e.isDirectory() || (e.name.endsWith('.md') && !exclude.includes(path)))
      .sort((a, b) => rank(a.path) - rank(b.path) || a.path.localeCompare(b.path))
      .map(({ e, path }) => {
        if (e.isDirectory()) {
          const items = walk(path)
          return items.length ? { text: titles[path] ?? e.name, collapsed, items } : null
        }
        return {
          text: titles[path] ?? pageTitle(join(srcDir, path), e.name),
          link: isHome(path) ? '/' : `/${path.replace(/\.md$/, '')}`,
        }
      })
      .filter(Boolean)
  const items = walk('')
  return rootLabel ? [{ text: rootLabel, collapsed, items }] : items
}
