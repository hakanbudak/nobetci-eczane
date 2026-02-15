<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import { useGeolocation } from '@/composables/useGeolocation'
import { usePharmacy } from '@/composables/usePharmacy'
import { useCities } from '@/composables/useCities'
import { findNearestCity } from '@/utils/reverseGeocode'
import PharmacyMap from '@/components/PharmacyMap.vue'
import PharmacyList from '@/components/PharmacyList.vue'
import CitySelector from '@/components/CitySelector.vue'
import type { Pharmacy } from '@/types/pharmacy'

useHead({
  title: 'Nöbetçi Eczane - En Yakın Nöbetçi Eczaneyi Bul',
  meta: [
    {
      name: 'description',
      content:
        'Türkiye genelinde nöbetçi eczaneleri anında bulun. Konumunuza en yakın nöbetçi eczaneyi harita üzerinde görün, yol tarifi alın.',
    },
    { property: 'og:title', content: 'Nöbetçi Eczane - En Yakın Nöbetçi Eczaneyi Bul' },
    {
      property: 'og:description',
      content: 'Konumunuza en yakın nöbetçi eczaneyi bulun.',
    },
    { name: 'robots', content: 'index, follow' },
  ],
})

const { coordinates, status, requestLocation } = useGeolocation()
const { pharmacies, isLoading, error, fetchPharmacies, sortByDistance } = usePharmacy()
const { getCityBySlug } = useCities()

const activePharmacy = ref<Pharmacy | null>(null)
const selectedCitySlug = ref<string>('')
const selectedDistrictName = ref<string>('')
const detectedCityName = ref<string>('')

function handlePharmacySelect(pharmacy: Pharmacy): void {
  activePharmacy.value = pharmacy
}

async function handleCityChange(cityName: string, citySlug: string): Promise<void> {
  selectedCitySlug.value = citySlug
  selectedDistrictName.value = ''
  detectedCityName.value = ''
  await fetchPharmacies(cityName)

  if (coordinates.value) {
    sortByDistance(coordinates.value)
  }
}

async function handleDistrictChange(districtName: string, _districtSlug: string): Promise<void> {
  selectedDistrictName.value = districtName

  const city = getCityBySlug(selectedCitySlug.value)
  if (city) {
    await fetchPharmacies(city.name, districtName)
    if (coordinates.value) {
      sortByDistance(coordinates.value)
    }
  }
}

function handleCityClear(): void {
  selectedCitySlug.value = ''
  selectedDistrictName.value = ''
  detectedCityName.value = ''
  pharmacies.value = []
}

onMounted(async () => {
  const coords = await requestLocation()

  if (coords) {
    const nearest = findNearestCity(coords.lat, coords.lng)
    detectedCityName.value = nearest.name
    selectedCitySlug.value = nearest.slug

    await fetchPharmacies(nearest.name)
    sortByDistance(coords)
  }
})
</script>

<template>
  <div class="h-[100dvh] w-full flex flex-col lg:flex-row overflow-hidden relative bg-dark-900">
    <!-- Sol/Üst: Harita (Mobil: 40dvh yükseklik, Desktop: %50 genişlik) -->
    <div class="w-full lg:w-1/2 h-[40dvh] lg:h-full relative shrink-0 order-1 z-0">
      <!-- Konum bilgisi overlay -->
      <div class="absolute top-3 left-3 right-3 lg:right-auto z-[1000] flex flex-col gap-2 pointer-events-none">
        <div
          v-if="status === 'idle' || status === 'requesting'"
          class="inline-flex items-center gap-2 bg-dark-900/90 backdrop-blur-sm text-dark-200 rounded-lg px-3 py-2 text-xs border border-dark-700/50 shadow-lg pointer-events-auto w-fit"
        >
          <svg class="w-3.5 h-3.5 animate-spin text-primary-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Konum alınıyor...
        </div>

        <div
          v-if="status === 'granted' && detectedCityName"
          class="inline-flex items-center gap-2 bg-dark-900/90 backdrop-blur-sm text-dark-200 rounded-lg px-3 py-2 text-xs border border-primary-700/30 shadow-lg pointer-events-auto w-fit"
        >
          <span class="w-2 h-2 bg-primary-400 rounded-full shrink-0"></span>
          <span class="truncate">📍 {{ detectedCityName }} · {{ pharmacies.length }} eczane</span>
        </div>

        <div
          v-if="status === 'denied' || status === 'unavailable'"
          class="inline-flex items-center gap-2 bg-dark-900/90 backdrop-blur-sm text-amber-400 rounded-lg px-3 py-2 text-xs border border-amber-700/30 shadow-lg pointer-events-auto w-fit"
        >
          <span>📍 Konum yok</span>
        </div>
      </div>

      <PharmacyMap
        :pharmacies="pharmacies"
        :user-location="coordinates"
        :active-pharmacy="activePharmacy"
        @select-pharmacy="handlePharmacySelect"
      />
    </div>

    <!-- Sağ/Alt: Liste (Mobil: Kalan yükseklik, Desktop: %50 genişlik) -->
    <div class="w-full lg:w-1/2 flex-1 lg:h-full flex flex-col bg-dark-900 lg:border-l border-dark-700/50 order-2 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] lg:shadow-none min-h-0">
      <!-- Tutamaç (Sadece Mobil) -->
      <div class="lg:hidden flex justify-center pt-3 pb-1 shrink-0">
        <div class="w-12 h-1.5 bg-dark-700 rounded-full"></div>
      </div>

      <!-- Header Area -->
      <div class="shrink-0 p-4 border-b border-dark-700/50 space-y-3 bg-dark-900">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-dark-100 truncate pr-2">
            <template v-if="detectedCityName">
              {{ detectedCityName }} Nöbetçi Eczaneler
            </template>
            <template v-else>
              Nöbetçi Eczaneler
            </template>
          </h2>
          <span v-if="!isLoading && pharmacies.length > 0" class="text-xs text-dark-500 font-medium whitespace-nowrap">
            {{ pharmacies.length }} sonuç
          </span>
        </div>

        <CitySelector
          :selected-city="selectedCitySlug"
          :selected-district="selectedDistrictName"
          @update:city="handleCityChange"
          @update:district="handleDistrictChange"
          @clear="handleCityClear"
        />
      </div>

      <!-- Hata -->
      <div
        v-if="error"
        class="mx-4 mt-3 bg-red-950/50 text-red-400 text-xs rounded-lg px-4 py-3 border border-red-800/30 shrink-0"
      >
        {{ error }}
      </div>

      <!-- List Container -->
      <div class="flex-1 overflow-y-auto p-4 min-h-0 overscroll-contain">
        <PharmacyList
          :pharmacies="pharmacies"
          :is-loading="isLoading"
          :active-pharmacy="activePharmacy"
          @select="handlePharmacySelect"
        />
      </div>
    </div>
  </div>
</template>
