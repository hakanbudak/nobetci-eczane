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

function isMobile() {
  return window.innerWidth < 1024
}

function createPharmacyIcon(name: string, isActive: boolean): L.DivIcon {
  const bgColor = isActive ? '#FF0000' : '#FF0000'
  const borderColor = isActive ? '#FFFFFF' : '#FFFFFF'
  const scale = isActive ? 'transform: scale(1.1);' : ''

  return L.divIcon({
    html: `
      <div style="display: flex; align-items: center; gap: 4px; ${scale}">
          <div class="pharmacy-pin is-active">
          <span class="pulse-ring"></span>
          <span class="pin-core" style="background:${bgColor}; border-color:${borderColor};">E</span>
        </div>
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
    <div style="padding: 10px 12px 12px; min-width: 200px; max-width: 260px;">

      <!-- Başlık -->
      <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 10px;">
        <div style="
          width: 28px; height: 28px; min-width: 28px;
          background: linear-gradient(135deg, #ff0000, #ff0000);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(16,185,129,0.35);
        ">
          E
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 700; color: #f1f5f9; font-size: 12.5px; line-height: 1.3; margin-bottom: 2px; word-break: break-word;">
            ${pharmacy.name}
          </div>
          <div style="
            display: inline-block;
            font-size: 10px; font-weight: 600;
            color: #10b981;
            background: rgba(16,185,129,0.12);
            border: 1px solid rgba(16,185,129,0.2);
            border-radius: 4px;
            padding: 1px 6px;
          ">${pharmacy.district}</div>
        </div>
      </div>

      <!-- Adres -->
      <div style="
        display: flex; align-items: flex-start; gap: 6px;
        background: rgba(255,255,255,0.04);
        border-radius: 8px;
        padding: 7px 9px;
        margin-bottom: 10px;
      ">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 1px; flex-shrink: 0;">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span style="font-size: 11px; color: #ffffff; line-height: 1.45; word-break: break-word;">
          ${pharmacy.address}
        </span>
      </div>

      <!-- Aksiyon butonları -->
      <div style="display: flex; gap: 6px;">
        <a
          href="tel:${phone}"
          style="
            flex: 1;
            display: flex; align-items: center; justify-content: center; gap: 5px;
            font-size: 11.5px; font-weight: 600;
            color: #ffffff;
            background: #009018;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px;
            padding: 8px 6px;
            text-decoration: none;
            transition: all 0.15s;
          "
          onmouseover="this.style.background='#00cc22';"
          onmouseout="this.style.background='#009018';"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.68a16 16 0 0 0 6 6l.54-.54a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 18.92z"/>
          </svg>
          Ara
        </a>
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}"
          target="_blank"
          rel="noopener"
          style="
            flex: 1.6;
            display: flex; align-items: center; justify-content: center; gap: 5px;
            font-size: 11.5px; font-weight: 700;
            color: #ffffff;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            border: none;
            border-radius: 8px;
            padding: 8px 6px;
            text-decoration: none;
            box-shadow: 0 2px 10px rgba(37, 99, 235, 0.35);
            transition: all 0.15s;
          "
          onmouseover="this.style.boxShadow='0 4px 16px rgba(37, 99, 235, 0.55)'; this.style.transform='translateY(-1px)'"
          onmouseout="this.style.boxShadow='0 2px 10px rgba(37, 99, 235, 0.35)'; this.style.transform='translateY(0)'"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Yol Tarifi
        </a>
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

  if (isMobile()) {
    map.once('moveend', () => {
      map?.panBy([55, 135], { animate: true })
    })
  }

  const key = getMarkerKey(pharmacy)
  markerMap.get(key)?.openPopup()
}

function centerForMobile(lat: number, lng: number, zoom: number): void {
  if (!map) return
  map.setView([lat, lng], zoom, { animate: false })
  nextTick(() => {
    if (!map) return
    const vh = window.innerHeight
    // Bottom sheet başlangıç translateY = vh * 0.45
    // Haritanın kapatılan kısmı = vh - (vh * 0.45) = vh * 0.55
    // Konumu görünür alanın ortasına taşımak için yukarı kaydır
    const coveredBySheet = vh * 0.55
    const offsetY = Math.round(coveredBySheet / 2)
    map.panBy([0, offsetY], { animate: true, duration: 0.6 })
  })
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
        if (isMobile()) {
          centerForMobile(newLoc.lat, newLoc.lng, 13)
        } else {
          map.setView([newLoc.lat, newLoc.lng], 13, { animate: true, duration: 0.8 })
        }
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
    if (isMobile()) {
      centerForMobile(props.userLocation.lat, props.userLocation.lng, 13)
    } else {
      map.setView([props.userLocation.lat, props.userLocation.lng], 13)
    }
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

.pharmacy-marker,
.user-marker {
  background: transparent !important;
  border: none !important;
}

/* ==== Ayarlanabilir değerler ==== */
:root {
  --pharmacy-pulse-duration: 1.4s; /* hız */
  --pharmacy-pulse-size: 44px;     /* halka çapı */
  --pharmacy-pulse-opacity: 0.45;  /* başlangıç opaklığı */
}

/* Marker pin wrapper */
.pharmacy-pin {
  position: relative;
  width: 28px;
  height: 28px;
}

/* Asıl kare ikon (E) */
.pharmacy-pin .pin-core {
  position: relative;
  z-index: 2;
  width: 28px;
  height: 28px;
  border: 2px solid;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 900;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
}

/* Pulse halka */
.pharmacy-pin .pulse-ring {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  width: var(--pharmacy-pulse-size);
  height: var(--pharmacy-pulse-size);
  border-radius: 999px;
  background: rgba(255, 0, 0, var(--pharmacy-pulse-opacity));
  z-index: 1;
  opacity: 0;
}

/* Sadece aktif marker yanıp sönsün */
.pharmacy-pin.is-active .pulse-ring {
  animation: pharmacyPulse var(--pharmacy-pulse-duration) ease-out infinite;
}

/* Animasyon */
@keyframes pharmacyPulse {
  0%   { transform: translate(-50%, -50%) scale(0.35); opacity: 0.0; }
  25%  { opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.35); opacity: 0; }
}
</style>
