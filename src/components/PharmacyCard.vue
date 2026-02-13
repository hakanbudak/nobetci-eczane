<script setup lang="ts">
import type { Pharmacy } from '@/types/pharmacy'
import { formatDistance } from '@/utils/distance'

const props = defineProps<{
  pharmacy: Pharmacy
  isActive?: boolean
}>()

const emit = defineEmits<{
  select: [pharmacy: Pharmacy]
}>()

function getDirectionsUrl(pharmacy: Pharmacy): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}`
}

function getPhoneUrl(phone: string): string {
  return `tel:${phone.replace(/\s/g, '')}`
}
</script>

<template>
  <div
    class="group bg-white rounded-2xl border transition-all duration-200 cursor-pointer"
    :class="[
      isActive
        ? 'border-emerald-400 shadow-lg shadow-emerald-100 ring-2 ring-emerald-400/20'
        : 'border-slate-200 hover:border-emerald-300 hover:shadow-md',
    ]"
    @click="emit('select', props.pharmacy)"
  >
    <div class="p-4">
      <div class="flex items-start justify-between gap-3 mb-2">
        <h3 class="font-semibold text-slate-800 text-sm leading-tight">
          {{ pharmacy.name }}
        </h3>
        <span
          v-if="pharmacy.distance !== undefined"
          class="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
          :class="[
            pharmacy.distance < 1
              ? 'bg-emerald-100 text-emerald-700'
              : pharmacy.distance < 3
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-600',
          ]"
        >
          {{ formatDistance(pharmacy.distance) }}
        </span>
      </div>

      <p class="text-xs text-emerald-600 font-medium mb-1">{{ pharmacy.district }}</p>

      <p class="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
        {{ pharmacy.address }}
      </p>

      <div class="flex gap-2">
        <a
          :href="getPhoneUrl(pharmacy.phone)"
          class="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl py-2.5 px-3 transition-colors active:scale-95"
          @click.stop
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Ara
        </a>
        <a
          :href="getDirectionsUrl(pharmacy)"
          target="_blank"
          rel="noopener"
          class="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl py-2.5 px-3 transition-colors active:scale-95"
          @click.stop
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Yol Tarifi
        </a>
      </div>
    </div>
  </div>
</template>
