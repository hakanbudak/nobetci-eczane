import { ref } from 'vue'
import type { Pharmacy, PharmacyApiItem, Coordinates } from '@/types/pharmacy'
import { calculateDistance } from '@/utils/distance'

const ECZANE_API_BASE = '/api/eczane'
const API_KEY = import.meta.env.VITE_COLLECT_API_KEY as string | undefined

interface PharmacyCache {
    data: Pharmacy[]
    timestamp: number
    key: string
}

const cache = ref<PharmacyCache | null>(null)
const CACHE_DURATION = 1000 * 60 * 60 // 1 saat

function mapApiItemToPharmacy(item: PharmacyApiItem): Pharmacy {
    return {
        name: item.name,
        district: item.district.name,
        address: item.address,
        phone: item.phone,
        phone2: item.phone2,
        location: {
            lat: item.location.latitude,
            lng: item.location.longitude,
        },
    }
}

function getCacheKey(citySlug: string, districtSlug?: string): string {
    return districtSlug ? `${citySlug}__${districtSlug}` : citySlug
}

export function usePharmacy() {
    const pharmacies = ref<Pharmacy[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    async function fetchPharmacies(citySlug: string, districtSlug?: string): Promise<void> {
        const cacheKey = getCacheKey(citySlug, districtSlug)

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
            let url = `${ECZANE_API_BASE}/pharmacies/on-duty?city=${encodeURIComponent(citySlug)}`
            if (districtSlug) {
                url += `&district=${encodeURIComponent(districtSlug)}`
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            }

            if (API_KEY) {
                headers['X-API-Key'] = API_KEY
            }

            const response = await fetch(url, { headers })

            if (!response.ok) {
                throw new Error(`API hatası: ${response.status}`)
            }

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error || 'API başarısız yanıt döndü.')
            }

            // data is an array of day groups: [{day: "Dün", pharmacies: [...]}, {day: "Bugün", pharmacies: [...]}]
            const dayGroups = data.data || []
            const todayGroup = dayGroups.find((g: { day: string }) => g.day === 'Bugün') || dayGroups[dayGroups.length - 1]
            const rawPharmacies: PharmacyApiItem[] = todayGroup?.pharmacies || []

            // API returns duplicates (ALL CAPS short entry + detailed entry with same phone).
            // Deduplicate by phone, keeping the entry with the longer address.
            const phoneMap = new Map<string, PharmacyApiItem>()
            for (const p of rawPharmacies) {
                const normalizedPhone = p.phone?.replace(/[\s\-()]/g, '') || p.id
                const existing = phoneMap.get(normalizedPhone)
                if (!existing || (p.address?.length || 0) > (existing.address?.length || 0)) {
                    phoneMap.set(normalizedPhone, p)
                }
            }
            const result = Array.from(phoneMap.values())
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
