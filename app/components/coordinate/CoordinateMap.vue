<template>
    <div class="relative w-full" :style="{ height: 389 }">
        <client-only>
            <LMap
                ref="mapRef"
                :zoom="zoom"
                :center="center"
                :use-global-leaflet="false"
                style="height: 700px"
                class="w-full rounded-lg shadow-lg z-0"
                @click="handleMapClick"
            >
                <LTileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
                    layer-type="base"
                    name="OpenStreetMap"
                />
                <!-- Marcador cuando hay punto seleccionado -->
                <LMarker
                    v-if="selectedPoint"
                    :lat-lng="[selectedPoint.lat, selectedPoint.lng]"
                >
                    <LIcon
                        :icon-size="[24, 24]"
                        :icon-anchor="[12, 12]"
                        class-name="custom-marker"
                    >
                        <div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                    </LIcon>
                    <LPopup>
                        <div class="text-sm">
                            <div><strong>Latitud:</strong> {{ selectedPoint.lat.toFixed(6) }}°</div>
                            <div><strong>Longitud:</strong> {{ selectedPoint.lng.toFixed(6) }}°</div>
                        </div>
                    </LPopup>
                </LMarker>
            </LMap>
        </client-only>



        <!-- Control Panel Flotante -->
        <div class="absolute top-4 right-4 bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-3 w-64 z-[1000]">
            <div v-if="selectedPoint" class="space-y-2">
                <!-- Header compacto -->
                <div class="flex items-center justify-between mb-2">
                    <h3 class="font-semibold text-sm">Punto Seleccionado</h3>
                    <UButton
                        icon="i-heroicons-x-mark"
                        color="neutral"
                        variant="ghost"
                        size="xs"
                        @click="clearSelection"
                    />
                </div>

                <!-- Coordenadas en grid compacto -->
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div class="bg-neutral-50 dark:bg-neutral-900 p-2 rounded">
                        <div class="text-neutral-500 mb-1">Latitud</div>
                        <div class="font-mono font-medium">{{ selectedPoint.lat.toFixed(6) }}°</div>
                    </div>
                    <div class="bg-neutral-50 dark:bg-neutral-900 p-2 rounded">
                        <div class="text-neutral-500 mb-1">Longitud</div>
                        <div class="font-mono font-medium">{{ selectedPoint.lng.toFixed(6) }}°</div>
                    </div>
                </div>

                <!-- Botón único más prominente -->
                <UButton
                    block
                    color="primary"
                    size="sm"
                    icon="i-heroicons-information-circle"
                    @click="getPointInfo"
                    :loading="loading"
                >
                    Ver Detalles
                </UButton>
            </div>

            <!-- Estado vacío compacto -->
            <div v-else class="text-center py-4">
                <UIcon name="i-heroicons-map-pin" class="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p class="text-xs text-neutral-500">
                    Haz clic en el mapa<br>para seleccionar un punto
                </p>
            </div>
        </div>

        <!-- Panel de Resultados -->
        <div
            v-if="coordinateInfo"
            class="absolute bottom-4 left-4 bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-3 w-80 z-[1000] max-h-[32rem] overflow-y-auto"
        >
            <!-- Header compacto -->
            <div class="flex items-center justify-between mb-3 sticky top-0 bg-white dark:bg-neutral-800 pb-2 border-b border-neutral-200 dark:border-neutral-700">
                <h3 class="font-semibold text-sm flex items-center gap-1">
                    <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
                    Detalles Completos
                </h3>
                <UButton
                    icon="i-heroicons-x-mark"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    @click="coordinateInfo = null"
                />
            </div>

            <div class="space-y-2 text-xs">
                <!-- WGS84 -->
                <div class="bg-neutral-50 dark:bg-neutral-900 p-2 rounded">
                    <div class="font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 bg-neutral-500 rounded-full"></span>
                        WGS84
                    </div>
                    <div class="grid grid-cols-2 gap-1 font-mono text-[11px]">
                        <div><span class="text-neutral-500">Lat:</span> {{ coordinateInfo.wgs84.latitude }}</div>
                        <div><span class="text-neutral-500">Lon:</span> {{ coordinateInfo.wgs84.longitude }}</div>
                    </div>
                    <div class="text-[10px] text-neutral-500 mt-1 italic">{{ coordinateInfo.wgs84.format_dms }}</div>
                </div>

                <!-- Web Mercator -->
                <div class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    <div class="font-semibold text-blue-700 dark:text-blue-300 mb-1.5 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        Web Mercator
                        <span class="text-[9px] font-normal text-blue-600 dark:text-blue-400">(EPSG:3857)</span>
                    </div>
                    <div class="grid grid-cols-2 gap-1 font-mono text-[11px]">
                        <div><span class="text-blue-600 dark:text-blue-400">X:</span> {{ coordinateInfo.web_mercator.x.toFixed(2) }}</div>
                        <div><span class="text-blue-600 dark:text-blue-400">Y:</span> {{ coordinateInfo.web_mercator.y.toFixed(2) }}</div>
                    </div>
                </div>

                <!-- UTM -->
                <div class="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                    <div class="font-semibold text-green-700 dark:text-green-300 mb-1.5 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        UTM
                    </div>
                    <div class="space-y-0.5 font-mono text-[11px]">
                        <div><span class="text-green-600 dark:text-green-400">Zona:</span> {{ coordinateInfo.utm.zone }}{{ coordinateInfo.utm.letter }}</div>
                        <div class="grid grid-cols-2 gap-1">
                            <div><span class="text-green-600 dark:text-green-400">E:</span> {{ coordinateInfo.utm.easting.toFixed(2) }}</div>
                            <div><span class="text-green-600 dark:text-green-400">N:</span> {{ coordinateInfo.utm.northing.toFixed(2) }}</div>
                        </div>
                    </div>
                </div>

                <!-- Info adicional -->
                <div class="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                    <div class="font-semibold text-purple-700 dark:text-purple-300 mb-1.5 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                        Info Adicional
                    </div>
                    <div class="grid grid-cols-2 gap-1 text-[11px]">
                        <div><span class="text-purple-600 dark:text-purple-400">Hemisferio:</span> {{ coordinateInfo.hemisphere }}</div>
                        <div><span class="text-purple-600 dark:text-purple-400">Zona:</span> {{ coordinateInfo.timezone_approx }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { PointExpression } from 'leaflet'
import L from 'leaflet'
const props = defineProps({
    center: {
        type: Array as PropType<[number, number]>,
        default: () => [19.4326, -99.1332] // Ciudad de México
    },
    zoom: {
        type: Number,
        default: 13
    }
})

const emit = defineEmits(['pointSelected', 'infoLoaded'])

const { getCoordinateInfo } = useCoordinateAPI()

const mapRef = ref<any>(null)
const selectedPoint = ref<{ lat: number; lng: number } | null>(null)
const coordinateInfo = ref<any>(null)
const loading = ref(false)

const handleMapClick = (event: any) => {
    if (event.latlng) {
        selectedPoint.value = {
            lat: event.latlng.lat,
            lng: event.latlng.lng
        }
        emit('pointSelected', selectedPoint.value)
    }
}

const getPointInfo = async () => {
    if (!selectedPoint.value) return

    loading.value = true
    try {
        const info = await getCoordinateInfo(selectedPoint.value.lat, selectedPoint.value.lng)
        coordinateInfo.value = info
        emit('infoLoaded', info)
    } catch (error) {
        console.error('Error obteniendo información:', error)
    } finally {
        loading.value = false
    }
}

const clearSelection = () => {
    selectedPoint.value = null
    coordinateInfo.value = null
}

const addMarker = (lat: number, lng: number) => {
    selectedPoint.value = { lat, lng }
    emit('pointSelected', selectedPoint.value)
}

defineExpose({
    addMarker,
    clearSelection,
    getMap: () => mapRef.value?.leafletObject
})
</script>

<style scoped>
:deep(.custom-marker) {
    background: transparent;
    border: none;
}
</style>