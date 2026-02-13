import { ref } from 'vue'
import type { Coordinates } from '@/types/pharmacy'
import type { GeolocationStatus } from '@/types/location'

export function useGeolocation() {
    const coordinates = ref<Coordinates | null>(null)
    const status = ref<GeolocationStatus>('idle')
    const errorMessage = ref<string | null>(null)

    function requestLocation(): Promise<Coordinates | null> {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                status.value = 'unavailable'
                errorMessage.value = 'Tarayıcınız konum özelliğini desteklemiyor.'
                resolve(null)
                return
            }

            status.value = 'requesting'

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords: Coordinates = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }
                    coordinates.value = coords
                    status.value = 'granted'
                    errorMessage.value = null
                    resolve(coords)
                },
                (error) => {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            status.value = 'denied'
                            errorMessage.value = 'Konum izni reddedildi.'
                            break
                        case error.POSITION_UNAVAILABLE:
                            status.value = 'unavailable'
                            errorMessage.value = 'Konum bilgisi alınamadı.'
                            break
                        case error.TIMEOUT:
                            status.value = 'unavailable'
                            errorMessage.value = 'Konum isteği zaman aşımına uğradı.'
                            break
                        default:
                            status.value = 'unavailable'
                            errorMessage.value = 'Bilinmeyen bir hata oluştu.'
                    }
                    resolve(null)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000, // 5 dakika cache
                }
            )
        })
    }

    return {
        coordinates,
        status,
        errorMessage,
        requestLocation,
    }
}
