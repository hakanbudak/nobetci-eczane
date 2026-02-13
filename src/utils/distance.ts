import type { Coordinates } from '@/types/pharmacy'

const EARTH_RADIUS_KM = 6371

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
}

/**
 * Haversine formülü ile iki koordinat arasındaki mesafeyi km cinsinden hesaplar.
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
    const dLat = toRadians(to.lat - from.lat)
    const dLng = toRadians(to.lng - from.lng)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(from.lat)) *
        Math.cos(toRadians(to.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return Math.round(EARTH_RADIUS_KM * c * 10) / 10
}

/**
 * Mesafeyi okunabilir formata çevirir.
 * 1 km altı → metre, üstü → km
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)} m`
    }
    return `${km.toFixed(1)} km`
}
