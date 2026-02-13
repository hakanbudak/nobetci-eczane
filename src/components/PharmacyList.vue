<script setup lang="ts">
import type { Pharmacy } from '@/types/pharmacy'
import PharmacyCard from './PharmacyCard.vue'

defineProps<{
  pharmacies: Pharmacy[]
  isLoading: boolean
  activePharmacy?: Pharmacy | null
}>()

const emit = defineEmits<{
  select: [pharmacy: Pharmacy]
}>()
</script>

<template>
  <div v-if="isLoading" class="space-y-3">
    <div v-for="i in 5" :key="i" class="bg-white rounded-2xl border border-slate-200 p-4">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="skeleton h-4 w-36" />
        <div class="skeleton h-5 w-14 rounded-full" />
      </div>
      <div class="skeleton h-3 w-20 mb-2" />
      <div class="skeleton h-3 w-full mb-1" />
      <div class="skeleton h-3 w-3/4 mb-4" />
      <div class="flex gap-2">
        <div class="skeleton h-9 flex-1 rounded-xl" />
        <div class="skeleton h-9 flex-1 rounded-xl" />
      </div>
    </div>
  </div>

  <div v-else-if="pharmacies.length > 0" class="space-y-3">
    <PharmacyCard
      v-for="pharmacy in pharmacies"
      :key="`${pharmacy.name}-${pharmacy.district}`"
      :pharmacy="pharmacy"
      :is-active="activePharmacy?.name === pharmacy.name && activePharmacy?.address === pharmacy.address"
      @select="emit('select', $event)"
    />
  </div>

  <div v-else class="text-center py-12">
    <div class="text-4xl mb-3">🔍</div>
    <p class="text-slate-500 text-sm">Bu bölgede nöbetçi eczane bulunamadı.</p>
  </div>
</template>
