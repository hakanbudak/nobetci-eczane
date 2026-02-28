<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import { useGeolocation } from '@/composables/useGeolocation'
import { usePharmacy } from '@/composables/usePharmacy'
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

const activePharmacy = ref<Pharmacy | null>(null)
const isListVisible = ref(true)
const desktopMap = ref<InstanceType<typeof PharmacyMap> | null>(null)
const mobileMap = ref<InstanceType<typeof PharmacyMap> | null>(null)

// Her iki haritada da fitBounds'u zorla çalıştır
function zoomAllMaps(): void {
  desktopMap.value?.zoomToPharmacies()
  mobileMap.value?.zoomToPharmacies()
}

// Liste paneli açılıp kapanınca harita boyutunu yeniden hesaplat
watch(isListVisible, () => {
  // CSS geçişi (350ms) bittikten sonra invalidateSize
  setTimeout(() => {
    desktopMap.value?.triggerResize()
  }, 370)
})
const selectedCitySlug = ref<string>('')
const selectedDistrictSlug = ref<string>('')
const selectedDistrictName = ref<string>('')
const detectedCityName = ref<string>('')

// ── Bottom Sheet (sadece mobil) ───────────────────────────────
// translateY: 0 = tam açık, büyük değer = aşağı kaymış
const translateY = ref(0)
const isAnimating = ref(false)
const isDragging = ref(false)
const pointerStartY = ref(0)
const translateAtDragStart = ref(0)
const velocityHistory: { t: number; y: number }[] = []
// Mobilde haritanın görünür alanı = translateY kadar yükseklik.
// Bottom Sheet'in kapattığı alan = window.innerHeight - translateY
// Bu değeri PharmacyMap'e geçirince setView/fitBounds görünür alana göre merkezlenir.
const bottomPadding = computed(() => {
  if (typeof window === 'undefined') return 0
  return Math.max(0, window.innerHeight - translateY.value)
})


function getMaxTranslate() {
  // En fazla: sadece tutamaç (≈60px) görünsün
  return window.innerHeight - 60
}

function onHandlePointerDown(e: PointerEvent) {
  isDragging.value = true
  isAnimating.value = false
  pointerStartY.value = e.clientY
  translateAtDragStart.value = translateY.value
  velocityHistory.length = 0
  velocityHistory.push({ t: Date.now(), y: e.clientY })
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onHandlePointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  const delta = e.clientY - pointerStartY.value
  const raw = translateAtDragStart.value + delta
  // Sınırlar: 0 (tam açık) ile maxTranslate (neredeyse tam kapalı) arası
  translateY.value = Math.max(0, Math.min(raw, getMaxTranslate()))

  const now = Date.now()
  velocityHistory.push({ t: now, y: e.clientY })
  // Son 80ms'yi tut
  while (velocityHistory.length > 1 && now - velocityHistory[0].t > 80) {
    velocityHistory.shift()
  }
}

function onHandlePointerUp() {
  if (!isDragging.value) return
  isDragging.value = false

  // Velocity hesapla (px/ms), momentum uygula
  let velocity = 0
  if (velocityHistory.length >= 2) {
    const first = velocityHistory[0]
    const last = velocityHistory[velocityHistory.length - 1]
    const dt = last.t - first.t
    if (dt > 0) velocity = (last.y - first.y) / dt
  }

  const momentum = velocity * 150
  const target = Math.max(0, Math.min(translateY.value + momentum, getMaxTranslate()))

  isAnimating.value = true
  translateY.value = target
  setTimeout(() => { isAnimating.value = false }, 420)
}

onMounted(async () => {
  // Başlangıçta panel ekranın ~%45'i kadar aşağıda (liste %55 görünür)
  translateY.value = Math.round(window.innerHeight * 0.45)

  const coords = await requestLocation()
  if (coords) {
    const nearest = findNearestCity(coords.lat, coords.lng)
    detectedCityName.value = nearest.name
    selectedCitySlug.value = nearest.slug
    await fetchPharmacies(nearest.slug)
    sortByDistance(coords)
  }
})

// ── Pharmacy handlers ─────────────────────────────────────────
function handlePharmacySelect(pharmacy: Pharmacy): void {
  activePharmacy.value = pharmacy
}

async function handleCityChange(_cityName: string, citySlug: string): Promise<void> {
  selectedCitySlug.value = citySlug
  selectedDistrictSlug.value = ''
  selectedDistrictName.value = ''
  detectedCityName.value = ''
  await fetchPharmacies(citySlug)
  if (coordinates.value) sortByDistance(coordinates.value)
  // Eczaneler yüklendikten sonra haritayı o şehre taşı
  nextTick(() => zoomAllMaps())
}

async function handleDistrictChange(districtName: string, districtSlug: string): Promise<void> {
  selectedDistrictSlug.value = districtSlug
  selectedDistrictName.value = districtName
  if (selectedCitySlug.value) {
    await fetchPharmacies(selectedCitySlug.value, districtSlug)
    if (coordinates.value) sortByDistance(coordinates.value)
    // Eczaneler yüklendikten sonra haritayı o ilçeye taşı
    nextTick(() => zoomAllMaps())
  }
}

function handleCityClear(): void {
  selectedCitySlug.value = ''
  selectedDistrictSlug.value = ''
  selectedDistrictName.value = ''
  detectedCityName.value = ''
  pharmacies.value = []
}
</script>

<template>
  <div class="h-[100dvh] w-full overflow-hidden bg-dark-900">

    <!-- ═══════════ DESKTOP (lg+) ═══════════ -->
    <div class="hidden lg:flex h-full w-full">

      <!-- Harita -->
      <div class="relative flex-1 h-full min-w-0">
        <div class="absolute top-3 left-3 z-[1000] flex flex-col gap-2 pointer-events-none">
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
            <span class="w-2 h-2 bg-green-500 rounded-full shrink-0" />
            <span>📍 {{ detectedCityName }} · {{ pharmacies.length }} eczane</span>
          </div>
          <div
              v-if="status === 'denied' || status === 'unavailable'"
              class="inline-flex items-center gap-2 bg-dark-900/90 backdrop-blur-sm text-amber-400 rounded-lg px-3 py-2 text-xs border border-amber-700/30 shadow-lg pointer-events-auto w-fit"
          >
            <span>📍 Konum yok</span>
          </div>
        </div>

        <!-- Liste Paneli Toggle Butonu — harita ile panel arasındaki kenarda -->
        <button
          @click="isListVisible = !isListVisible"
          :title="isListVisible ? 'Listeyi Gizle' : 'Listeyi Göster'"
          class="absolute right-0 top-1/2 -translate-y-1/2 z-[1001] flex flex-col items-center justify-center gap-1 w-5 h-16 bg-dark-800 hover:bg-dark-700 border border-dark-600 hover:border-primary-500/60 rounded-l-lg shadow-xl transition-all duration-200 group"
        >
          <!-- Panel açıksa: sağ ok (kapat), kapalıysa: sol ok (aç) -->
          <svg
            class="w-3 h-3 text-dark-400 group-hover:text-primary-400 transition-colors"
            :class="{ 'rotate-180': !isListVisible }"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
            style="transition: transform 0.3s ease, color 0.2s;"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <PharmacyMap
            ref="desktopMap"
            :pharmacies="pharmacies"
            :user-location="coordinates"
            :active-pharmacy="activePharmacy"
            @select-pharmacy="handlePharmacySelect"
        />
      </div>

      <!-- Liste paneli -->
      <Transition name="slide-panel">
      <div v-show="isListVisible" class="w-[800px] shrink-0 h-full flex flex-col border-l border-dark-700/50">
        <div class="shrink-0 p-4 border-b border-dark-700/50 space-y-3 bg-dark-900">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold text-dark-100 truncate pr-2">
              <template v-if="detectedCityName">{{ detectedCityName }} Nöbetçi Eczaneler</template>
              <template v-else>Nöbetçi Eczaneler</template>
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
        <div v-if="error" class="mx-4 mt-3 bg-red-950/50 text-red-400 text-xs rounded-lg px-4 py-3 border border-red-800/30 shrink-0">
          {{ error }}
        </div>
        <div class="flex-1 overflow-y-auto p-4 min-h-0 overscroll-contain bg-dark-900">
          <PharmacyList
              :pharmacies="pharmacies"
              :is-loading="isLoading"
              :active-pharmacy="activePharmacy"
              @select="handlePharmacySelect"
          />
        </div>
      </div>
      </Transition>
    </div>

    <!-- ═══════════ MOBİL (< lg) ═══════════ -->
    <div class="lg:hidden relative h-full w-full">

      <!-- Harita: tam ekran arka plan -->
      <div class="absolute inset-0 z-0">
        <div class="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none">
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
            <span class="w-2 h-2 bg-green-500 rounded-full shrink-0" />
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
            ref="mobileMap"
            :pharmacies="pharmacies"
            :user-location="coordinates"
            :active-pharmacy="activePharmacy"
            :bottom-padding="bottomPadding"
            @select-pharmacy="handlePharmacySelect"
        />
      </div>

      <!-- Bottom Sheet -->
      <div
          class="absolute inset-x-0 bottom-0 z-10 flex flex-col bg-dark-900 rounded-t-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.5)] will-change-transform"
          :style="{
          height: '93dvh',
          transform: `translateY(${translateY}px)`,
          transition: isAnimating ? 'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
        }"
      >
        <!-- Tutamaç — sadece bu alan sürüklenebilir -->
        <div
            class="shrink-0 flex justify-center items-center h-8 cursor-grab active:cursor-grabbing select-none"
            style="touch-action: none;"
            @pointerdown="onHandlePointerDown"
            @pointermove="onHandlePointerMove"
            @pointerup="onHandlePointerUp"
            @pointercancel="onHandlePointerUp"
        >
          <div
              class="w-10 h-1.5 rounded-full transition-colors duration-150"
              :class="isDragging ? 'bg-primary-400' : 'bg-dark-600'"
          />
        </div>

        <!-- Header -->
        <div class="shrink-0 px-4 pb-3 border-b border-dark-700/50 space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold text-dark-100 truncate pr-2">
              <template v-if="detectedCityName">{{ detectedCityName }} Nöbetçi Eczaneler</template>
              <template v-else>Nöbetçi Eczaneler</template>
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
        <div v-if="error" class="mx-4 mt-3 bg-red-950/50 text-red-400 text-xs rounded-lg px-4 py-3 border border-red-800/30 shrink-0">
          {{ error }}
        </div>

        <!-- Liste -->
        <div class="flex-1 overflow-y-auto p-4 min-h-0 overscroll-contain" style="touch-action: pan-y;">
          <PharmacyList
              :pharmacies="pharmacies"
              :is-loading="isLoading"
              :active-pharmacy="activePharmacy"
              @select="handlePharmacySelect"
          />
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Desktop liste paneli açılıp kapanma animasyonu */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.35s ease;
  overflow: hidden;
}
.slide-panel-enter-from,
.slide-panel-leave-to {
  width: 0 !important;
  opacity: 0;
}
.slide-panel-enter-to,
.slide-panel-leave-from {
  width: 800px;
  opacity: 1;
}
</style>