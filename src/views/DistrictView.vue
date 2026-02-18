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
const { getCityBySlug, getCityName, getDistrictName, getDistrictBySlug } = useCities()
const { coordinates, requestLocation } = useGeolocation()

const citySlug = computed(() => route.params.city as string)
const districtSlug = computed(() => route.params.district as string)
const city = computed(() => getCityBySlug(citySlug.value))
const cityName = computed(() => getCityName(citySlug.value))
const districtName = computed(() => getDistrictName(citySlug.value, districtSlug.value))
const district = computed(() => getDistrictBySlug(citySlug.value, districtSlug.value))
const activePharmacy = ref<Pharmacy | null>(null)

useHead(
  computed(() => ({
    title: `${districtName.value}, ${cityName.value} Nöbetçi Eczane - Bugün Nöbetçi Eczaneler`,
    meta: [
      {
        name: 'description',
        content: `${cityName.value} ${districtName.value} nöbetçi eczane listesi. ${districtName.value} ilçesinde bugün nöbetçi olan eczaneleri görüntüleyin.`,
      },
      { property: 'og:title', content: `${districtName.value} ${cityName.value} Nöbetçi Eczane` },
      {
        property: 'og:description',
        content: `${districtName.value} nöbetçi eczanelerini bulun.`,
      },
    ],
  }))
)

function handlePharmacySelect(pharmacy: Pharmacy): void {
  activePharmacy.value = pharmacy
}

onMounted(async () => {
  if (!city.value || !district.value) {
    if (city.value) {
      router.replace(`/${citySlug.value}`)
    } else {
      router.replace('/sehirler')
    }
    return
  }

  await fetchPharmacies(citySlug.value, districtSlug.value)

  const coords = await requestLocation()
  if (coords) {
    sortByDistance(coords)
  }
})
</script>

<template>
  <div class="flex-1 flex flex-col lg:flex-row" v-if="city && district">
    <div class="lg:w-[420px] flex flex-col bg-white lg:border-r lg:border-slate-200 order-2 lg:order-1">
      <div class="p-4 border-b border-slate-100">
        <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <button @click="router.push('/')" class="hover:text-emerald-600 transition-colors">
            Ana Sayfa
          </button>
          <span>/</span>
          <button @click="router.push(`/${citySlug}`)" class="hover:text-emerald-600 transition-colors">
            {{ cityName }}
          </button>
          <span>/</span>
          <span class="text-slate-600 font-medium">{{ districtName }}</span>
        </div>

        <h1 class="text-lg font-bold text-slate-800">
          {{ districtName }}
          <span class="text-emerald-600">Nöbetçi Eczane</span>
        </h1>
        <p class="text-xs text-slate-400 mt-0.5">{{ cityName }} ili</p>
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
