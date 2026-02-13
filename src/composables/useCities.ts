import { computed } from 'vue'
import { cities } from '@/data/cities'
import type { City, District } from '@/types/location'

export function useCities() {
    const allCities = computed(() => cities)

    const citySlugMap = computed(() => {
        const map = new Map<string, City>()
        for (const city of cities) {
            map.set(city.slug, city)
        }
        return map
    })

    const slugToNameMap = computed(() => {
        const map = new Map<string, string>()
        for (const city of cities) {
            map.set(city.slug, city.name)
            for (const district of city.districts) {
                map.set(`${city.slug}__${district.slug}`, district.name)
            }
        }
        return map
    })

    function getCityBySlug(slug: string): City | undefined {
        return citySlugMap.value.get(slug)
    }

    function getDistrictBySlug(citySlug: string, districtSlug: string): District | undefined {
        const city = getCityBySlug(citySlug)
        if (!city) return undefined
        return city.districts.find((d) => d.slug === districtSlug)
    }

    function getCityName(slug: string): string {
        return slugToNameMap.value.get(slug) || slug
    }

    function getDistrictName(citySlug: string, districtSlug: string): string {
        return slugToNameMap.value.get(`${citySlug}__${districtSlug}`) || districtSlug
    }

    function searchCities(query: string): City[] {
        if (!query.trim()) return cities
        const normalizedQuery = query.toLowerCase().trim()
        return cities.filter(
            (city) =>
                city.name.toLowerCase().includes(normalizedQuery) ||
                city.slug.includes(normalizedQuery)
        )
    }

    return {
        allCities,
        getCityBySlug,
        getDistrictBySlug,
        getCityName,
        getDistrictName,
        searchCities,
    }
}
