<template>
    <UCard>
        <template #header>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <UIcon name="i-heroicons-cube" class="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 class="text-xl font-bold">Calculadora de Área de Polígonos</h2>
                        <p class="text-xs text-neutral-500">Dibuja y calcula áreas geográficas</p>
                    </div>
                </div>
                <UBadge v-if="polygonPoints.length > 0" color="primary" variant="subtle" size="lg">
                    {{ polygonPoints.length }} puntos
                </UBadge>
            </div>
        </template>

        <div class="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-6">
            <!-- Panel IZQUIERDO: Mapa -->
            <div class="order-2 lg:order-1">
                <div class="space-y-4">
<!--                     Indicador de estado-->

                    <UAlert
                        :color="polygonPoints.length < 3 ? 'primary' : 'success'"
                        variant="subtle"
                        :title="polygonPoints.length < 3 ? 'Haz clic en el mapa para empezar' : 'Polígono completo - Presiona Calcular'"

                        :description="polygonPoints.length < 3 ? `Agrega ${ 3 - polygonPoints.length } punto(s) más para formar un polígono` : 'Arrastra los puntos para moverlos'"
                        :icon="polygonPoints.length === 0 ? 'i-heroicons-cursor-arrow-rays' : polygonPoints.length < 3 ? 'i-heroicons-plus-circle' : 'i-heroicons-check-circle'"
                    />
                    <!-- Mapa -->
                    <div class="relative">
                        <ClientOnly>
                            <div v-if="isClient" class="rounded-xl overflow-hidden shadow-lg border-2 border-neutral-200 dark:border-neutral-700 z-0">
                                <LMap
                                    ref="mapRef"
                                    :zoom="mapZoom"
                                    :center="mapCenter"
                                    :use-global-leaflet="false"

                                    :style="{ height: '600px' }"
                                    class="w-full z-0"
                                    @click="handleMapClick"
                                >
                                    <LTileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution="&copy; OpenStreetMap contributors"
                                    />

                                    <LMarker
                                        v-for="(point, index) in polygonPoints"
                                        :key="`point-${index}`"
                                        :draggable="true"
                                        @dragend="handleMarkerDrag($event, index)"
                                        :lat-lng="[point.lat, point.lng]"
                                    >
                                        <LPopup>
                                            <div class="text-xs">
                                                <div class="font-semibold mb-1">Vértice {{ index + 1 }}</div>
                                                <div class="font-mono text-[10px]">
                                                    Lat: {{ point.lat.toFixed(6) }}<br>
                                                    Lon: {{ point.lng.toFixed(6) }}
                                                </div>
                                                <UButton
                                                    size="xs"
                                                    color="error"
                                                    variant="soft"
                                                    icon="i-heroicons-trash"
                                                    class="mt-2 w-full"
                                                    @click="removePoint(index)"
                                                >
                                                    Eliminar
                                                </UButton>
                                            </div>
                                        </LPopup>
                                    </LMarker>
                                    <!-- Polígono cerrado -->
                                    <LPolygon
                                        v-if="polygonPoints.length >= 3"
                                        :lat-lngs="polygonLatLngs"
                                        color="#3b82f6"
                                        :weight="3"
                                        :fillOpacity="0.25"
                                        fillColor="#3b82f6"
                                    />

                                    <!-- Líneas de construcción -->
                                    <LPolyline
                                        v-if="polygonPoints.length >= 2 && polygonPoints.length < 3"
                                        :lat-lngs="polygonLatLngs"
                                        color="#94a3b8"
                                        :weight="2"
                                        :dashArray="[8, 4]"
                                    />

                                    <!-- Marcador del centro -->
                                    <LMarker
                                        v-if="results"
                                        :lat-lng="[results.center.lat, results.center.lng]"
                                    >
                                        <LIcon :icon-anchor="[10, 10]">
                                            <div class="center-marker">
                                                <div class="center-pulse"></div>
                                                <div class="center-dot"></div>
                                            </div>
                                        </LIcon>
                                        <LPopup>
                                            <div class="popup-content">
                                                <div class="popup-header" style="border-color: #a855f7;">
                                                    <div class="popup-badge" style="background: linear-gradient(135deg, #a855f7, #ec4899);">
                                                        🎯
                                                    </div>
                                                    <span class="popup-title">Centro Geométrico</span>
                                                </div>
                                                <div class="popup-coords">
                                                    <div class="coord-row">
                                                        <span class="coord-label">Latitud:</span>
                                                        <span class="coord-value">{{ results.center.lat.toFixed(6) }}</span>
                                                    </div>
                                                    <div class="coord-row">
                                                        <span class="coord-label">Longitud:</span>
                                                        <span class="coord-value">{{ results.center.lng.toFixed(6) }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </LPopup>
                                    </LMarker>

                                    <!-- Bounding Box -->
                                    <LRectangle
                                        v-if="results"
                                        :lat-lngs="[[results.bounds.south, results.bounds.west], [results.bounds.north, results.bounds.east]]"
                                        color="#f97316"
                                        :weight="2"
                                        :fillOpacity="0.05"
                                        :dashArray="[10, 5]"
                                    />
                                </LMap>
                            </div>

                            <template #fallback>
                                <div class="w-full h-[600px] flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                                    <div class="text-center">
                                        <UIcon name="i-heroicons-map" class="w-16 h-16 text-neutral-400 mx-auto mb-3 animate-pulse" />
                                        <p class="text-sm text-neutral-500">Cargando mapa interactivo...</p>
                                    </div>
                                </div>
                            </template>
                        </ClientOnly>

                        <!-- Leyenda del mapa -->
                        <div class="mt-3 bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm border border-neutral-200 dark:border-neutral-700">
                            <div class="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Leyenda</div>
                            <div class="grid grid-cols-2 gap-2 text-xs">
                                <div class="flex items-center gap-2">
                                    <div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                                    <span>Vértices</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="w-4 h-4 bg-blue-500/25 border-2 border-blue-500"></div>
                                    <span>Área</span>
                                </div>
                                <div v-if="results" class="flex items-center gap-2">
                                    <div class="w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow"></div>
                                    <span>Centro</span>
                                </div>
                                <div v-if="results" class="flex items-center gap-2">
                                    <div class="w-4 h-4 border-2 border-orange-500 bg-orange-500/10"></div>
                                    <span>Límites</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Panel DERECHO: Opciones y Resultados -->
            <div class="order-1 lg:order-2 space-y-4">
                <!-- Instrucciones -->
                <div class="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                            <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-white" />
                        </div>
                        <div class="text-xs">
                            <div class="font-semibold text-blue-900 dark:text-blue-100 mb-2">Instrucciones</div>
                            <ol class="list-decimal list-inside space-y-1 text-blue-700 dark:text-blue-300">
                                <li>Haz clic en el mapa para agregar puntos</li>
                                <li>Arrastra los puntos para moverlos</li>
                                <li>Mínimo 3 puntos para formar polígono</li>
                                <li>Presiona "Calcular" para ver resultados</li>
                            </ol>
                        </div>
                    </div>
                </div>

                <!-- Lista de Puntos -->
                <div class="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-700">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-sm font-semibold flex items-center gap-2">
                            <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
                            Vértices del Polígono
                        </h3>
                        <UBadge color="neutral" variant="soft">
                            {{ polygonPoints.length }}
                        </UBadge>
                    </div>

                    <div v-if="polygonPoints.length === 0" class="text-center py-8 text-neutral-500">
                        <UIcon name="i-heroicons-cursor-arrow-rays" class="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p class="text-sm">Comienza haciendo clic en el mapa</p>
                    </div>

                    <div v-else class="space-y-2 max-h-64 overflow-y-auto">
                        <div
                            v-for="(point, index) in polygonPoints"
                            :key="index"
                            class="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                        >
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                                    :style="{ backgroundColor: getPointColor(index) }"
                                >
                                    {{ index + 1 }}
                                </div>
                                <div class="font-mono text-xs">
                                    <div class="text-neutral-600 dark:text-neutral-400">{{ point.lat.toFixed(5) }}</div>
                                    <div class="text-neutral-600 dark:text-neutral-400">{{ point.lng.toFixed(5) }}</div>
                                </div>
                            </div>
                            <UButton
                                icon="i-heroicons-trash"
                                color="error"
                                variant="ghost"
                                size="xs"
                                @click="removePoint(index)"
                            />
                        </div>
                    </div>
                </div>

                <!-- Unidad de Área -->
                <UFieldGroup label="Unidad de Medida" size="sm">
                    <USelectMenu
                        v-model="selectedUnit"
                        :items="areaUnits"
                        option-attribute="label"
                        size="md"
                    >
                        <template #leading>
                            <UIcon name="i-heroicons-calculator" class="w-4 h-4" />
                        </template>
                    </USelectMenu>
                </UFieldGroup>

                <!-- Botones de Acción -->
                <div class="grid grid-cols-2 gap-3">
                    <UButton
                        block
                        color="primary"
                        icon="i-heroicons-calculator"
                        :loading="loading"
                        :disabled="polygonPoints.length < 3"
                        @click="calculateArea"
                        size="md"
                    >
                        Calcular
                    </UButton>
                    <UButton
                        block
                        color="error"
                        variant="outline"
                        icon="i-heroicons-trash"
                        :disabled="polygonPoints.length === 0"
                        @click="clearPolygon"
                        size="md"
                    >
                        Limpiar
                    </UButton>
                </div>

                <!-- Resultados -->
                <div v-if="results" class="space-y-3">
                    <div class="flex items-center justify-between">
                        <h4 class="text-sm font-semibold flex items-center gap-2">
                            <UIcon name="i-heroicons-chart-bar" class="w-4 h-4" />
                            Resultados
                        </h4>
                        <UButton
                            size="xs"
                            color="error"
                            variant="ghost"
                            icon="i-heroicons-x-mark"
                            @click="results = null"
                        />
                    </div>

                    <!-- Área Principal -->
                    <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                        <div class="flex items-center gap-2 mb-2 opacity-90">
                            <UIcon name="i-heroicons-square-3-stack-3d" class="w-5 h-5" />
                            <span class="text-sm font-medium">Área Total</span>
                        </div>
                        <div class="text-3xl font-bold mb-1">
                            {{ formatNumber(results.area[selectedUnit.value]) }}
                        </div>
                        <div class="text-sm opacity-90">
                            {{ selectedUnit.label }}
                        </div>

                        <!-- Conversiones -->
                        <div class="mt-3 pt-3 border-t border-white/20 space-y-1">
                            <div v-for="unit in alternativeUnits" :key="unit.value"
                                 class="flex justify-between text-xs opacity-90">
                                <span>{{ unit.label }}:</span>
                                <span class="font-mono font-semibold">
                                    {{ formatNumber(results.area[unit.value]) }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Perímetro -->
                    <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center gap-2">
                                <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 text-green-600" />
                                <span class="text-sm font-semibold text-green-700 dark:text-green-300">Perímetro</span>
                            </div>
                            <UButton
                                size="xs"
                                color="success"
                                variant="soft"
                                icon="i-heroicons-clipboard-document"
                                @click="copyToClipboard(results.perimeter.km, 'Perímetro')"
                            />
                        </div>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div class="bg-white dark:bg-neutral-800 rounded-lg p-2">
                                <div class="text-xs text-green-600 dark:text-green-400">Kilómetros</div>
                                <div class="font-bold font-mono">{{ results.perimeter.km.toFixed(3) }} km</div>
                            </div>
                            <div class="bg-white dark:bg-neutral-800 rounded-lg p-2">
                                <div class="text-xs text-green-600 dark:text-green-400">Metros</div>
                                <div class="font-bold font-mono">{{ results.perimeter.meters.toFixed(2) }} m</div>
                            </div>
                        </div>
                    </div>

                    <!-- Centro Geométrico -->
                    <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center gap-2">
                                <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-purple-600" />
                                <span class="text-sm font-semibold text-purple-700 dark:text-purple-300">Centro Geométrico</span>
                            </div>
                            <UButton
                                size="xs"
                                color="primary"
                                variant="soft"
                                icon="i-heroicons-clipboard-document"
                                @click="copyToClipboard(`${results.center.lat}, ${results.center.lng}`, 'Centro')"
                            />
                        </div>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div class="bg-white dark:bg-neutral-800 rounded-lg p-2">
                                <div class="text-xs text-purple-600 dark:text-purple-400">Latitud</div>
                                <div class="font-bold font-mono">{{ results.center.lat.toFixed(6) }}</div>
                            </div>
                            <div class="bg-white dark:bg-neutral-800 rounded-lg p-2">
                                <div class="text-xs text-purple-600 dark:text-purple-400">Longitud</div>
                                <div class="font-bold font-mono">{{ results.center.lng.toFixed(6) }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Bounding Box -->
                    <div class="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                        <div class="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-2">
                            <UIcon name="i-heroicons-rectangle-stack" class="w-4 h-4" />
                            Límites Geográficos
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div class="bg-white dark:bg-neutral-800 rounded p-2">
                                <span class="text-orange-600">Norte:</span> {{ results.bounds.north.toFixed(5) }}
                            </div>
                            <div class="bg-white dark:bg-neutral-800 rounded p-2">
                                <span class="text-orange-600">Sur:</span> {{ results.bounds.south.toFixed(5) }}
                            </div>
                            <div class="bg-white dark:bg-neutral-800 rounded p-2">
                                <span class="text-orange-600">Este:</span> {{ results.bounds.east.toFixed(5) }}
                            </div>
                            <div class="bg-white dark:bg-neutral-800 rounded p-2">
                                <span class="text-orange-600">Oeste:</span> {{ results.bounds.west.toFixed(5) }}
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                        <UButton
                            block
                            size="sm"
                            color="primary"
                            variant="soft"

                            icon="i-heroicons-arrow-down-tray"
                            @click="exportGeoJSON"
                        >
                            GeoJSON
                        </UButton>
                        <UButton
                            block
                            size="sm"
                            color="secondary"
                            variant="soft"

                            icon="i-heroicons-document-text"
                            @click="exportCSV"
                        >
                            CSV
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
        </div>

    </UCard>
</template>

<script setup lang="ts">
const { calculateDistance } = useCoordinateAPI()
const toast = useToast()

const polygonPoints = ref<Array<{ lat: number; lng: number }>>([])
const selectedUnit = ref({ value: 'km2', label: 'Kilómetros cuadrados (km²)' })
const loading = ref(false)
const results = ref<any>(null)
const error = ref<string | null>(null)
const mapRef = ref<any>(null)
const mapZoom = ref(13)
const mapCenter = ref<[number, number]>([19.4326, -99.1332])
const isClient = ref(false)

const areaUnits = [
    { value: 'km2', label: 'Kilómetros cuadrados (km²)' },
    { value: 'hectares', label: 'Hectáreas (ha)' },
    { value: 'acres', label: 'Acres' },
    { value: 'm2', label: 'Metros cuadrados (m²)' }
]

const alternativeUnits = computed(() => {
    return areaUnits.filter(unit => unit.value !== selectedUnit.value.value)
})

const polygonLatLngs = computed(() => {
    return polygonPoints.value.map(p => [p.lat, p.lng])
})

onMounted(() => {
    isClient.value = true
})

const getPointColor = (index: number) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
    return colors[index % colors.length]
}

const handleMapClick = (event: any) => {
    if (!event.latlng) return

    const newPoint = {
        lat: event.latlng.lat,
        lng: event.latlng.lng
    }

    polygonPoints.value.push(newPoint)
    results.value = null

    toast.add({
        title: `Vértice ${polygonPoints.value.length} agregado`,
        description: `${newPoint.lat.toFixed(5)}, ${newPoint.lng.toFixed(5)}`,
        color: 'primary',
        icon: 'i-heroicons-map-pin',
        timeout: 2000
    })

    updateMapView()
}

const handleMarkerDrag = (event: any, index: number) => {
    const newLatLng = event.target.getLatLng()
    polygonPoints.value[index] = {
        lat: newLatLng.lat,
        lng: newLatLng.lng
    }

    // Limpiar resultados al mover un punto
    results.value = null

    toast.add({
        title: `Vértice ${index + 1} movido`,
        description: `Nueva posición: ${newLatLng.lat.toFixed(5)}, ${newLatLng.lng.toFixed(5)}`,
        color: 'info',
        icon: 'i-heroicons-arrows-pointing-out',
        timeout: 2000
    })
}

const removePoint = (index: number) => {
    polygonPoints.value.splice(index, 1)
    results.value = null

    toast.add({
        title: 'Vértice eliminado',
        color: 'warning',
        timeout: 2000
    })
}

const clearPolygon = () => {
    polygonPoints.value = []
    results.value = null
    error.value = null
    mapCenter.value = [19.4326, -99.1332]
    mapZoom.value = 13

    toast.add({
        title: 'Polígono limpiado',
        description: 'Todos los puntos han sido eliminados',
        color: 'neutral',
        timeout: 2000
    })
}

const calculateArea = async () => {
    if (polygonPoints.value.length < 3) {
        error.value = 'Se necesitan al menos 3 puntos para calcular el área'
        return
    }

    loading.value = true
    error.value = null

    try {
        const areaKm2 = calculatePolygonArea(polygonPoints.value)
        const perimeter = await calculatePerimeter()
        const center = calculateCenter()
        const bounds = calculateBounds()

        const area = {
            km2: areaKm2,
            hectares: areaKm2 * 100,
            acres: areaKm2 * 247.105,
            m2: areaKm2 * 1000000
        }

        results.value = {
            area,
            perimeter,
            center,
            bounds
        }

        toast.add({
            title: '✓ Cálculo completado',
            description: `Área: ${formatNumber(area[selectedUnit.value.value])} ${selectedUnit.value.label}`,
            color: 'success',
            icon: 'i-heroicons-check-circle',
            timeout: 3000
        })
    } catch (e: any) {
        error.value = e.message || 'Error al calcular el área'
    } finally {
        loading.value = false
    }
}

const calculatePolygonArea = (points: Array<{ lat: number; lng: number }>) => {
    let area = 0
    const n = points.length

    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n
        area += points[i].lng * points[j].lat
        area -= points[j].lng * points[i].lat
    }

    area = Math.abs(area) / 2
    const areaKm2 = area * (111.32 * 111.32)

    return areaKm2
}

const calculatePerimeter = async () => {
    let totalKm = 0

    for (let i = 0; i < polygonPoints.value.length; i++) {
        const p1 = polygonPoints.value[i]
        const p2 = polygonPoints.value[(i + 1) % polygonPoints.value.length]

        const response = await calculateDistance(p1.lat, p1.lng, p2.lat, p2.lng, 'km')
        totalKm += response.distance
    }

    return {
        km: totalKm,
        meters: totalKm * 1000,
        miles: totalKm * 0.621371
    }
}

const calculateCenter = () => {
    const sumLat = polygonPoints.value.reduce((sum, p) => sum + p.lat, 0)
    const sumLng = polygonPoints.value.reduce((sum, p) => sum + p.lng, 0)

    return {
        lat: sumLat / polygonPoints.value.length,
        lng: sumLng / polygonPoints.value.length
    }
}

const calculateBounds = () => {
    const lats = polygonPoints.value.map(p => p.lat)
    const lngs = polygonPoints.value.map(p => p.lng)

    return {
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lngs),
        west: Math.min(...lngs)
    }
}

const updateMapView = () => {
    if (polygonPoints.value.length === 0) return

    const center = calculateCenter()
    mapCenter.value = [center.lat, center.lng]

    if (polygonPoints.value.length >= 3) {
        mapZoom.value = 14
    }
}

const formatNumber = (num: number) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M'
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K'
    } else if (num < 1) {
        return num.toFixed(6)
    }
    return num.toFixed(2)
}

const copyToClipboard = (text: any, label: string) => {
    navigator.clipboard.writeText(String(text))
    toast.add({
        title: `${label} copiado`,
        icon: 'i-heroicons-clipboard-document-check',
        color: 'success',
        timeout: 2000
    })
}

const exportGeoJSON = () => {
    if (!results.value) return

    const geojson = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {
                    area_km2: results.value.area.km2,
                    area_hectares: results.value.area.hectares,
                    perimeter_km: results.value.perimeter.km,
                    center: results.value.center
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: [polygonPoints.value.map(p => [p.lng, p.lat])]
                }
            }
        ]
    }

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `polygon_${Date.now()}.geojson`
    a.click()
    window.URL.revokeObjectURL(url)

    toast.add({
        title: 'GeoJSON exportado exitosamente',
        color: 'success',
        timeout: 2000
    })
}

const exportCSV = () => {
    if (!results.value) return

    let csv = 'Punto,Latitud,Longitud\n'
    polygonPoints.value.forEach((point, index) => {
        csv += `${index + 1},${point.lat},${point.lng}\n`
    })

    csv += `\nResumen\n`
    csv += `Área (km²),${results.value.area.km2}\n`
    csv += `Área (hectáreas),${results.value.area.hectares}\n`
    csv += `Perímetro (km),${results.value.perimeter.km}\n`
    csv += `Centro Latitud,${results.value.center.lat}\n`
    csv += `Centro Longitud,${results.value.center.lng}\n`

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `polygon_${Date.now()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast.add({
        title: 'CSV exportado exitosamente',
        color: 'success',
        timeout: 2000
    })
}

watch(selectedUnit, () => {
    if (results.value) {
        // Actualización automática de visualización
    }
})
</script>

<style scoped>

:deep(.leaflet-tile-pane) {
    opacity: 1;
}

:deep(.leaflet-marker-icon) {
    background: transparent !important;
    border: none !important;
}

:deep(.leaflet-popup-content-wrapper) {
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

:deep(.leaflet-popup-tip) {
    display: none;
}
</style>