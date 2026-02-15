<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="h-12 bg-dark-950 border-b border-dark-700/50 flex items-center px-4 shrink-0">
    <div class="flex items-center justify-between w-full max-w-[1920px] mx-auto">
      <RouterLink
        to="/"
        class="flex items-center gap-2 text-primary-400 font-bold text-base tracking-tight hover:text-primary-300 transition-colors"
      >
        <span class="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center text-white text-sm font-black">E</span>
        <span class="text-dark-100">Nöbetçi Eczane</span>
      </RouterLink>

      <nav class="flex items-center gap-3">
        <RouterLink
          to="/sehirler"
          class="text-xs font-medium text-dark-400 hover:text-primary-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-dark-800"
        >
          Tüm Şehirler
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
