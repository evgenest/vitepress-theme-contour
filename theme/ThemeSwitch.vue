<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useData } from 'vitepress'

const KEY = 'vitepress-theme-appearance'
const { isDark, theme } = useData()
const ui = computed(() => (theme.value as any).contour ?? { theme: 'Theme', auto: 'Auto', light: 'Light', dark: 'Dark' })
const mode = ref('auto')

onMounted(() => {
  mode.value = localStorage.getItem(KEY) || 'auto'
})

async function change() {
  const v = mode.value
  const system = matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = v === 'auto' ? system : v === 'dark'
  // VitePress collapses a choice equal to the system theme into auto,
  // so the explicit choice is written after its own write.
  await nextTick()
  localStorage.setItem(KEY, v)
}
</script>

<template>
  <label class="theme-switch">
    <span class="sr-only">{{ ui.theme }}</span>
    <select v-model="mode" @change="change" :aria-label="ui.theme">
      <option value="auto">{{ ui.auto }}</option>
      <option value="light">{{ ui.light }}</option>
      <option value="dark">{{ ui.dark }}</option>
    </select>
  </label>
</template>

<style scoped>
.theme-switch { display: none; align-items: center; margin-left: 16px; }
@media (min-width: 1280px) { .theme-switch { display: flex; } }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
select {
  height: 32px; padding: 0 10px; font-size: 13px; cursor: pointer;
  color: var(--vp-c-text-1); background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border); border-radius: 6px;
  appearance: auto;
}
select:hover { border-color: var(--vp-c-brand-1); }
</style>
