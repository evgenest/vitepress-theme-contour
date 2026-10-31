import type { DefaultTheme, UserConfig } from 'vitepress'

export type ContourLocale = 'en' | 'ru'

export function contourConfig(options?: { locale?: ContourLocale }): UserConfig<DefaultTheme.Config>

export function sidebarTree(options?: {
  /** Folder with the Markdown files, the same as `srcDir` in your config. */
  srcDir?: string
  /** Paths relative to `srcDir` to leave out of the menu. */
  exclude?: string[]
  /** Menu names by path. Otherwise: frontmatter `title`, then the first `#` heading, then the file name. */
  titles?: Record<string, string>
  /** Paths in the order they should appear; everything else follows alphabetically. */
  order?: string[]
  /** Wraps the whole tree in one top-level group. */
  rootLabel?: string
  collapsed?: boolean
}): DefaultTheme.SidebarItem[]
