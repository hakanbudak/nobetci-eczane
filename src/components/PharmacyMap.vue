<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { Pharmacy } from '@/types/pharmacy'
import type { Coordinates } from '@/types/pharmacy'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  pharmacies: Pharmacy[]
  userLocation?: Coordinates | null
  activePharmacy?: Pharmacy | null
}>()

const emit = defineEmits<{
  selectPharmacy: [pharmacy: Pharmacy]
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let markersGroup: L.LayerGroup | null = null
let userMarker: L.Marker | null = null
const markerMap = new Map<string, L.Marker>()

const pharmacyIcon = L.divIcon({
  html: `<div class="flex items-center justify-center w-8 h-8 bg-emerald-600 rounded-full shadow-lg border-2 border-white">
    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0V9H5a1 1 0 010-2h4V3a1 1 0 011-1z"/>
    </svg>
  </div>`,
  className: 'pharmacy-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -20],
})

const activePharmacyIcon = L.divIcon({
  html: `<div class="flex items-center justify-center w-10 h-10 bg-emerald-500 rounded-full shadow-xl border-3 border-white animate-pulse">
    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0V9H5a1 1 0 010-2h4V3a1 1 0 011-1z"/>
    </svg>
  </div>`,
  className: 'pharmacy-marker-active',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -24],
})

const userIcon = L.divIcon({
  html: `<div class="relative">
    <div class="w-4 h-4 bg-blue-500 rounded-full border-3 border-white shadow-lg"></div>
    <div class="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75"></div>
  </div>`,
  className: 'user-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

function getMarkerKey(pharmacy: Pharmacy): string {
  return `${pharmacy.name}__${pharmacy.location.lat}__${pharmacy.location.lng}`
}

function createPopupContent(pharmacy: Pharmacy): string {
  const phone = pharmacy.phone.replace(/\s/g, '')
  return `
    <div class="p-3 min-w-[180px]">
      <h3 class="font-semibold text-slate-800 text-sm mb-1">${pharmacy.name}</h3>
      <p class="text-xs text-emerald-600 font-medium mb-1">${pharmacy.district}</p>
      <p class="text-xs text-slate-500 mb-2 leading-relaxed">${pharmacy.address}</p>
      <div class="flex gap-1.5">
        <a href="tel:${phone}" class="flex-1 text-center text-xs font-semibold bg-emerald-50 text-emerald-600 rounded-lg py-1.5 hover:bg-emerald-100">📞 Ara</a>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}" target="_blank" rel="noopener" class="flex-1 text-center text-xs font-semibold bg-emerald-600 text-white rounded-lg py-1.5 hover:bg-emerald-700">🗺️ Git</a>
      </div>
    </div>
  `
}

function initMap(): void {
  if (!mapContainer.value || map) return

  const defaultCenter: L.LatLngExpression = [39.925, 32.866] // Ankara
  const defaultZoom = 6

  map = L.map(mapContainer.value, {
    zoomControl: false,
    attributionControl: false,
  }).setView(defaultCenter, defaultZoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
  }).addTo(map)

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  L.control
    .attribution({ position: 'bottomleft' })
    .addAttribution('© <a href="https://openstreetmap.org">OSM</a>')
    .addTo(map)

  markersGroup = L.layerGroup().addTo(map)
}

function updateMarkers(): void {
  if (!map || !markersGroup) return

  markersGroup.clearLayers()
  markerMap.clear()

  for (const pharmacy of props.pharmacies) {
    if (!pharmacy.location.lat || !pharmacy.location.lng) continue

    const isActive =
      props.activePharmacy?.name === pharmacy.name &&
      props.activePharmacy?.address === pharmacy.address

    const marker = L.marker([pharmacy.location.lat, pharmacy.location.lng], {
      icon: isActive ? activePharmacyIcon : pharmacyIcon,
    })

    marker.bindPopup(createPopupContent(pharmacy), {
      closeButton: false,
      maxWidth: 250,
    })

    marker.on('click', () => {
      emit('selectPharmacy', pharmacy)
    })

    markersGroup.addLayer(marker)
    markerMap.set(getMarkerKey(pharmacy), marker)
  }

  if (props.userLocation) {
    if (userMarker) {
      map.removeLayer(userMarker)
    }
    userMarker = L.marker([props.userLocation.lat, props.userLocation.lng], {
      icon: userIcon,
      zIndexOffset: 1000,
    })
      .bindPopup('<div class="p-2 text-xs font-medium text-blue-600">📍 Konumunuz</div>', {
        closeButton: false,
      })
      .addTo(map)
  }

  fitBounds()
}

function fitBounds(): void {
  if (!map || props.pharmacies.length === 0) return

  if (props.userLocation) {
    map.setView(
      [props.userLocation.lat, props.userLocation.lng],
      13, // Sokak seviyesi zoom
      { animate: true, duration: 0.8 }
    )
    return
  }

  const points: L.LatLngExpression[] = props.pharmacies
    .filter((p) => p.location.lat && p.location.lng)
    .map((p) => [p.location.lat, p.location.lng])

  if (points.length > 0) {
    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
  }
}

function focusOnPharmacy(pharmacy: Pharmacy): void {
  if (!map) return

  map.setView([pharmacy.location.lat, pharmacy.location.lng], 16, {
    animate: true,
    duration: 0.5,
  })

  const key = getMarkerKey(pharmacy)
  const marker = markerMap.get(key)
  if (marker) {
    marker.openPopup()
  }
}

watch(
  () => props.pharmacies,
  () => {
    nextTick(() => updateMarkers())
  },
  { deep: true }
)

watch(
  () => props.activePharmacy,
  (newPharmacy) => {
    if (newPharmacy) {
      // Marker ikonlarını güncelle
      updateMarkers()
      focusOnPharmacy(newPharmacy)
    }
  }
)

watch(
  () => props.userLocation,
  () => {
    nextTick(() => updateMarkers())
  }
)

onMounted(() => {
  initMap()
  if (props.pharmacies.length > 0) {
    updateMarkers()
  }
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})

defineExpose({ focusOnPharmacy })
</script>

<template>
  <div ref="mapContainer" class="w-full h-full rounded-xl overflow-hidden" />
</template>

<style>
.pharmacy-marker,
.pharmacy-marker-active,
.user-marker {
  background: transparent !important;
  border: none !important;
}
</style>
