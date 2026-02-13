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
  <div class="flex-1 flex flex-col lg:flex-row">
    <div class="lg:w-[420px] flex flex-col bg-white lg:border-r lg:border-slate-200 order-2 lg:order-1">
      <div class="p-4 space-y-3 border-b border-slate-100">
        <div
          v-if="status === 'idle' || status === 'requesting'"
          class="flex items-center gap-3 bg-emerald-50 text-emerald-700 rounded-2xl px-4 py-3.5 text-sm"
        >
          <div class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <div>
            <div class="font-semibold text-sm">Konumunuz alınıyor...</div>
            <div class="text-xs text-emerald-600/70">Lütfen konum iznini onaylayın</div>
          </div>
        </div>

        <div
          v-if="status === 'granted' && detectedCityName"
          class="flex items-center gap-3 bg-emerald-50 text-emerald-700 rounded-2xl px-4 py-3 text-sm"
        >
          <div class="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <span class="font-semibold">📍 {{ detectedCityName }}</span>
            <span class="text-xs text-emerald-600/70 ml-1">konumunuza göre</span>
          </div>
        </div>

        <div
          v-if="status === 'denied' || status === 'unavailable'"
          class="bg-amber-50 text-amber-700 rounded-2xl px-4 py-3 text-xs"
        >
          <p class="font-medium mb-1">📍 Konum alınamadı</p>
          <p>Aşağıdan şehir seçerek nöbetçi eczaneleri arayabilirsiniz.</p>
        </div>

        <CitySelector
          :selected-city="selectedCitySlug"
          :selected-district="selectedDistrictName"
          @update:city="handleCityChange"
          @update:district="handleDistrictChange"
          @clear="handleCityClear"
        />
      </div>

      <div
        v-if="error"
        class="mx-4 mt-3 bg-red-50 text-red-600 text-xs rounded-xl px-4 py-3"
      >
        {{ error }}
      </div>

      <div v-if="!isLoading && pharmacies.length > 0" class="px-4 pt-3">
        <p class="text-xs text-slate-400 font-medium">
          {{ pharmacies.length }} nöbetçi eczane bulundu
        </p>
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

    <div class="h-[45vh] lg:h-auto lg:flex-1 order-1 lg:order-2 relative">
      <PharmacyMap
        :pharmacies="pharmacies"
        :user-location="coordinates"
        :active-pharmacy="activePharmacy"
        @select-pharmacy="handlePharmacySelect"
      />
    </div>
  </div>
</template>
