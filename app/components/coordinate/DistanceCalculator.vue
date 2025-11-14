<template>
    <UCard>
        <template #header>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-map-pin" class="w-5 h-5" />
                    <h2 class="text-lg font-semibold">Calculadora de Distancias</h2>
                </div>
                <UBadge v-if="result" color="primary" variant="soft">
                    {{ result.distance }} {{ result.unit }}
                </UBadge>
            </div>
        </template>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Panel izquierdo: Formulario -->
            <div class="space-y-3">
                <!-- Instrucciones -->
                <div class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs text-center">
                    <span class="text-blue-700 dark:text-blue-300">
                        Haz clic en el mapa para seleccionar los puntos
                    </span>
                </div>

                <!-- Punto 1 -->
                <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-sm font-medium flex items-center gap-2">
                            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                            Punto 1
                        </h3>
                        <UButton
                            v-if="point1.lat && point1.lon"
                            size="xs"
                            color="primary"
                            variant="ghost"
                            icon="i-heroicons-x-mark"
                            @click="clearPoint(1)"
                        />
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <UFieldGroup label="Latitud" size="sm">
                            <UInput
                                v-model="point1.lat"
                                type="number"
                                step="0.000001"
                                placeholder="Click en mapa"
                                size="sm"
                            />
                        </UFieldGroup>
                        <UFieldGroup label="Longitud" size="sm">
                            <UInput
                                v-model="point1.lon"
                                type="number"
                                step="0.000001"
                                placeholder="Click en mapa"
                                size="sm"
                            />
                        </UFieldGroup>
                    </div>
                </div>

                <!-- Punto 2 -->
                <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-sm font-medium flex items-center gap-2">
                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                            Punto 2
                        </h3>
                        <UButton
                            v-if="point2.lat && point2.lon"
                            size="xs"
                            color="success"
                            variant="ghost"
                            icon="i-heroicons-x-mark"
                            @click="clearPoint(2)"
                        />
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <UFieldGroup label="Latitud" size="sm">
                            <UInput
                                v-model="point2.lat"
                                type="number"
                                step="0.000001"
                                placeholder="Click en mapa"
                                size="sm"
                            />
                        </UFieldGroup>
                        <UFieldGroup label="Longitud" size="sm">
                            <UInput
                                v-model="point2.lon"
                                type="number"
                                step="0.000001"
                                placeholder="Click en mapa"
                                size="sm"
                            />
                        </UFieldGroup>
                    </div>
                </div>

                <!-- Unidad -->
                <UFieldGroup label="Unidad de medida" size="sm">
                    <USelectMenu
                        v-model="selectedUnit"
                        :items="units"
                        option-attribute="label"
                        size="sm"
                    />
                </UFieldGroup>

                <!-- Botón Calcular -->
                <UButton
                    block
                    color="primary"
                    icon="i-heroicons-calculator"
                    :loading="loading"
                    :disabled="!isValid"
                    @click="calculate"
                    size="sm"
                >
                    Calcular Distancia
                </UButton>

                <!-- Resultado compacto -->
                <div v-if="result" class="space-y-2">
                    <div class="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-medium text-primary-700 dark:text-primary-300">
                                Resultado
                            </span>
                            <UButton

                                color="primary"
                                variant="soft"
                                icon="i-heroicons-clipboard-document"
                                @click="copyDistance"
                            />
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-primary-600 dark:text-primary-400">
                                {{ result.distance }}
                            </div>
                            <div class="text-sm text-primary-600 dark:text-primary-400">
                                {{ result.unit }}
                            </div>
                        </div>
                    </div>

                    <!-- Coordenadas de los puntos -->
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                            <div class="font-medium text-blue-700 dark:text-blue-300 mb-1">P1</div>
                            <div class="font-mono text-[10px] space-y-0.5">
                                <div>{{ result.point1.latitude.toFixed(4) }}</div>
                                <div>{{ result.point1.longitude.toFixed(4) }}</div>
                            </div>
                        </div>
                        <div class="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                            <div class="font-medium text-green-700 dark:text-green-300 mb-1">P2</div>
                            <div class="font-mono text-[10px] space-y-0.5">
                                <div>{{ result.point2.latitude.toFixed(4) }}</div>
                                <div>{{ result.point2.longitude.toFixed(4) }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Botones de acción -->
                    <div class="flex gap-2">
                        <UButton
                            block
                            size="xs"
                            color="neutral"
                            variant="soft"
                            icon="i-heroicons-arrow-path"
                            @click="swapPoints"
                        >
                            Intercambiar
                        </UButton>
                        <UButton
                            block
                            size="xs"
                            color="error"
                            variant="soft"
                            icon="i-heroicons-trash"
                            @click="clearAll"
                        >
                            Limpiar todo
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
                    <!-- Indicador de selección -->
                    <div class="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-2 mb-2 text-xs text-center">
                        <span v-if="!point1.lat" class="text-blue-600 dark:text-blue-400 font-medium">
                            ● Selecciona el Punto 1
                        </span>
                        <span v-else-if="!point2.lat" class="text-green-600 dark:text-green-400 font-medium">
                            ● Selecciona el Punto 2
                        </span>
                        <span v-else class="text-neutral-600 dark:text-neutral-400">
                            ✓ Puntos seleccionados - Haz clic para cambiar
                        </span>
                    </div>

                    <LMap
                        ref="mapRef"
                        :zoom="mapZoom"
                        :center="mapCenter"
                        :use-global-leaflet="false"
                        :style="{ height: '450px' }"
                        class="w-full rounded-lg shadow-md z-0"
                        @click="handleMapClick"
                    >
                        <LTileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />

                        <!-- Marcador Punto 1 -->
                        <LMarker
                            v-if="marker1"
                            :lat-lng="marker1"
                        >
                            <LIcon :icon-size="[32, 32]" :icon-anchor="[16, 32]">
                                <div class="relative">
                                    <div class="absolute -top-9 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap shadow-lg">
                                        P1
                                    </div>
                                    <div class="w-7 h-7 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">
                                        1
                                    </div>
                                    <div class="absolute top-7 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-blue-500"></div>
                                </div>
                            </LIcon>
                            <LPopup>
                                <div class="text-xs font-mono">
                                    <div class="font-semibold mb-1 text-blue-600">Punto 1</div>
                                    <div>Lat: {{ marker1[0].toFixed(6) }}</div>
                                    <div>Lon: {{ marker1[1].toFixed(6) }}</div>
                                </div>
                            </LPopup>
                        </LMarker>

                        <!-- Marcador Punto 2 -->
                        <LMarker
                            v-if="marker2"
                            :lat-lng="marker2"
                        >
                            <LIcon :icon-size="[32, 32]" :icon-anchor="[16, 32]">
                                <div class="relative">
                                    <div class="absolute -top-9 left-1/2 -translate-x-1/2 bg-green-500 text-white px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap shadow-lg">
                                        P2
                                    </div>
                                    <div class="w-7 h-7 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">
                                        2
                                    </div>
                                    <div class="absolute top-7 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-green-500"></div>
                                </div>
                            </LIcon>
                            <LPopup>
                                <div class="text-xs font-mono">
                                    <div class="font-semibold mb-1 text-green-600">Punto 2</div>
                                    <div>Lat: {{ marker2[0].toFixed(6) }}</div>
                                    <div>Lon: {{ marker2[1].toFixed(6) }}</div>
                                </div>
                            </LPopup>
                        </LMarker>

                        <!-- Línea entre puntos con distancia -->
                        <template v-if="marker1 && marker2">
                            <LPolyline
                                :lat-lngs="[marker1, marker2]"
                                color="#8b5cf6"
                                :weight="3"
                                :dashArray="result ? undefined : [10, 5]"
                            />

                            <!-- Marcador con la distancia en el punto medio -->
                            <LMarker
                                v-if="result"
                                :lat-lng="midPoint"
                            >
                                <LIcon :icon-size="[120, 30]" :icon-anchor="[60, 15]">
                                    <div class="bg-purple-500 text-white px-3 py-1 rounded-full shadow-lg font-bold text-sm whitespace-nowrap border-2 border-white">
                                        {{ result.distance }} {{ result.unit }}
                                    </div>
                                </LIcon>
                            </LMarker>
                        </template>
                    </LMap>
                </div>
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
const { calculateDistance } = useCoordinateAPI()
const toast = useToast()

const point1 = reactive({ lat: '', lon: '' })
const point2 = reactive({ lat: '', lon: '' })
const selectedUnit = ref({ value: 'km', label: 'Kilómetros' })
const loading = ref(false)
const result = ref<any>(null)
const error = ref<string | null>(null)
const mapRef = ref<any>(null)
const mapZoom = ref(6)
const mapCenter = ref<[number, number]>([19.4326, -99.1332])
const nextPointToSelect = ref<1 | 2>(1)

const units = [
    { value: 'km', label: 'Kilómetros' },
    { value: 'miles', label: 'Millas' },
    { value: 'meters', label: 'Metros' }
]

const isValid = computed(() => {
    return point1.lat && point1.lon && point2.lat && point2.lon
})

const marker1 = computed(() => {
    if (point1.lat && point1.lon) {
        return [parseFloat(point1.lat), parseFloat(point1.lon)] as [number, number]
    }
    return null
})

const marker2 = computed(() => {
    if (point2.lat && point2.lon) {
        return [parseFloat(point2.lat), parseFloat(point2.lon)] as [number, number]
    }
    return null
})

const midPoint = computed(() => {
    if (!marker1.value || !marker2.value) return [0, 0] as [number, number]
    const lat = (marker1.value[0] + marker2.value[0]) / 2
    const lon = (marker1.value[1] + marker2.value[1]) / 2
    return [lat, lon] as [number, number]
})

const handleMapClick = (event: any) => {
    if (!event.latlng) return

    const lat = event.latlng.lat.toFixed(6)
    const lon = event.latlng.lng.toFixed(6)

    // Si no hay punto 1, seleccionar punto 1
    if (!point1.lat || !point1.lon) {
        point1.lat = lat
        point1.lon = lon
        nextPointToSelect.value = 2

        toast.add({
            title: 'Punto 1 seleccionado',
            description: `Lat: ${lat}, Lon: ${lon}`,
            color: 'primary',
            icon: 'i-heroicons-map-pin',
            timeout: 2000
        })
    }
    // Si no hay punto 2, seleccionar punto 2
    else if (!point2.lat || !point2.lon) {
        point2.lat = lat
        point2.lon = lon
        nextPointToSelect.value = 1

        toast.add({
            title: 'Punto 2 seleccionado',
            description: `Lat: ${lat}, Lon: ${lon}`,
            color: 'success',
            icon: 'i-heroicons-map-pin',
            timeout: 2000
        })

        // Auto-calcular si ambos puntos están seleccionados
        setTimeout(() => calculate(), 500)
    }
    // Si ambos están seleccionados, alternar
    else {
        if (nextPointToSelect.value === 1) {
            point1.lat = lat
            point1.lon = lon
            nextPointToSelect.value = 2
            toast.add({
                title: 'Punto 1 actualizado',
                color: 'primary',

            })
        } else {
            point2.lat = lat
            point2.lon = lon
            nextPointToSelect.value = 1
            toast.add({
                title: 'Punto 2 actualizado',
                color: 'success',

            })
        }
        result.value = null
    }

    // Ajustar vista del mapa
    updateMapView()
}

const updateMapView = () => {
    if (marker1.value && marker2.value) {
        // Si hay dos puntos, hacer zoom para verlos ambos
        const bounds = [marker1.value, marker2.value]
        mapCenter.value = midPoint.value
        mapZoom.value = 10
    } else if (marker1.value) {
        mapCenter.value = marker1.value
        mapZoom.value = 13
    }
}

const calculate = async () => {
    if (!isValid.value) return

    loading.value = true
    error.value = null
    result.value = null

    try {
        const response = await calculateDistance(
            parseFloat(point1.lat),
            parseFloat(point1.lon),
            parseFloat(point2.lat),
            parseFloat(point2.lon),
            selectedUnit.value.value as 'km' | 'miles' | 'meters'
        )
        result.value = response

        toast.add({
            title: 'Distancia calculada',
            description: `${response.distance} ${response.unit}`,
            color: 'success',
            icon: 'i-heroicons-check-circle',
            timeout: 3000
        })
    } catch (e: any) {
        error.value = e.message || 'Error al calcular la distancia'
    } finally {
        loading.value = false
    }
}

const clearPoint = (pointNum: 1 | 2) => {
    if (pointNum === 1) {
        point1.lat = ''
        point1.lon = ''
        nextPointToSelect.value = 1
    } else {
        point2.lat = ''
        point2.lon = ''
        nextPointToSelect.value = 2
    }
    result.value = null
}

const clearAll = () => {
    point1.lat = ''
    point1.lon = ''
    point2.lat = ''
    point2.lon = ''
    result.value = null
    error.value = null
    nextPointToSelect.value = 1
    mapCenter.value = [19.4326, -99.1332]
    mapZoom.value = 6

    toast.add({
        title: 'Limpiado',
        description: 'Todos los puntos han sido eliminados',
        color: 'neutral',

    })
}

const swapPoints = () => {
    const temp = { ...point1 }
    point1.lat = point2.lat
    point1.lon = point2.lon
    point2.lat = temp.lat
    point2.lon = temp.lon

    result.value = null

    toast.add({
        title: 'Puntos intercambiados',
        icon: 'i-heroicons-arrow-path',

    })
}

const copyDistance = () => {
    if (!result.value) return
    const text = `Distancia: ${result.value.distance} ${result.value.unit}\nPunto 1: ${result.value.point1.latitude}, ${result.value.point1.longitude}\nPunto 2: ${result.value.point2.latitude}, ${result.value.point2.longitude}`
    navigator.clipboard.writeText(text)
    toast.add({
        title: 'Copiado',
        description: 'Información de distancia copiada',
        icon: 'i-heroicons-clipboard-document-check',
        color: 'success',

    })
}

// Auto-actualizar vista cuando cambian los marcadores
watch([marker1, marker2], () => {
    if (marker1.value || marker2.value) {
        updateMapView()
    }
})

// Recalcular cuando cambia la unidad
watch(selectedUnit, () => {
    if (isValid.value && result.value) {
        calculate()
    }
})
</script>

<style scoped>
:deep(.leaflet-container) {
    background: #f5f5f5;
    outline: none;
}
</style>