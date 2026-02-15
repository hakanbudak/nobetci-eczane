<script setup lang="ts">
import { computed } from 'vue'
import type { Pharmacy } from '@/types/pharmacy'
import { formatDistance } from '@/utils/distance'

const props = defineProps<{
  pharmacy: Pharmacy
  isActive?: boolean
  isNearest?: boolean // Yeni prop: En yakın mı?
}>()

defineEmits<{
  select: []
}>()

// Mesafe bazlı renk durumu
const distanceStatus = computed(() => {
  const dist = props.pharmacy.distance
  
  if (dist === undefined) return 'neutral'
  if (props.isNearest || dist < 1.0) return 'closest' // < 1km veya en yakın
  if (dist < 3.0) return 'close' // 1-3km arası
  return 'neutral' // > 3km
})

// Renk sınıfları
const colorClasses = computed(() => {
  switch (distanceStatus.value) {
    case 'closest':
      return {
        border: 'border-green-500/30 hover:border-green-500/50',
        bg: 'bg-dark-800',
        badge: 'bg-green-500/10 text-green-400 border-green-500/20',
        activeBorder: 'border-green-500 ring-1 ring-green-500/20'
      }
    case 'close':
      return {
        border: 'border-amber-500/30 hover:border-amber-500/50',
        bg: 'bg-dark-800',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        activeBorder: 'border-amber-500 ring-1 ring-amber-500/20'
      }
    default:
      return {
        border: 'border-dark-700/50 hover:border-primary-500/40',
        bg: 'bg-dark-800',
        badge: 'bg-dark-700 text-dark-300',
        activeBorder: 'border-primary-500/60 ring-1 ring-primary-500/20'
      }
  }
})
</script>

<template>
  <div
    class="rounded-xl p-4 cursor-pointer transition-all duration-200 hover:bg-dark-750 border relative overflow-hidden"
    :class="[
      isActive ? colorClasses.activeBorder : colorClasses.border,
      colorClasses.bg
    ]"
    @click="$emit('select')"
  >
    <!-- En Yakın Etiketi -->
    <div 
      v-if="distanceStatus === 'closest'" 
      class="absolute top-0 right-0 bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg border-b border-l border-green-500/20"
    >
      En Yakın
    </div>

    <div class="flex items-start gap-3 mb-3">
      <!-- E Logosu: Sabit Renk -->
      <div 
        class="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm shrink-0 mt-0.5 bg-[#FF0000] text-white border border-blue-500/30"
        style="text-shadow: 0 1px 2px rgba(0,0,0,0.3);"
      >
        E
      </div>
      <div class="flex-1 min-w-0 pr-12"> <!-- pr-12: En yakın etiketi için boşluk -->
        <h3 class="font-bold text-dark-50 text-sm leading-tight truncate">
          {{ props.pharmacy.name }}
        </h3>
        <p class="text-xs text-dark-400 leading-relaxed mt-1 line-clamp-1">
          {{ props.pharmacy.address }}
        </p>
      </div>
    </div>

    <div class="flex items-center justify-between mt-3">
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold bg-primary-900/50 text-primary-300 px-2.5 py-0.5 rounded-md border border-primary-700/30">
          {{ props.pharmacy.district }}
        </span>
        <span
          v-if="props.pharmacy.distance != null"
          class="text-xs font-semibold px-2.5 py-0.5 rounded-md border"
          :class="colorClasses.badge"
        >
          {{ formatDistance(props.pharmacy.distance) }}
        </span>
      </div>

      <div class="flex gap-1.5 z-10">
        <a
          :href="`tel:${props.pharmacy.phone.replace(/\s/g, '')}`"
          class="w-8 h-8 bg-dark-700/50 text-dark-300 rounded-lg flex items-center justify-center hover:bg-dark-600 transition-colors"
          @click.stop
          title="Ara"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </a>
        <a
          :href="`https://www.google.com/maps/dir/?api=1&destination=${props.pharmacy.location.lat},${props.pharmacy.location.lng}`"
          target="_blank"
          rel="noopener"
          class="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors shadow-lg shadow-primary-900/20"
          @click.stop
          title="Yol Tarifi"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>
