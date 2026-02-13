<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { usePharmacy } from '@/composables/usePharmacy'
import { useCities } from '@/composables/useCities'
import { useGeolocation } from '@/composables/useGeolocation'
import PharmacyMap from '@/components/PharmacyMap.vue'
import PharmacyList from '@/components/PharmacyList.vue'
import type { Pharmacy } from '@/types/pharmacy'

const route = useRoute()
const router = useRouter()
const { pharmacies, isLoading, error, fetchPharmacies, sortByDistance } = usePharmacy()
const { getCityBySlug, getCityName } = useCities()
const { coordinates, requestLocation } = useGeolocation()

const citySlug = computed(() => route.params.city as string)
const city = computed(() => getCityBySlug(citySlug.value))
const cityName = computed(() => getCityName(citySlug.value))
const activePharmacy = ref<Pharmacy | null>(null)

useHead(
  computed(() => ({
    title: `${cityName.value} Nöbetçi Eczane - Bugün Nöbetçi Eczaneler`,
    meta: [
      {
        name: 'description',
        content: `${cityName.value} nöbetçi eczane listesi. ${cityName.value} ilinde bugün nöbetçi olan eczaneleri harita üzerinde görüntüleyin.`,
      },
      { property: 'og:title', content: `${cityName.value} Nöbetçi Eczane` },
      {
        property: 'og:description',
        content: `${cityName.value} nöbetçi eczanelerini harita üzerinde bulun.`,
      },
    ],
  }))
)

function handlePharmacySelect(pharmacy: Pharmacy): void {
  activePharmacy.value = pharmacy
}

function navigateToDistrict(districtSlug: string): void {
  router.push(`/${citySlug.value}/${districtSlug}`)
}

onMounted(async () => {
  if (!city.value) {
    router.replace('/sehirler')
    return
  }

  await fetchPharmacies(city.value.name)

  const coords = await requestLocation()
  if (coords) {
    sortByDistance(coords)
  }
})
</script>

<template>
  <div class="flex-1 flex flex-col lg:flex-row" v-if="city">
    <div class="lg:w-[420px] flex flex-col bg-white lg:border-r lg:border-slate-200 order-2 lg:order-1">
      <div class="p-4 border-b border-slate-100">
        <div class="flex items-center gap-2 mb-1">
          <button
            @click="router.push('/')"
            class="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-lg font-bold text-slate-800">
            {{ cityName }} <span class="text-emerald-600">Nöbetçi Eczane</span>
          </h1>
        </div>
        <p class="text-xs text-slate-400 ml-7">İlçe seçerek filtreleyin</p>

        <div class="mt-3 flex flex-wrap gap-1.5 ml-7">
          <button
            v-for="district in city.districts"
            :key="district.slug"
            @click="navigateToDistrict(district.slug)"
            class="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
          >
            {{ district.name }}
          </button>
        </div>
      </div>

      <div v-if="!isLoading && pharmacies.length > 0" class="px-4 pt-3">
        <p class="text-xs text-slate-400 font-medium">
          {{ pharmacies.length }} nöbetçi eczane bulundu
        </p>
      </div>

      <div v-if="error" class="mx-4 mt-3 bg-red-50 text-red-600 text-xs rounded-xl px-4 py-3">
        {{ error }}
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <PharmacyList
          :pharmacies="pharmacies"
          :is-loading="isLoading"
          :active-pharmacy="activePharmacy"
          @select="handlePharmacySelect"
        />
      </div>
    </div>

    <div class="h-[45vh] lg:h-auto lg:flex-1 order-1 lg:order-2">
      <PharmacyMap
        :pharmacies="pharmacies"
        :user-location="coordinates"
        :active-pharmacy="activePharmacy"
        @select-pharmacy="handlePharmacySelect"
      />
    </div>
  </div>
</template>
