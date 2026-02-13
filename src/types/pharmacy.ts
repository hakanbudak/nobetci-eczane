export interface Coordinates {
    lat: number
    lng: number
}

export interface Pharmacy {
    name: string
    district: string
    address: string
    phone: string
    location: Coordinates
    distance?: number
}

export interface PharmacyApiResponse {
    success: boolean
    result: PharmacyApiItem[]
}

export interface PharmacyApiItem {
    name: string
    dist: string
    address: string
    phone: string
    loc: string
}
