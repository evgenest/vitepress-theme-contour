# @evgenest/vitepress-theme-contour

A theme for [VitePress](https://vitepress.dev) 2 that adds some variety to the stock look: a wider layout, framed code blocks and a few small tools for reading long code. It extends the default theme, so everything you already use in VitePress keeps working, including local search.

> **Requires VitePress 2**, which is still in alpha. The theme styles some of VitePress's internal class names, so a new VitePress version can break parts of it. Keep your lockfile committed and look over your site after upgrading.

## Features

**Layout**
- Left sidebar pinned to the edge of the window, with the active page on a filled background
- Search box and page text aligned on one line
- A wider text column, up to 1100 px
- The "On this page" outline hugs the right edge and takes only the width its text needs
- A site header that stays visible while scrolling on narrow screens

**Code blocks**
- Frame, higher-contrast plain text and a styled but visible scrollbar
- Copy button that appears on hover and shows a green "Copied!" label
- Line-wrap button: one click applies to every code block on the site and is remembered in the browser
- Text never runs under the buttons: wrapped text flows around them, and an unwrapped first line fades out before them, then scrolls fully clear

**Navigation**
- Auto / Light / Dark switch in the header on wide screens
- Previous and next links as cards with arrows
- On narrow screens, the outline highlights the current section and closes after you pick an item
- `sidebarTree()` builds a nested sidebar from your folders
- Interface language: English or Russian

## Install

```sh
bun add -d vitepress@next @evgenest/vitepress-theme-contour
```

npm, pnpm and yarn work too.

## Set up

`.vitepress/theme/index.ts`:

```ts
export { default } from '@evgenest/vitepress-theme-contour'
```

`.vitepress/config.ts`:

```ts
import { contourConfig, sidebarTree } from '@evgenest/vitepress-theme-contour/config'

export default {
  extends: contourConfig({ locale: 'en' }), // or 'ru'
  title: 'My docs',
  themeConfig: {
    sidebar: sidebarTree(),
  },
}
```

## Sidebar

`sidebarTree()` turns each folder into a nested group and each Markdown file into a link. All options are optional:

```ts
sidebarTree({
  srcDir: 'docs',                    // same as srcDir in your config
  exclude: ['drafts.md'],            // paths relative to srcDir
  order: ['intro.md', 'guide'],      // listed first, the rest follow alphabetically
  titles: { 'intro.md': 'Welcome' }, // overrides the name in the menu
  rootLabel: 'Docs',                 // wraps the tree in one top-level group
  collapsed: false,
})
```

The menu name comes from `titles`, then frontmatter `title`, then the first `#` heading, then the file name.

`exclude` only hides a page from the menu. To leave it off the site, also add it to `srcExclude`.

A `README.md` in the root of `srcDir` links to `/`, so add `rewrites: { 'README.md': 'index.md' }` if you use one as your home page.

## Your own `markdown.config`

You can set `markdown.config` as usual: VitePress runs it together with the theme's own, so the wrap buttons stay.

## Colors

Colors are CSS variables. Override them in your own stylesheet, imported from `.vitepress/theme/index.ts`:

```css
:root { --vp-c-brand-1: #0f766e; }
.dark { --vp-c-brand-1: #5eead4; }
```

## License

MIT
