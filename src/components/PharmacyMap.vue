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

function createPharmacyIcon(name: string, isActive: boolean): L.DivIcon {
  const bgColor = isActive ? '#FF0000' : '#FF0000'
  const borderColor = isActive ? '#60a5fa' : '#3b82f6'
  const scale = isActive ? 'transform: scale(1.1);' : ''

  return L.divIcon({
    html: `
      <div style="display: flex; align-items: center; gap: 4px; ${scale}">
        <div style="
          width: 28px; height: 28px;
          background: ${bgColor};
          border: 2px solid ${borderColor};
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 900; font-size: 14px;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        ">E</div>
        <span class="pharmacy-label">${name}</span>
      </div>
    `,
    className: 'pharmacy-marker',
    iconSize: [200, 32],
    iconAnchor: [14, 16],
    popupAnchor: [80, -20],
  })
}

const userIcon = L.divIcon({
  html: `<div style="position: relative;">
    <div style="width: 14px; height: 14px; background: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>
    <div style="position: absolute; inset: 0; width: 14px; height: 14px; background: #60a5fa; border-radius: 50%; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite; opacity: 0.6;"></div>
  </div>`,
  className: 'user-marker',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

function getMarkerKey(pharmacy: Pharmacy): string {
  return `${pharmacy.name}__${pharmacy.location.lat}__${pharmacy.location.lng}`
}

function createPopupContent(pharmacy: Pharmacy): string {
  const phone = pharmacy.phone.replace(/\s/g, '')
  return `
    <div style="padding: 12px; min-width: 180px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <div style="width: 24px; height: 24px; background: #FF0000; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 12px;">E</div>
        <h3 style="font-weight: 700; color: #f1f5f9; font-size: 13px; margin: 0;">${pharmacy.name}</h3>
      </div>
      <p style="font-size: 11px; color: #60a5fa; font-weight: 600; margin: 0 0 4px 0;">${pharmacy.district}</p>
      <p style="font-size: 11px; color: #94a3b8; margin: 0 0 10px 0; line-height: 1.4;">${pharmacy.address}</p>
      <div style="display: flex; gap: 6px;">
        <a href="tel:${phone}" style="flex: 1; text-align: center; font-size: 11px; font-weight: 600; background: rgba(37,99,235,0.2); color: #60a5fa; border-radius: 8px; padding: 6px; text-decoration: none;">📞 Ara</a>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}" target="_blank" rel="noopener" style="flex: 1; text-align: center; font-size: 11px; font-weight: 600; background: #2563eb; color: white; border-radius: 8px; padding: 6px; text-decoration: none;">🗺️ Git</a>
      </div>
    </div>
  `
}

function initMap(): void {
  if (!mapContainer.value || map) return

  const defaultCenter: L.LatLngExpression = [39.925, 32.866]
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
      icon: createPharmacyIcon(pharmacy.name, isActive),
    })

    marker.bindPopup(createPopupContent(pharmacy), {
      closeButton: false,
      maxWidth: 260,
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
      .bindPopup('<div style="padding: 8px; font-size: 11px; font-weight: 600; color: #60a5fa;">📍 Konumunuz</div>', {
        closeButton: false,
      })
      .addTo(map)
  }

  fitBounds()
}

const lastUserLocationTime = ref(0)

function fitBounds(): void {
  if (!map || props.pharmacies.length === 0) return

  if (Date.now() - lastUserLocationTime.value < 2000) {
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
      updateMarkers()
      focusOnPharmacy(newPharmacy)
    }
  }
)

watch(
  () => props.userLocation,
  (newLoc) => {
    if (newLoc && map) {
       lastUserLocationTime.value = Date.now()
       
       map.setView([newLoc.lat, newLoc.lng], 15, { animate: true, duration: 1.0 })
       
       nextTick(() => updateMarkers())
    } else {
       nextTick(() => updateMarkers())
    }
  }
)

onMounted(() => {
  initMap()
  if (props.userLocation && map) {
     lastUserLocationTime.value = Date.now()
     map.setView([props.userLocation.lat, props.userLocation.lng], 15)
  }
  
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
  <div ref="mapContainer" class="w-full h-full" />
</template>

<style>
.pharmacy-marker,
.user-marker {
  background: transparent !important;
  border: none !important;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
