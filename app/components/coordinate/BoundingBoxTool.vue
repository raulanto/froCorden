<template>
    <UCard>
        <template #header>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-square-3-stack-3d" class="w-5 h-5" />
                    <h2 class="text-lg font-semibold">Generador de Bounding Box</h2>
                </div>
                <UBadge v-if="result" color="primary" variant="soft">
                    Radio: {{ result.radius_km }} km
                </UBadge>
            </div>
        </template>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Panel izquierdo: Formulario -->
            <div class="space-y-3">
                <!-- Instrucciones -->
                <div class="bg-purple-50 dark:bg-purple-900/20 p-2 rounded text-xs text-center">
                    <span class="text-purple-700 dark:text-purple-300">
                        Haz clic en el mapa para seleccionar el centro
                    </span>
                </div>

                <!-- Centro -->
                <div class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-sm font-medium flex items-center gap-2">
                            <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                            Punto Central
                        </h3>
                        <UButton
                            v-if="center.lat && center.lon"
                            size="xs"
                            color="primary"
                            variant="ghost"
                            icon="i-heroicons-x-mark"
                            @click="clearCenter"
                        />
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <UFieldGroup label="Latitud" size="sm">
                            <UInput
                                v-model="center.lat"
                                type="number"
                                step="0.000001"
                                placeholder="Click en mapa"
                                size="sm"
                            />
                        </UFieldGroup>
                        <UFieldGroup label="Longitud" size="sm">
                            <UInput
                                v-model="center.lon"
                                type="number"
                                step="0.000001"
                                placeholder="Click en mapa"
                                size="sm"
                            />
                        </UFieldGroup>
                    </div>
                </div>

                <!-- Radio con slider -->
                <UFieldGroup label="Radio (kilómetros)" size="sm">
                    <div class="space-y-3">
                        <!-- Slider visual -->
                        <div class="px-1">
                            <USlider
                                v-model="radius"
                                :default-value="radius"
                                :min="0.1"
                                :max="50"
                                :step="0.1"
                                class="w-full"
                            />
                            <div class="flex justify-between text-xs text-neutral-500 mt-1">
                                <span>0.1 km</span>
                                <span>50 km</span>
                            </div>
                        </div>

                        <!-- Input numérico -->
                        <div class="flex gap-2 items-center">
                            <UInput
                                v-model="radius"
                                type="number"
                                step="0.1"
                                min="0.1"
                                max="50"
                                placeholder="5.0"
                                size="sm"
                                class="flex-1"
                            />
                            <div class="text-sm font-medium text-purple-600 dark:text-purple-400 w-20 text-right">
                                {{ parseFloat(radius || 0).toFixed(1) }} km
                            </div>
                        </div>
                    </div>
                    <template #help>
                        <div class="flex items-center gap-1 mt-1 text-xs">
                            <UIcon name="i-heroicons-information-circle" class="w-3 h-3" />
                            <span>Ajusta el radio con el slider o escribe directamente</span>
                        </div>
                    </template>
                </UFieldGroup>

                <!-- Botón Generar -->
                <UButton
                    block
                    color="primary"
                    icon="i-heroicons-sparkles"
                    :loading="loading"
                    :disabled="!isValid"
                    @click="generate"
                    size="sm"
                >
                    Generar Bounding Box
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

                    <!-- Centro -->
                    <div class="bg-neutral-50 dark:bg-neutral-900 p-2 rounded text-xs">
                        <div class="font-medium text-neutral-600 dark:text-neutral-400 mb-1">Centro</div>
                        <div class="font-mono space-y-0.5">
                            <div>Lat: {{ result.center.latitude }}</div>
                            <div>Lon: {{ result.center.longitude }}</div>
                            <div class="text-purple-600 dark:text-purple-400">Radio: {{ result.radius_km }} km</div>
                        </div>
                    </div>

                    <!-- Límites en grid -->
                    <div class="grid grid-cols-2 gap-2">
                        <div class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs">
                            <div class="text-blue-700 dark:text-blue-300 font-medium mb-1">Norte</div>
                            <div class="font-mono text-[10px]">{{ result.bounding_box.north.toFixed(6) }}</div>
                        </div>
                        <div class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs">
                            <div class="text-blue-700 dark:text-blue-300 font-medium mb-1">Sur</div>
                            <div class="font-mono text-[10px]">{{ result.bounding_box.south.toFixed(6) }}</div>
                        </div>
                        <div class="bg-green-50 dark:bg-green-900/20 p-2 rounded text-xs">
                            <div class="text-green-700 dark:text-green-300 font-medium mb-1">Este</div>
                            <div class="font-mono text-[10px]">{{ result.bounding_box.east.toFixed(6) }}</div>
                        </div>
                        <div class="bg-green-50 dark:bg-green-900/20 p-2 rounded text-xs">
                            <div class="text-green-700 dark:text-green-300 font-medium mb-1">Oeste</div>
                            <div class="font-mono text-[10px]">{{ result.bounding_box.west.toFixed(6) }}</div>
                        </div>
                    </div>

                    <!-- Esquinas -->
                    <div class="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                        <div class="text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">Esquinas</div>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <div class="text-neutral-500 text-[10px] mb-0.5">NE</div>
                                <div class="font-mono text-[10px]">
                                    {{ result.bounding_box.northeast.lat.toFixed(4) }},<br>
                                    {{ result.bounding_box.northeast.lon.toFixed(4) }}
                                </div>
                            </div>
                            <div>
                                <div class="text-neutral-500 text-[10px] mb-0.5">SW</div>
                                <div class="font-mono text-[10px]">
                                    {{ result.bounding_box.southwest.lat.toFixed(4) }},<br>
                                    {{ result.bounding_box.southwest.lon.toFixed(4) }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Botones de acción -->
                    <div class="flex gap-2">
                        <UButton
                            block
                            size="xs"
                            color="secondary"
                            variant="soft"
                            icon="i-heroicons-clipboard-document"
                            @click="copyBounds"
                        >
                            Copiar
                        </UButton>
                        <UButton
                            block
                            size="xs"
                            color="success"
                            variant="soft"
                            icon="i-heroicons-code-bracket"
                            @click="copyAsJSON"
                        >
                            JSON
                        </UButton>
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
                    <!-- Indicador -->
                    <div class="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-2 mb-2 text-xs text-center">
                        <span v-if="!center.lat" class="text-purple-600 dark:text-purple-400 font-medium">
                            ● Selecciona el centro del área
                        </span>
                        <span v-else class="text-neutral-600 dark:text-neutral-400">
                            ✓ Centro seleccionado - Ajusta el radio
                        </span>
                    </div>
                    <client-only>
                        <LMap
                            ref="mapRef"
                            :zoom="mapZoom"
                            :center="mapCenter"
                            :use-global-leaflet="false"
                            :style="{ height: '500px' }"
                            class="w-full rounded-lg shadow-md z-0"
                            @click="handleMapClick"
                        >
                            <LTileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; OpenStreetMap contributors"
                            />

                            <!-- Marcador del centro -->
                            <LMarker
                                v-if="centerMarker"
                                :lat-lng="centerMarker"
                            >
                                <LIcon :icon-size="[32, 32]" :icon-anchor="[16, 32]">
                                    <div class="relative">
                                        <div class="absolute -top-9 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap shadow-lg">
                                            Centro
                                        </div>
                                        <div class="w-7 h-7 bg-purple-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                                            <UIcon name="i-heroicons-plus" class="w-4 h-4 text-white" />
                                        </div>
                                        <div class="absolute top-7 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-purple-500"></div>
                                    </div>
                                </LIcon>
                                <LPopup>
                                    <div class="text-xs font-mono">
                                        <div class="font-semibold mb-1 text-purple-600">Centro del Área</div>
                                        <div>Lat: {{ centerMarker[0].toFixed(6) }}</div>
                                        <div>Lon: {{ centerMarker[1].toFixed(6) }}</div>
                                        <div class="mt-1 text-purple-600">Radio: {{ radius || 0 }} km</div>
                                    </div>
                                </LPopup>
                            </LMarker>

                            <!-- Círculo del radio (preview en tiempo real) -->
                            <LCircle
                                v-if="centerMarker && radius"
                                :lat-lng="centerMarker"
                                :radius="parseFloat(radius) * 1000"
                                color="#8b5cf6"
                                :weight="2"
                                :fillOpacity="0.1"
                            />

                            <!-- Rectángulo del bounding box (solo cuando está calculado) -->
                            <LRectangle
                                v-if="result && rectangleBounds.length > 0"
                                :lat-lngs="rectangleBounds"
                                color="#3b82f6"
                                :weight="2"
                                :fillOpacity="0.05"
                                :dashArray="[10, 5]"
                            />

                            <!-- Marcadores de las esquinas -->
                            <template v-if="result">
                                <!-- Esquina Noreste -->
                                <LMarker :lat-lng="[result.bounding_box.northeast.lat, result.bounding_box.northeast.lon]">
                                    <LIcon :icon-size="[16, 16]" :icon-anchor="[8, 8]">
                                        <div class="w-3 h-3 bg-blue-500 rounded-sm border border-white shadow-md"></div>
                                    </LIcon>
                                    <LPopup>
                                        <div class="text-xs">
                                            <div class="font-semibold">Noreste</div>
                                            <div class="font-mono text-[10px]">
                                                {{ result.bounding_box.northeast.lat.toFixed(6) }},
                                                {{ result.bounding_box.northeast.lon.toFixed(6) }}
                                            </div>
                                        </div>
                                    </LPopup>
                                </LMarker>

                                <!-- Esquina Suroeste -->
                                <LMarker :lat-lng="[result.bounding_box.southwest.lat, result.bounding_box.southwest.lon]">
                                    <LIcon :icon-size="[16, 16]" :icon-anchor="[8, 8]">
                                        <div class="w-3 h-3 bg-green-500 rounded-sm border border-white shadow-md"></div>
                                    </LIcon>
                                    <LPopup>
                                        <div class="text-xs">
                                            <div class="font-semibold">Suroeste</div>
                                            <div class="font-mono text-[10px]">
                                                {{ result.bounding_box.southwest.lat.toFixed(6) }},
                                                {{ result.bounding_box.southwest.lon.toFixed(6) }}
                                            </div>
                                        </div>
                                    </LPopup>
                                </LMarker>
                            </template>
                        </LMap>
                    </client-only>



                    <!-- Leyenda -->
                    <div v-if="centerMarker" class="mt-2 bg-white dark:bg-neutral-800 rounded-lg p-2 text-xs space-y-1">
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span>Centro del área</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 border-2 border-purple-500 rounded-full"></div>
                            <span>Radio de búsqueda: {{ parseFloat(radius || 0).toFixed(1) }} km</span>
                        </div>
                        <div v-if="result" class="flex items-center gap-2">
                            <div class="w-3 h-3 border-2 border-blue-500 bg-blue-500/10"></div>
                            <span>Bounding box rectangular</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
const { calculateBoundingBox } = useCoordinateAPI()
const toast = useToast()

const center = reactive({ lat: '', lon: '' })
const radius = ref('5')
const loading = ref(false)
const result = ref<any>(null)
const error = ref<string | null>(null)
const mapRef = ref<any>(null)
const mapZoom = ref(6)
const mapCenter = ref<[number, number]>([19.4326, -99.1332])

const isValid = computed(() => {
    return center.lat && center.lon && radius.value && parseFloat(radius.value) > 0
})

const centerMarker = computed(() => {
    if (center.lat && center.lon) {
        return [parseFloat(center.lat), parseFloat(center.lon)] as [number, number]
    }
    return null
})

const rectangleBounds = computed(() => {
    if (!result.value) return []
    const bbox = result.value.bounding_box
    return [
        [bbox.south, bbox.west],
        [bbox.north, bbox.east]
    ]
})

const handleMapClick = (event: any) => {
    if (!event.latlng) return

    center.lat = event.latlng.lat.toFixed(6)
    center.lon = event.latlng.lng.toFixed(6)

    // Centrar mapa
    mapCenter.value = [event.latlng.lat, event.latlng.lng]
    mapZoom.value = 12

    // Limpiar resultado anterior
    result.value = null

    toast.add({
        title: 'Centro seleccionado',
        description: `Lat: ${center.lat}, Lon: ${center.lon}`,
        color: 'primary',
        icon: 'i-heroicons-map-pin',

    })
}

const generate = async () => {
    if (!isValid.value) return

    loading.value = true
    error.value = null

    try {
        const response = await calculateBoundingBox(
            parseFloat(center.lat),
            parseFloat(center.lon),
            parseFloat(radius.value)
        )
        result.value = response

        toast.add({
            title: 'Bounding Box generado',
            description: `Radio: ${response.radius_km} km`,
            color: 'success',
            icon: 'i-heroicons-check-circle',
            timeout: 3000
        })

        // Ajustar vista para ver todo el bounding box
        adjustMapView()
    } catch (e: any) {
        error.value = e.message || 'Error al generar el bounding box'
    } finally {
        loading.value = false
    }
}

const adjustMapView = () => {
    if (!result.value || !centerMarker.value) return

    // Calcular zoom apropiado basado en el radio
    const radiusKm = parseFloat(radius.value)
    let zoom = 13

    if (radiusKm > 30) zoom = 8
    else if (radiusKm > 20) zoom = 9
    else if (radiusKm > 10) zoom = 10
    else if (radiusKm > 5) zoom = 11
    else if (radiusKm > 2) zoom = 12

    mapZoom.value = zoom
}

const clearCenter = () => {
    center.lat = ''
    center.lon = ''
    result.value = null
    mapCenter.value = [19.4326, -99.1332]
    mapZoom.value = 6
}

const clearResults = () => {
    result.value = null
}

const copyBounds = () => {
    if (!result.value) return
    const bbox = result.value.bounding_box
    const text = `Norte: ${bbox.north}, Sur: ${bbox.south}, Este: ${bbox.east}, Oeste: ${bbox.west}`
    navigator.clipboard.writeText(text)
    toast.add({
        title: 'Copiado',
        description: 'Límites copiados al portapapeles',
        icon: 'i-heroicons-clipboard-document-check',
        color: 'success',

    })
}

const copyAsJSON = () => {
    if (!result.value) return
    navigator.clipboard.writeText(JSON.stringify(result.value, null, 2))
    toast.add({
        title: 'JSON copiado',
        description: 'Datos copiados al portapapeles',
        icon: 'i-heroicons-clipboard-document-check',
        color: 'success',

    })
}

// Auto-generar cuando cambia el radio (con debounce)
let radiusTimeout: NodeJS.Timeout
watch(radius, () => {
    if (!isValid.value || !result.value) return

    clearTimeout(radiusTimeout)
    radiusTimeout = setTimeout(() => {
        generate()
    }, 800)
})

// Actualizar vista cuando hay centro
watch(centerMarker, (newMarker) => {
    if (newMarker) {
        mapCenter.value = newMarker
        mapZoom.value = 12
    }
})
</script>

<style scoped>
:deep(.leaflet-container) {
    background: #f5f5f5;
    outline: none;
}

/* Estilo del slider */
input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #8b5cf6;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #8b5cf6;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]:hover::-webkit-slider-thumb {
    background: #7c3aed;
}

input[type="range"]:hover::-moz-range-thumb {
    background: #7c3aed;
}
</style>