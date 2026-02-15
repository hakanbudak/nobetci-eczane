<script setup lang="ts">
import type { Pharmacy } from '@/types/pharmacy'
import { formatDistance } from '@/utils/distance'

const props = defineProps<{
  pharmacy: Pharmacy
  isActive?: boolean
}>()

defineEmits<{
  select: []
}>()
</script>

<template>
  <div
    class="bg-dark-800 border border-dark-700/50 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-primary-500/40 hover:bg-dark-750"
    :class="{
      'border-primary-500/60 bg-dark-800 ring-1 ring-primary-500/20': isActive,
    }"
    @click="$emit('select')"
  >
    <div class="flex items-start gap-3 mb-3">
      <div class="w-9 h-9 bg-[#FF0000] rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0 mt-0.5">
        E
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-dark-50 text-sm leading-tight truncate">
          {{ props.pharmacy.name }}
        </h3>
      </div>
    </div>

    <div class="flex items-center gap-2 mb-2.5">
      <span class="text-xs font-semibold bg-primary-900/50 text-primary-300 px-2.5 py-0.5 rounded-md border border-primary-700/30">
        {{ props.pharmacy.district }}
      </span>
      <span
        v-if="props.pharmacy.distance != null"
        class="text-xs font-semibold bg-dark-700 text-dark-300 px-2.5 py-0.5 rounded-md"
      >
        {{ formatDistance(props.pharmacy.distance) }}
      </span>
    </div>

    <p class="text-xs text-dark-400 leading-relaxed mb-3 line-clamp-2">
      {{ props.pharmacy.address }}
    </p>

    <div class="flex items-center justify-between">
      <span class="text-xs text-dark-400">
        Telefon: <span class="text-dark-200 font-medium">{{ props.pharmacy.phone }}</span>
      </span>
      <div class="flex gap-1.5">
        <a
          :href="`tel:${props.pharmacy.phone.replace(/\s/g, '')}`"
          class="w-8 h-8 bg-primary-600/20 text-primary-400 rounded-lg flex items-center justify-center hover:bg-primary-600/30 transition-colors"
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
          class="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
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
