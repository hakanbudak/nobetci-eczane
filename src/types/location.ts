export interface City {
    name: string
    slug: string
    plateCode: number
    districts: District[]
}

export interface District {
    name: string
    slug: string
}

export type GeolocationStatus =
    | 'idle'
    | 'requesting'
    | 'granted'
    | 'denied'
    | 'unavailable'
