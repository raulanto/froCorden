// composables/useCoordinateAPI.ts
export const useCoordinateAPI = () => {

    const { public: { apiKey: apiUrl } } = useRuntimeConfig();
    // Convertir a Web Mercator
    const convertToWebMercator = async (latitude: number, longitude: number) => {
        try {
            const response = await $fetch(`${apiUrl}/api/coordinates/convert/web-mercator/`, {
                method: 'POST',
                body: { latitude, longitude }
            })
            return response
        } catch (error) {
            console.error('Error converting to Web Mercator:', error)
            throw error
        }
    }

    // Convertir a UTM
    const convertToUTM = async (latitude: number, longitude: number) => {
        try {
            const response = await $fetch(`${apiUrl}/api/coordinates/convert/utm/`, {
                method: 'POST',
                body: { latitude, longitude }
            })
            return response
        } catch (error) {
            console.error('Error converting to UTM:', error)
            throw error
        }
    }

    // Convertir desde Web Mercator
    const convertFromWebMercator = async (x: number, y: number) => {
        try {
            const response = await $fetch(`${apiUrl}/api/coordinates/convert/from-web-mercator/`, {
                method: 'POST',
                body: { x, y }
            })
            return response
        } catch (error) {
            console.error('Error converting from Web Mercator:', error)
            throw error
        }
    }

    // Calcular distancia
    const calculateDistance = async (
        point1_lat: number,
        point1_lon: number,
        point2_lat: number,
        point2_lon: number,
        unit: 'km' | 'miles' | 'meters' = 'km'
    ) => {
        try {
            const response = await $fetch(`${apiUrl}/api/coordinates/distance/`, {
                method: 'POST',
                body: { point1_lat, point1_lon, point2_lat, point2_lon, unit }
            })
            return response
        } catch (error) {
            console.error('Error calculating distance:', error)
            throw error
        }
    }

    // Calcular bounding box
    const calculateBoundingBox = async (
        center_lat: number,
        center_lon: number,
        radius_km: number
    ) => {
        try {
            const response = await $fetch(`${apiUrl}/api/coordinates/bounding-box/`, {
                method: 'POST',
                body: { center_lat, center_lon, radius_km }
            })
            return response
        } catch (error) {
            console.error('Error calculating bounding box:', error)
            throw error
        }
    }

    // Conversión por lotes
    const batchConvert = async (
        coordinates: Array<{ latitude: number; longitude: number }>,
        to_system: 'web_mercator' | 'utm'
    ) => {
        try {
            const response = await $fetch(`${apiUrl}/api/coordinates/batch-convert/`, {
                method: 'POST',
                body: { coordinates, to_system }
            })
            return response
        } catch (error) {
            console.error('Error in batch conversion:', error)
            throw error
        }
    }

    // Información completa de coordenada
    const getCoordinateInfo = async (lat: number, lon: number) => {
        try {
            const response = await $fetch(`${apiUrl}/api/coordinates/info/`, {
                method: 'GET',
                params: { lat, lon }
            })
            return response
        } catch (error) {
            console.error('Error getting coordinate info:', error)
            throw error
        }
    }

    return {
        convertToWebMercator,
        convertToUTM,
        convertFromWebMercator,
        calculateDistance,
        calculateBoundingBox,
        batchConvert,
        getCoordinateInfo
    }
}