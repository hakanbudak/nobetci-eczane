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
  <div class="h-full flex overflow-hidden">
    <!-- Sol: Harita (sabit, scroll olmaz) -->
    <div class="w-1/2 h-full relative shrink-0">
      <!-- Konum bilgisi overlay (harita üstünde sol üst) -->
      <div class="absolute top-3 left-3 z-[1000]">
        <div
          v-if="status === 'idle' || status === 'requesting'"
          class="flex items-center gap-2 bg-dark-900/90 backdrop-blur-sm text-dark-200 rounded-lg px-3 py-2 text-xs border border-dark-700/50"
        >
          <svg class="w-3.5 h-3.5 animate-spin text-primary-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Konum alınıyor...
        </div>

        <div
          v-if="status === 'granted' && detectedCityName"
          class="flex items-center gap-2 bg-dark-900/90 backdrop-blur-sm text-dark-200 rounded-lg px-3 py-2 text-xs border border-primary-700/30"
        >
          <span class="w-2 h-2 bg-primary-400 rounded-full"></span>
          📍 {{ detectedCityName }} · {{ pharmacies.length }} eczane
        </div>

        <div
          v-if="status === 'denied' || status === 'unavailable'"
          class="bg-dark-900/90 backdrop-blur-sm text-amber-400 rounded-lg px-3 py-2 text-xs border border-amber-700/30"
        >
          📍 Konum alınamadı — Sağ panelden şehir seçin
        </div>
      </div>

      <PharmacyMap
        :pharmacies="pharmacies"
        :user-location="coordinates"
        :active-pharmacy="activePharmacy"
        @select-pharmacy="handlePharmacySelect"
      />
    </div>

    <!-- Sağ: Kontroller + Eczane Listesi (sadece bu alan scroll yapar) -->
    <div class="w-1/2 h-full flex flex-col bg-dark-900 border-l border-dark-700/50">
      <!-- Üst: Şehir seçici + Bilgiler -->
      <div class="shrink-0 p-4 border-b border-dark-700/50 space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-dark-100">
            <template v-if="detectedCityName">
              {{ detectedCityName }} Nöbetçi Eczaneler
            </template>
            <template v-else>
              Nöbetçi Eczaneler
            </template>
          </h2>
          <span v-if="!isLoading && pharmacies.length > 0" class="text-xs text-dark-500 font-medium">
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
        class="mx-4 mt-3 bg-red-950/50 text-red-400 text-xs rounded-lg px-4 py-3 border border-red-800/30"
      >
        {{ error }}
      </div>

      <!-- Eczane Listesi (scroll sadece burada) -->
      <div class="flex-1 overflow-y-auto p-4">
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
