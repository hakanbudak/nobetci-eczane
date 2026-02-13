

interface CityCenter {
    slug: string
    name: string
    lat: number
    lng: number
}

const cityCenters: CityCenter[] = [
    { slug: 'istanbul', name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
    { slug: 'ankara', name: 'Ankara', lat: 39.9334, lng: 32.8597 },
    { slug: 'izmir', name: 'İzmir', lat: 38.4237, lng: 27.1428 },
    { slug: 'bursa', name: 'Bursa', lat: 40.1885, lng: 29.0610 },
    { slug: 'antalya', name: 'Antalya', lat: 36.8969, lng: 30.7133 },
    { slug: 'adana', name: 'Adana', lat: 37.0017, lng: 35.3289 },
    { slug: 'konya', name: 'Konya', lat: 37.8746, lng: 32.4932 },
    { slug: 'gaziantep', name: 'Gaziantep', lat: 37.0594, lng: 37.3825 },
    { slug: 'mersin', name: 'Mersin', lat: 36.8121, lng: 34.6415 },
    { slug: 'diyarbakir', name: 'Diyarbakır', lat: 37.9144, lng: 40.2306 },
    { slug: 'kayseri', name: 'Kayseri', lat: 38.7312, lng: 35.4787 },
    { slug: 'eskisehir', name: 'Eskişehir', lat: 39.7767, lng: 30.5206 },
    { slug: 'sanliurfa', name: 'Şanlıurfa', lat: 37.1674, lng: 38.7955 },
    { slug: 'samsun', name: 'Samsun', lat: 41.2867, lng: 36.3300 },
    { slug: 'denizli', name: 'Denizli', lat: 37.7765, lng: 29.0864 },
    { slug: 'trabzon', name: 'Trabzon', lat: 41.0027, lng: 39.7168 },
    { slug: 'hatay', name: 'Hatay', lat: 36.4018, lng: 36.3498 },
    { slug: 'manisa', name: 'Manisa', lat: 38.6191, lng: 27.4289 },
    { slug: 'kocaeli', name: 'Kocaeli', lat: 40.8533, lng: 29.8815 },
    { slug: 'malatya', name: 'Malatya', lat: 38.3552, lng: 38.3095 },
    { slug: 'balikesir', name: 'Balıkesir', lat: 39.6484, lng: 27.8826 },
    { slug: 'erzurum', name: 'Erzurum', lat: 39.9054, lng: 41.2658 },
    { slug: 'sakarya', name: 'Sakarya', lat: 40.6940, lng: 30.4358 },
    { slug: 'tekirdag', name: 'Tekirdağ', lat: 41.0068, lng: 27.5115 },
    { slug: 'mugla', name: 'Muğla', lat: 37.2153, lng: 28.3636 },
    { slug: 'van', name: 'Van', lat: 38.4891, lng: 43.3800 },
    { slug: 'mardin', name: 'Mardin', lat: 37.3212, lng: 40.7245 },
    { slug: 'aydin', name: 'Aydın', lat: 37.8560, lng: 27.8416 },
    { slug: 'kahramanmaras', name: 'Kahramanmaraş', lat: 37.5858, lng: 36.9371 },
    { slug: 'ordu', name: 'Ordu', lat: 40.9839, lng: 37.8764 },
    { slug: 'sivas', name: 'Sivas', lat: 39.7477, lng: 37.0179 },
    { slug: 'afyonkarahisar', name: 'Afyonkarahisar', lat: 38.7507, lng: 30.5567 },
    { slug: 'tokat', name: 'Tokat', lat: 40.3167, lng: 36.5544 },
    { slug: 'elazig', name: 'Elazığ', lat: 38.6810, lng: 39.2264 },
    { slug: 'corum', name: 'Çorum', lat: 40.5506, lng: 34.9556 },
    { slug: 'edirne', name: 'Edirne', lat: 41.6771, lng: 26.5557 },
    { slug: 'rize', name: 'Rize', lat: 41.0208, lng: 40.5218 },
    { slug: 'agri', name: 'Ağrı', lat: 39.7191, lng: 43.0503 },
    { slug: 'amasya', name: 'Amasya', lat: 40.6499, lng: 35.8353 },
    { slug: 'kutahya', name: 'Kütahya', lat: 39.4168, lng: 29.9833 },
    { slug: 'batman', name: 'Batman', lat: 37.8812, lng: 41.1351 },
    { slug: 'yozgat', name: 'Yozgat', lat: 39.8181, lng: 34.8147 },
    { slug: 'zonguldak', name: 'Zonguldak', lat: 41.4564, lng: 31.7987 },
    { slug: 'aksaray', name: 'Aksaray', lat: 38.3687, lng: 34.0370 },
    { slug: 'giresun', name: 'Giresun', lat: 40.9128, lng: 38.3895 },
    { slug: 'usak', name: 'Uşak', lat: 38.6823, lng: 29.4082 },
    { slug: 'isparta', name: 'Isparta', lat: 37.7648, lng: 30.5566 },
    { slug: 'nigde', name: 'Niğde', lat: 37.9667, lng: 34.6833 },
    { slug: 'bolu', name: 'Bolu', lat: 40.7176, lng: 31.6056 },
    { slug: 'kastamonu', name: 'Kastamonu', lat: 41.3887, lng: 33.7827 },
    { slug: 'cankiri', name: 'Çankırı', lat: 40.6013, lng: 33.6134 },
    { slug: 'canakkale', name: 'Çanakkale', lat: 40.1553, lng: 26.4142 },
    { slug: 'nevsehir', name: 'Nevşehir', lat: 38.6939, lng: 34.6857 },
    { slug: 'sinop', name: 'Sinop', lat: 42.0231, lng: 35.1531 },
    { slug: 'siirt', name: 'Siirt', lat: 37.9333, lng: 41.9500 },
    { slug: 'burdur', name: 'Burdur', lat: 37.7203, lng: 30.2908 },
    { slug: 'erzincan', name: 'Erzincan', lat: 39.7500, lng: 39.5000 },
    { slug: 'karaman', name: 'Karaman', lat: 37.1815, lng: 33.2150 },
    { slug: 'kirikkale', name: 'Kırıkkale', lat: 39.8468, lng: 33.5153 },
    { slug: 'kirsehir', name: 'Kırşehir', lat: 39.1425, lng: 34.1709 },
    { slug: 'kirklareli', name: 'Kırklareli', lat: 41.7333, lng: 27.2167 },
    { slug: 'osmaniye', name: 'Osmaniye', lat: 37.0746, lng: 36.2464 },
    { slug: 'duzce', name: 'Düzce', lat: 40.8438, lng: 31.1565 },
    { slug: 'bitlis', name: 'Bitlis', lat: 38.3938, lng: 42.1232 },
    { slug: 'adiyaman', name: 'Adıyaman', lat: 37.7648, lng: 38.2786 },
    { slug: 'bingol', name: 'Bingöl', lat: 38.8854, lng: 40.4966 },
    { slug: 'mus', name: 'Muş', lat: 38.9462, lng: 41.7539 },
    { slug: 'tunceli', name: 'Tunceli', lat: 39.1079, lng: 39.5401 },
    { slug: 'yalova', name: 'Yalova', lat: 40.6500, lng: 29.2667 },
    { slug: 'karabuk', name: 'Karabük', lat: 41.2061, lng: 32.6204 },
    { slug: 'bilecik', name: 'Bilecik', lat: 40.0567, lng: 30.0153 },
    { slug: 'bartin', name: 'Bartın', lat: 41.6344, lng: 32.3375 },
    { slug: 'sirnak', name: 'Şırnak', lat: 37.4187, lng: 42.4918 },
    { slug: 'artvin', name: 'Artvin', lat: 41.1828, lng: 41.8183 },
    { slug: 'kars', name: 'Kars', lat: 40.6167, lng: 43.1000 },
    { slug: 'igdir', name: 'Iğdır', lat: 39.9237, lng: 44.0450 },
    { slug: 'ardahan', name: 'Ardahan', lat: 41.1105, lng: 42.7022 },
    { slug: 'bayburt', name: 'Bayburt', lat: 40.2552, lng: 40.2249 },
    { slug: 'gumushane', name: 'Gümüşhane', lat: 40.4386, lng: 39.5086 },
    { slug: 'hakkari', name: 'Hakkari', lat: 37.5833, lng: 43.7333 },
    { slug: 'kilis', name: 'Kilis', lat: 36.7184, lng: 37.1212 },
]

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

export interface NearestCity {
    name: string
    slug: string
    distance: number
}

/**
 * Kullanıcı koordinatlarına en yakın şehri bulur
 */
export function findNearestCity(lat: number, lng: number): NearestCity {
    let nearest: CityCenter = cityCenters[0]!
    let minDist = Infinity

    for (const city of cityCenters) {
        const dist = haversineDistance(lat, lng, city.lat, city.lng)
        if (dist < minDist) {
            minDist = dist
            nearest = city
        }
    }

    return {
        name: nearest.name,
        slug: nearest.slug,
        distance: Math.round(minDist * 10) / 10,
    }
}
