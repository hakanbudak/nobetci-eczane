export interface Coordinates {
    lat: number
    lng: number
}

export interface Pharmacy {
    name: string
    district: string
    address: string
    phone: string
    phone2?: string | null
    location: Coordinates
    distance?: number
}

export interface PharmacyDayGroup {
    day: string
    date: string
    count: number
    pharmacies: PharmacyApiItem[]
}

export interface PharmacyApiResponse {
    success: boolean
    data: PharmacyDayGroup[]
}

export interface PharmacyApiItem {
    id: string
    name: string
    address: string
    phone: string
    phone2: string | null
    location: {
        latitude: number
        longitude: number
    }
    city: {
        id: string
        name: string
        slug: string
    }
    district: {
        id: string
        name: string
        slug: string
    }
    duty: {
        date: string
        startTime: string | null
        endTime: string | null
        isVerified: boolean
    }
}
