<template>
    <UCard>
        <template #header>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-arrow-path" class="w-5 h-5" />
                    <h2 class="text-lg font-semibold">Convertidor de Coordenadas</h2>
                </div>
                <UBadge color="primary" variant="soft">Interactivo</UBadge>
            </div>
        </template>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Panel izquierdo: Formulario -->
            <div class="space-y-3">
                <!-- Selector de tipo de conversión -->
                <UFieldGroup label="Tipo de conversión" size="sm">
                    <USelectMenu
                        v-model="conversionType"
                        :items="conversionTypes"
                        option-attribute="label"
                        size="sm"
                    />
                </UFieldGroup>

                <!-- Entrada WGS84 -->
                <div v-if="showWGS84Input" class="space-y-2">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                            Entrada (WGS84)
                        </h3>
                        <UButton
                            size="xs"
                            color="neutral"
                            variant="ghost"
                            icon="i-heroicons-map-pin"
                            @click="useMapLocation"
                        >
                            Desde mapa
                        </UButton>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <UFieldGroup label="Latitud" size="sm">
                            <UInput
                                v-model="inputWGS84.lat"
                                type="number"
                                step="0.000001"
                                placeholder="19.4326"
                                size="sm"
                            />
                        </UFieldGroup>
                        <UFieldGroup label="Longitud" size="sm">
                            <UInput
                                v-model="inputWGS84.lon"
                                type="number"
                                step="0.000001"
                                placeholder="-99.1332"
                                size="sm"
                            />
                        </UFieldGroup>
                    </div>
                </div>

                <!-- Entrada Web Mercator -->
                <div v-if="showWebMercatorInput" class="space-y-2">
                    <h3 class="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        Entrada (Web Mercator)
                    </h3>
                    <div class="grid grid-cols-2 gap-2">
                        <UFieldGroup label="X" size="sm">
                            <UInput
                                v-model="inputWebMercator.x"
                                type="number"
                                placeholder="-11035322.76"
                                size="sm"
                            />
                        </UFieldGroup>
                        <UFieldGroup label="Y" size="sm">
                            <UInput
                                v-model="inputWebMercator.y"
                                type="number"
                                placeholder="2215942.68"
                                size="sm"
                            />
                        </UFieldGroup>
                    </div>
                </div>

                <!-- Botón Convertir -->
                <UButton
                    block
                    color="primary"
                    icon="i-heroicons-arrow-path"
                    :loading="loading"
                    :disabled="!isValid"
                    @click="convert"
                    size="sm"
                >
                    Convertir
                </UButton>

                <!-- Resultados compactos -->
                <div v-if="result" class="space-y-2">
                    <div class="flex items-center justify-between">
                        <h4 class="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Resultados</h4>
                        <UButton
                            size="xs"
                            color="neutral"
                            variant="ghost"
                            icon="i-heroicons-x-mark"
                            @click="clearResults"
                        />
                    </div>

                    <!-- Entrada -->
                    <div class="bg-neutral-50 dark:bg-neutral-900 p-2 rounded text-xs">
                        <div class="font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                            Entrada
                        </div>
                        <div v-if="result.input.latitude !== undefined" class="font-mono space-y-0.5">
                            <div>Lat: {{ result.input.latitude }}</div>
                            <div>Lon: {{ result.input.longitude }}</div>
                        </div>
                        <div v-else class="font-mono space-y-0.5">
                            <div>X: {{ result.input.x }}</div>
                            <div>Y: {{ result.input.y }}</div>
                        </div>
                    </div>

                    <!-- Web Mercator Output -->
                    <div v-if="result.output.x !== undefined" class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-xs font-medium text-blue-700 dark:text-blue-300">
                                Web Mercator
                            </span>
                            <UButton

                                color="secondary"
                                variant="soft"
                                icon="i-heroicons-clipboard-document"
                                @click="copyToClipboard(`${result.output.x}, ${result.output.y}`)"
                            />
                        </div>
                        <div class="font-mono text-xs space-y-0.5">
                            <div>X: {{ result.output.x.toFixed(2) }}</div>
                            <div>Y: {{ result.output.y.toFixed(2) }}</div>
                        </div>
                    </div>

                    <!-- UTM Output -->
                    <div v-if="result.output.zone !== undefined" class="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-xs font-medium text-green-700 dark:text-green-300">
                                UTM
                            </span>
                            <UButton

                                color="success"
                                variant="soft"
                                icon="i-heroicons-clipboard-document"
                                @click="copyToClipboard(`${result.output.zone}${result.output.letter} ${result.output.easting.toFixed(2)}E ${result.output.northing.toFixed(2)}N`)"
                            />
                        </div>
                        <div class="font-mono text-xs space-y-0.5">
                            <div>Zona: {{ result.output.zone }}{{ result.output.letter }}</div>
                            <div>E: {{ result.output.easting.toFixed(2) }}</div>
                            <div>N: {{ result.output.northing.toFixed(2) }}</div>
                        </div>
                    </div>

                    <!-- WGS84 Output -->
                    <div v-if="result.output.latitude !== undefined" class="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-xs font-medium text-purple-700 dark:text-purple-300">
                                WGS84
                            </span>
                            <UButton

                                color="primary"
                                variant="soft"
                                icon="i-heroicons-clipboard-document"
                                @click="copyToClipboard(`${result.output.latitude}, ${result.output.longitude}`)"
                            />
                        </div>
                        <div class="font-mono text-xs space-y-0.5">
                            <div>Lat: {{ result.output.latitude.toFixed(6) }}</div>
                            <div>Lon: {{ result.output.longitude.toFixed(6) }}</div>
                        </div>
                    </div>
                </div>

                <!-- Error -->
                <UAlert
                    v-if="error"
                    color="error"
                    variant="soft"
                    title="Error"
                    :description="error"
                    :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'red', variant: 'link' }"
                    @close="error = null"
                />
            </div>

            <!-- Panel derecho: Mapa -->
            <div class="relative">
                <div class="sticky top-4">
                    <div class="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-2 mb-2 text-xs text-center">
                        <span class="text-neutral-600 dark:text-neutral-400">
                            Haz clic en el mapa para seleccionar coordenadas
                        </span>
                    </div>
                    <LMap
                        ref="mapRef"
                        :zoom="mapZoom"
                        :center="mapCenter"
                        :use-global-leaflet="false"
                        :style="{ height: '400px' }"
                        class="w-full rounded-lg shadow-md z-0"
                        @click="handleMapClick"
                    >
                        <LTileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />

                        <!-- Marcador de entrada -->
                        <LMarker
                            v-if="inputMarker"
                            :lat-lng="inputMarker"
                        >
                            <LIcon :icon-size="[30, 30]" :icon-anchor="[15, 30]">
                                <div class="relative">
                                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap shadow-lg">
                                        Entrada
                                    </div>
                                    <div class="w-6 h-6 bg-blue-500 rounded-full border-3 border-white shadow-lg"></div>
                                    <div class="absolute top-6 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-blue-500"></div>
                                </div>
                            </LIcon>
                            <LPopup>
                                <div class="text-xs font-mono">
                                    <div class="font-semibold mb-1">Punto de Entrada</div>
                                    <div>Lat: {{ inputMarker[0].toFixed(6) }}</div>
                                    <div>Lon: {{ inputMarker[1].toFixed(6) }}</div>
                                </div>
                            </LPopup>
                        </LMarker>

                        <!-- Marcador de salida (si es diferente) -->
                        <LMarker
                            v-if="outputMarker && !areMarkersEqual"
                            :lat-lng="outputMarker"
                        >
                            <LIcon :icon-size="[30, 30]" :icon-anchor="[15, 30]">
                                <div class="relative">
                                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap shadow-lg">
                                        Salida
                                    </div>
                                    <div class="w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-lg"></div>
                                    <div class="absolute top-6 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-green-500"></div>
                                </div>
                            </LIcon>
                            <LPopup>
                                <div class="text-xs font-mono">
                                    <div class="font-semibold mb-1">Punto de Salida</div>
                                    <div>Lat: {{ outputMarker[0].toFixed(6) }}</div>
                                    <div>Lon: {{ outputMarker[1].toFixed(6) }}</div>
                                </div>
                            </LPopup>
                        </LMarker>
                    </LMap>
                </div>
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
const {
    convertToWebMercator,
    convertToUTM,
    convertFromWebMercator
} = useCoordinateAPI()

const toast = useToast()

const conversionType = ref({
    value: 'wgs84-to-webmercator',
    label: 'WGS84 → Web Mercator'
})

const conversionTypes = [
    { value: 'wgs84-to-webmercator', label: 'WGS84 → Web Mercator' },
    { value: 'wgs84-to-utm', label: 'WGS84 → UTM' },
    { value: 'webmercator-to-wgs84', label: 'Web Mercator → WGS84' }
]

const inputWGS84 = reactive({ lat: '', lon: '' })
const inputWebMercator = reactive({ x: '', y: '' })
const loading = ref(false)
const result = ref<any>(null)
const error = ref<string | null>(null)
const mapRef = ref<any>(null)
const mapZoom = ref(6)
const mapCenter = ref<[number, number]>([19.4326, -99.1332])

const showWGS84Input = computed(() =>
    ['wgs84-to-webmercator', 'wgs84-to-utm'].includes(conversionType.value.value)
)

const showWebMercatorInput = computed(() =>
    conversionType.value.value === 'webmercator-to-wgs84'
)

const isValid = computed(() => {
    if (showWGS84Input.value) {
        return inputWGS84.lat && inputWGS84.lon
    }
    if (showWebMercatorInput.value) {
        return inputWebMercator.x && inputWebMercator.y
    }
    return false
})

const inputMarker = computed(() => {
    if (showWGS84Input.value && inputWGS84.lat && inputWGS84.lon) {
        return [parseFloat(inputWGS84.lat), parseFloat(inputWGS84.lon)] as [number, number]
    }
    return null
})

const outputMarker = computed(() => {
    if (result.value?.output?.latitude !== undefined) {
        return [result.value.output.latitude, result.value.output.longitude] as [number, number]
    }
    return null
})

const areMarkersEqual = computed(() => {
    if (!inputMarker.value || !outputMarker.value) return false
    return Math.abs(inputMarker.value[0] - outputMarker.value[0]) < 0.00001 &&
        Math.abs(inputMarker.value[1] - outputMarker.value[1]) < 0.00001
})

const handleMapClick = (event: any) => {
    if (event.latlng && showWGS84Input.value) {
        inputWGS84.lat = event.latlng.lat.toFixed(6)
        inputWGS84.lon = event.latlng.lng.toFixed(6)

        // Centrar mapa en el punto
        mapCenter.value = [event.latlng.lat, event.latlng.lng]
        mapZoom.value = 13

        toast.add({
            title: 'Coordenadas capturadas',
            description: `Lat: ${event.latlng.lat.toFixed(6)}, Lon: ${event.latlng.lng.toFixed(6)}`,
            color: 'secondary',
            timeout: 2000
        })
    }
}

const useMapLocation = () => {
    if (inputMarker.value) {
        mapCenter.value = inputMarker.value
        mapZoom.value = 13
    }
}

const convert = async () => {
    loading.value = true
    error.value = null
    result.value = null

    try {
        switch (conversionType.value.value) {
            case 'wgs84-to-webmercator':
                result.value = await convertToWebMercator(
                    parseFloat(inputWGS84.lat),
                    parseFloat(inputWGS84.lon)
                )
                break

            case 'wgs84-to-utm':
                result.value = await convertToUTM(
                    parseFloat(inputWGS84.lat),
                    parseFloat(inputWGS84.lon)
                )
                break

            case 'webmercator-to-wgs84':
                result.value = await convertFromWebMercator(
                    parseFloat(inputWebMercator.x),
                    parseFloat(inputWebMercator.y)
                )
                // Si hay salida WGS84, centrar mapa
                if (result.value.output.latitude) {
                    mapCenter.value = [result.value.output.latitude, result.value.output.longitude]
                    mapZoom.value = 13
                }
                break
        }

        toast.add({
            title: 'Conversión exitosa',
            color: 'success',
            timeout: 2000
        })
    } catch (e: any) {
        error.value = e.message || 'Error al realizar la conversión'
    } finally {
        loading.value = false
    }
}

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.add({
        title: 'Copiado',
        description: 'Coordenadas copiadas al portapapeles',
        icon: 'i-heroicons-clipboard-document-check',
        color: 'success',
        timeout: 2000
    })
}

const clearResults = () => {
    result.value = null
    error.value = null
}

// Limpiar resultados cuando cambia el tipo de conversión
watch(conversionType, () => {
    result.value = null
    error.value = null
})

// Actualizar centro del mapa cuando hay marcador de entrada
watch(inputMarker, (newMarker) => {
    if (newMarker) {
        mapCenter.value = newMarker
        mapZoom.value = 13
    }
})
</script>

<style scoped>
:deep(.leaflet-container) {
    background: #f5f5f5;
    outline: none;
}
</style>