<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
    <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
      <RouterLink
        to="/"
        class="flex items-center gap-2 text-emerald-600 font-bold text-lg tracking-tight hover:text-emerald-700 transition-colors"
      >
        <span class="text-xl">💊</span>
        <span>Nöbetçi Eczane</span>
      </RouterLink>

      <nav class="flex items-center gap-3">
        <RouterLink
          to="/sehirler"
          class="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50"
        >
          Tüm Şehirler
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
