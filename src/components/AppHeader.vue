<script setup lang="ts">
import { RouterLink } from 'vue-router'

// Sadece mobil için header sağında gösterilecek konum durumu
const props = defineProps<{
  locationStatus?: 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable'
  pharmacyCount?: number
  cityName?: string
}>()
</script>

<template>
  <header class="h-12 bg-dark-950 border-b border-dark-700/50 flex items-center px-4 shrink-0">
    <div class="flex items-center justify-between w-full max-w-[1920px] mx-auto">
      <RouterLink
        to="/"
        class="flex items-center gap-2 text-primary-400 font-bold text-base tracking-tight hover:text-primary-300 transition-colors"
      >
        <span class="w-7 h-7 bg-[#FF0000] rounded-lg flex items-center justify-center text-white text-sm font-black">E</span>
        <span class="text-dark-100">Nöbetçi Eczane</span>
      </RouterLink>

      <!-- Mobil konum durumu — sadece küçük ekranlarda görünür -->
      <div class="lg:hidden flex items-center">
        <!-- Konum alınıyor -->
        <div
          v-if="locationStatus === 'idle' || locationStatus === 'requesting'"
          class="inline-flex items-center gap-1.5 text-dark-300 text-xs"
        >
          <svg class="w-3 h-3 animate-spin text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Konum alınıyor...</span>
        </div>

        <!-- Konum bulundu -->
        <div
          v-else-if="locationStatus === 'granted' && cityName"
          class="inline-flex items-center gap-1.5 text-dark-200 text-xs"
        >
          <span class="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
          <span class="truncate max-w-[140px]">{{ cityName }}</span>
          <span
            v-if="pharmacyCount && pharmacyCount > 0"
            class="bg-primary-500/20 text-primary-300 rounded-full px-1.5 py-0.5 text-[10px] font-semibold border border-primary-500/30"
          >{{ pharmacyCount }}</span>
        </div>

        <!-- Konum yok -->
        <div
          v-else-if="locationStatus === 'denied' || locationStatus === 'unavailable'"
          class="inline-flex items-center gap-1.5 text-amber-400 text-xs"
        >
          <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Konum yok</span>
        </div>
      </div>
    </div>
  </header>
</template>
