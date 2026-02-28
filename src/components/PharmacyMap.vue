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
  /** Mobilde Bottom Sheet'in kapattığı piksel yüksekliği (görünür alana göre merkez için) */
  bottomPadding?: number
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
  const hasPhone = phone.length > 0
  return `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-width: 230px; max-width: 275px;
      overflow: hidden;
      border-radius: 14px;
    ">
      <!-- Gradient başlık şeridi -->
      <div style="
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
        padding: 12px 14px 11px;
        position: relative;
        overflow: hidden;
      ">
        <!-- Dekoratif daireler -->
        <div style="position:absolute;top:-20px;right:-20px;width:75px;height:75px;background:rgba(255,255,255,0.08);border-radius:50%;pointer-events:none;"></div>
        <div style="position:absolute;bottom:-28px;left:25px;width:60px;height:60px;background:rgba(255,255,255,0.05);border-radius:50%;pointer-events:none;"></div>

        <div style="display:flex;align-items:flex-start;gap:10px;position:relative;">
          <!-- + ikonu -->
          <div style="
            width:38px;height:38px;min-width:38px;
            background:rgba(255,255,255,0.18);
            border-radius:11px;
            display:flex;align-items:center;justify-content:center;
            border:1.5px solid rgba(255,255,255,0.30);
            font-weight:900;font-size:20px;color:#fff;
            box-shadow:0 2px 10px rgba(0,0,0,0.25);
            line-height:1;
          ">+</div>

          <div style="flex:1;min-width:0;">
            <div style="
              font-weight:700;font-size:13px;color:#fff;
              line-height:1.35;word-break:break-word;
              margin-bottom:6px;
            ">${pharmacy.name}</div>

            <div style="display:flex;gap:5px;flex-wrap:wrap;">
              <span style="
                font-size:10px;font-weight:600;
                background:rgba(255,255,255,0.20);
                color:#fff;border-radius:20px;
                padding:2px 8px;
                border:1px solid rgba(255,255,255,0.25);
              ">📍 ${pharmacy.district}</span>
              <span style="
                font-size:10px;font-weight:700;
                background:rgba(16,185,129,0.80);
                color:#fff;border-radius:20px;
                padding:2px 8px;
              ">✦ Nöbetçi</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Koyu gövde -->
      <div style="background:#1e293b;padding:11px 13px 12px;">

        <!-- Adres -->
        <div style="
          display:flex;align-items:flex-start;gap:8px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:9px;padding:8px 10px;
          margin-bottom:${hasPhone ? '7px' : '10px'};
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top:2px;flex-shrink:0;">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span style="font-size:11.5px;color:#cbd5e1;line-height:1.5;word-break:break-word;">${pharmacy.address}</span>
        </div>

        ${hasPhone ? `
        <!-- Telefon -->
        <div style="
          display:flex;align-items:center;gap:8px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:9px;padding:8px 10px;
          margin-bottom:10px;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.68a16 16 0 0 0 6 6l.54-.54a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 18.92z"/>
          </svg>
          <span style="font-size:12px;color:#cbd5e1;letter-spacing:0.3px;">${pharmacy.phone}</span>
        </div>
        ` : ''}

        <!-- Butonlar -->
        <div style="display:flex;gap:7px;">
          ${hasPhone ? `
          <a href="tel:${phone}" style="
            flex:1;display:flex;align-items:center;justify-content:center;gap:5px;
            font-size:12px;font-weight:700;color:#fff;
            background:linear-gradient(135deg,#059669,#047857);
            border-radius:9px;padding:9px 6px;text-decoration:none;
            box-shadow:0 2px 8px rgba(5,150,105,0.35);
          "
          onmouseover="this.style.filter='brightness(1.1)';this.style.transform='translateY(-1px)';"
          onmouseout="this.style.filter='brightness(1)';this.style.transform='translateY(0)';">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.68a16 16 0 0 0 6 6l.54-.54a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 18.92z"/>
            </svg>
            Ara
          </a>
          ` : ''}
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}"
            target="_blank" rel="noopener"
            style="
              flex:${hasPhone ? '1.5' : '1'};
              display:flex;align-items:center;justify-content:center;gap:5px;
              font-size:12px;font-weight:700;color:#fff;
              background:linear-gradient(135deg,#2563eb,#1d4ed8);
              border-radius:9px;padding:9px 6px;text-decoration:none;
              box-shadow:0 2px 8px rgba(37,99,235,0.35);
            "
            onmouseover="this.style.filter='brightness(1.1)';this.style.transform='translateY(-1px)';"
            onmouseout="this.style.filter='brightness(1)';this.style.transform='translateY(0)';"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
            Yol Tarifi
          </a>
        </div>
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
      maxWidth: 250,
      autoPan: false,  // panBy'ı ezmemesi için popup kendi kaydırma yapmasın
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

/**
 * Sadece aktif/inaktif marker ikonlarını yeniler.
 * clearLayers ve fitBounds ÇAĞIRMAZ — zoom'u bozmaz.
 */
function refreshActiveIcon(): void {
  if (!markersGroup) return
  markersGroup.eachLayer((layer) => {
    const marker = layer as L.Marker
    // Marker'ın hangi eczaneye ait olduğunu bul
    for (const pharmacy of props.pharmacies) {
      if (
        marker.getLatLng().lat === pharmacy.location.lat &&
        marker.getLatLng().lng === pharmacy.location.lng
      ) {
        const isActive =
          props.activePharmacy?.name === pharmacy.name &&
          props.activePharmacy?.address === pharmacy.address
        marker.setIcon(createPharmacyIcon(pharmacy.name, isActive))
        break
      }
    }
  })
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
    const bp = props.bottomPadding ?? 0
    map.fitBounds(bounds, {
      paddingTopLeft: [40, 40],
      paddingBottomRight: [20, 20 + bp],
      maxZoom: 15,
    })
  }
}

function focusOnPharmacy(pharmacy: Pharmacy): void {
  if (!map) return

  map.setView([pharmacy.location.lat, pharmacy.location.lng], 14, {
    animate: false,
  })

  // Önce popup'ı aç (autoPan:false olduğu için haritayı kaydırmaz)
  const key = getMarkerKey(pharmacy)
  markerMap.get(key)?.openPopup()

  // panBy EN SON çalışmalı; requestAnimationFrame ile popup render'ından sonraya al
  const bp = props.bottomPadding ?? 0
  if (bp > 0) {
    requestAnimationFrame(() => {
      // Y: yukarı kaydır (bottom sheet için), X: sola hafifçe kaydır (popup ortalaması)
      map?.panBy([50, bp / 5.5], { animate: true, duration: 0.5 })
    })
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
      nextTick(() => {
        // Sadece ikonları güncelle — fitBounds tetikleme, zoom bozulmasın
        refreshActiveIcon()
        focusOnPharmacy(newPharmacy)
      })
    }
  }
)

watch(
  () => props.userLocation,
  (newLoc) => {
    if (newLoc && map) {
       lastUserLocationTime.value = Date.now()
       map.invalidateSize()
       map.setView([newLoc.lat, newLoc.lng], 14, { animate: false })
       // Görünür alan = tam konteyner - bottomPadding; merkezi yukarı kaydır
       const bp = props.bottomPadding ?? 0
       if (bp > 0) {
         map.panBy([0, bp / 2], { animate: true, duration: 0.8 })
       }

       nextTick(() => updateMarkers())
    } else {
       nextTick(() => updateMarkers())
    }
  }
)

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  initMap()

  if (mapContainer.value && map) {
    resizeObserver = new ResizeObserver(() => {
      map?.invalidateSize()
    })
    resizeObserver.observe(mapContainer.value)
  }

  setTimeout(() => {
    map?.invalidateSize()
  }, 300)

  if (props.userLocation && map) {
     lastUserLocationTime.value = Date.now()
     map.setView([props.userLocation.lat, props.userLocation.lng], 14, { animate: false })
     const bp = props.bottomPadding ?? 0
     if (bp > 0) {
       map.panBy([0, bp / 2], { animate: false })
     }
  }

  if (props.pharmacies.length > 0) {
    updateMarkers()
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  if (map) {
    map.remove()
    map = null
  }
})

function triggerResize(): void {
  map?.invalidateSize()
}

/** Şehir/ilçe değişince HomeView'dan çağrılır — time guard'ı bypass ederek fitBounds çalıştırır */
function zoomToPharmacies(): void {
  lastUserLocationTime.value = 0  // guard'ı sıfırla
  fitBounds()
}

defineExpose({ focusOnPharmacy, triggerResize, zoomToPharmacies })
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

/* Leaflet popup kapsayıcısını sıfırla — kendi tasarımımız yönetsin */
.leaflet-popup-content-wrapper {
  background: transparent !important;
  border: none !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3) !important;
  padding: 0 !important;
  border-radius: 14px !important;
  overflow: hidden !important;
}

.leaflet-popup-content {
  margin: 0 !important;
  line-height: 1 !important;
}

/* Popup ok (▼) şeffaf renk */
.leaflet-popup-tip {
  background: #1e293b !important;
  box-shadow: none !important;
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
