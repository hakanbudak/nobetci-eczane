import { ref } from 'vue'
import type { Pharmacy, PharmacyApiItem, Coordinates } from '@/types/pharmacy'
import { calculateDistance } from '@/utils/distance'

const COLLECT_API_BASE = 'https://api.collectapi.com/health'
const API_KEY = import.meta.env.VITE_COLLECT_API_KEY as string | undefined

interface PharmacyCache {
    data: Pharmacy[]
    timestamp: number
    key: string
}

const cache = ref<PharmacyCache | null>(null)
const CACHE_DURATION = 1000 * 60 * 60 // 1 saat

function parseLocation(loc: string): Coordinates {
    const parts = loc.split(',')
    return {
        lat: parseFloat(parts[0] ?? '0') || 0,
        lng: parseFloat(parts[1] ?? '0') || 0,
    }
}

function mapApiItemToPharmacy(item: PharmacyApiItem): Pharmacy {
    return {
        name: item.name,
        district: item.dist,
        address: item.address,
        phone: item.phone,
        location: parseLocation(item.loc),
    }
}

function getCacheKey(city: string, district?: string): string {
    return district ? `${city}__${district}` : city
}

export function usePharmacy() {
    const pharmacies = ref<Pharmacy[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    async function fetchPharmacies(city: string, district?: string): Promise<void> {
        const cacheKey = getCacheKey(city, district)

        if (
            cache.value &&
            cache.value.key === cacheKey &&
            Date.now() - cache.value.timestamp < CACHE_DURATION
        ) {
            pharmacies.value = cache.value.data
            return
        }

        isLoading.value = true
        error.value = null

        try {
            let url = `${COLLECT_API_BASE}/dutyPharmacy?il=${encodeURIComponent(city)}`
            if (district) {
                url += `&ilce=${encodeURIComponent(district)}`
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            }

            if (API_KEY) {
                headers['authorization'] = API_KEY
            }

            const response = await fetch(url, { headers })

            if (!response.ok) {
                throw new Error(`API hatası: ${response.status}`)
            }

            const data = await response.json()

            if (!data.success) {
                throw new Error('API başarısız yanıt döndü.')
            }

            const result: PharmacyApiItem[] = data.result || []
            pharmacies.value = result.map(mapApiItemToPharmacy)

            cache.value = {
                data: pharmacies.value,
                timestamp: Date.now(),
                key: cacheKey,
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Bilinmeyen hata'
            error.value = `Eczane verileri alınamadı: ${message}`
            pharmacies.value = []
        } finally {
            isLoading.value = false
        }
    }

    function sortByDistance(userLocation: Coordinates): void {
        pharmacies.value = pharmacies.value
            .map((pharmacy) => ({
                ...pharmacy,
                distance: calculateDistance(userLocation, pharmacy.location),
            }))
            .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    }

    function clearError(): void {
        error.value = null
    }

    return {
        pharmacies,
        isLoading,
        error,
        fetchPharmacies,
        sortByDistance,
        clearError,
    }
}
