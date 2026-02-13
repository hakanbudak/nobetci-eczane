<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCities } from '@/composables/useCities'
import type { City, District } from '@/types/location'

const props = defineProps<{
  selectedCity?: string
  selectedDistrict?: string
}>()

const emit = defineEmits<{
  'update:city': [cityName: string, citySlug: string]
  'update:district': [districtName: string, districtSlug: string]
  clear: []
}>()

const { allCities, searchCities } = useCities()

const searchQuery = ref('')
const isOpen = ref(false)
const selectedCityData = ref<City | null>(null)

const filteredCities = computed(() => {
  return searchCities(searchQuery.value)
})

function selectCity(city: City): void {
  selectedCityData.value = city
  searchQuery.value = ''
  emit('update:city', city.name, city.slug)
}

function selectDistrict(district: District): void {
  if (!selectedCityData.value) return
  emit('update:district', district.name, district.slug)
  isOpen.value = false
}

function clearSelection(): void {
  selectedCityData.value = null
  searchQuery.value = ''
  emit('clear')
}

function toggleOpen(): void {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
  }
}

// Seçili şehri eşleştir
watch(
  () => props.selectedCity,
  (citySlug) => {
    if (citySlug) {
      const city = allCities.value.find((c) => c.slug === citySlug)
      if (city) {
        selectedCityData.value = city
      }
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="relative">
    <button
      @click="toggleOpen"
      class="w-full flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-left hover:border-emerald-300 transition-colors shadow-sm"
    >
      <svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span class="flex-1 text-sm" :class="selectedCityData ? 'text-slate-800 font-medium' : 'text-slate-400'">
        {{ selectedCityData ? selectedCityData.name : 'Şehir seçin...' }}
        <span v-if="selectedDistrict" class="text-slate-400 font-normal"> / {{ selectedDistrict }}</span>
      </span>
      <svg
        class="w-4 h-4 text-slate-400 transition-transform"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition name="fade">
      <div
        v-if="isOpen"
        class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-80 overflow-hidden flex flex-col"
      >
        <div class="p-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="selectedCityData ? 'İlçe ara...' : 'Şehir ara...'"
              class="flex-1 text-sm bg-slate-50 border-0 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white outline-none placeholder:text-slate-400"
            />
            <button
              v-if="selectedCityData"
              @click="clearSelection"
              class="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
            >
              Geri
            </button>
          </div>
        </div>

        <div class="overflow-y-auto flex-1 p-2">
          <template v-if="selectedCityData">
            <button
              v-for="district in selectedCityData.districts"
              :key="district.slug"
              @click="selectDistrict(district)"
              class="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
              :class="{ 'bg-emerald-50 text-emerald-700 font-medium': selectedDistrict === district.name }"
            >
              {{ district.name }}
            </button>
          </template>

          <template v-else>
            <button
              v-for="city in filteredCities"
              :key="city.slug"
              @click="selectCity(city)"
              class="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors flex items-center justify-between"
            >
              <span>{{ city.name }}</span>
              <span class="text-xs text-slate-400">{{ city.districts.length }} ilçe</span>
            </button>
          </template>

          <p
            v-if="!selectedCityData && filteredCities.length === 0"
            class="text-center text-sm text-slate-400 py-6"
          >
            Sonuç bulunamadı
          </p>
        </div>
      </div>
    </Transition>

    <div v-if="isOpen" class="fixed inset-0 z-40" @click="isOpen = false" />
  </div>
</template>
