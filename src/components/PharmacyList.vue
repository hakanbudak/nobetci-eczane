<script setup lang="ts">
import type { Pharmacy } from '@/types/pharmacy'
import PharmacyCard from './PharmacyCard.vue'

defineProps<{
  pharmacies: Pharmacy[]
  isLoading: boolean
  activePharmacy?: Pharmacy | null
}>()

defineEmits<{
  select: [pharmacy: Pharmacy]
}>()
</script>

<template>
  <div class="h-full">
    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="grid grid-cols-1 xl:grid-cols-2 gap-3 p-1">
      <div v-for="n in 6" :key="n" class="bg-dark-800 border border-dark-700/50 rounded-xl p-4">
        <div class="flex items-start gap-3 mb-3">
          <div class="skeleton w-9 h-9 rounded-lg shrink-0" />
          <div class="skeleton h-4 w-3/4 rounded" />
        </div>
        <div class="flex gap-2 mb-2.5">
          <div class="skeleton h-5 w-20 rounded-md" />
          <div class="skeleton h-5 w-14 rounded-md" />
        </div>
        <div class="skeleton h-3 w-full rounded mb-1.5" />
        <div class="skeleton h-3 w-2/3 rounded mb-3" />
        <div class="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>

    <!-- Pharmacy Cards Grid -->
    <div
      v-else-if="pharmacies.length > 0"
      class="grid grid-cols-1 xl:grid-cols-2 gap-3 p-1"
    >
      <PharmacyCard
        v-for="(pharmacy, index) in pharmacies"
        :key="`${pharmacy.name}__${pharmacy.address}`"
        :pharmacy="pharmacy"
        :is-active="
          activePharmacy?.name === pharmacy.name &&
          activePharmacy?.address === pharmacy.address
        "
        :is-nearest="index === 0 && pharmacy.distance != null"
        @select="$emit('select', pharmacy)"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center h-full text-center px-6"
    >
      <div class="w-16 h-16 bg-dark-800 rounded-2xl flex items-center justify-center mb-4 border border-dark-700/50">
        <span class="text-2xl">💊</span>
      </div>
      <p class="text-sm font-medium text-dark-300 mb-1">
        Nöbetçi eczane bulunamadı
      </p>
      <p class="text-xs text-dark-500">
        Konumunuz alındığında en yakın eczaneler burada görünecek.
      </p>
    </div>
  </div>
</template>
