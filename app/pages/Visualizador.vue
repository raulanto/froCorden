<template>
    <UContainer>
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <UIcon name="i-heroicons-map" class="w-6 h-6 text-white"/>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold">Visor de Archivos Geográficos</h2>
                            <p class="text-xs text-neutral-500">Carga y visualiza KMZ, KML, json y CSV</p>
                        </div>
                    </div>
                    <UBadge v-if="features.length > 0" color="success" variant="solid" size="lg">
                        {{ features.length }} elementos
                    </UBadge>
                </div>
            </template>

            <div class="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-6">
                <!-- Panel IZQUIERDO: Mapa -->
                <div class="order-2 lg:order-1">
                    <div class="space-y-4">
                        <!-- Área de carga de archivo -->
                        <div
                            class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border-2 border-dashed border-green-300 dark:border-green-700">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm">
                                    <UIcon name="i-heroicons-arrow-up-tray" class="w-6 h-6 text-green-600"/>
                                </div>
                                <div class="flex-1">
                                    <label class="block">
                                        <input
                                            type="file"
                                            accept=".kmz,.kml,.json,.csv"
                                            @change="handleFileUpload"
                                            class="hidden"
                                            ref="fileInput"
                                        />
                                        <UButton
                                            color="success"
                                            icon="i-heroicons-document-arrow-up"
                                            size="md"
                                            @click="$refs.fileInput.click()"
                                            :loading="loading"
                                        >
                                            {{ fileName || 'Seleccionar archivo KMZ/KML/json/CSV' }}
                                        </UButton>
                                    </label>
                                    <p class="text-xs text-green-600 dark:text-green-400 mt-1">
                                        Formatos soportados: .kmz, .kml, .json, .csv
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Mapa -->
                        <div class="relative">
                            <ClientOnly>
                                <div v-if="isClient"
                                     class="rounded-xl overflow-hidden shadow-lg border-2 border-neutral-200 dark:border-neutral-700">
                                    <LMap
                                        ref="mapRef"
                                        :zoom="mapZoom"
                                        :center="mapCenter"
                                        :use-global-leaflet="false"
                                        :style="{ height: '600px' }"
                                        class="w-full z-0"
                                    >
                                        <LTileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution="&copy; OpenStreetMap contributors"
                                        />

                                        <!-- Renderizar Marcadores (Points) -->
                                        <template v-for="(feature, index) in visibleFeatures" :key="`feature-${index}`">
                                            <LMarker
                                                v-if="feature.type === 'Point'"
                                                :lat-lng="feature.coordinates"
                                            >
                                                <LIcon :icon-anchor="[15, 30]">
                                                    <div class="marker-pin"
                                                         :style="{ '--marker-color': feature.color }">
                                                        <div class="marker-icon">📍</div>
                                                    </div>
                                                </LIcon>
                                                <LPopup>
                                                    <div class="popup-content">
                                                        <div class="popup-header">
                                                            <div class="popup-badge"
                                                                 :style="{ backgroundColor: feature.color }">
                                                                📍
                                                            </div>
                                                            <span class="popup-title">{{
                                                                    feature.name || 'Punto sin nombre'
                                                                }}</span>
                                                        </div>
                                                        <div v-if="feature.description" class="popup-description" v-html="feature.description">
                                                        </div>
                                                        <div class="popup-coords">
                                                            <div class="coord-row">
                                                                <span class="coord-label">Latitud:</span>
                                                                <span class="coord-value">{{
                                                                        feature.coordinates[0].toFixed(6)
                                                                    }}</span>
                                                            </div>
                                                            <div class="coord-row">
                                                                <span class="coord-label">Longitud:</span>
                                                                <span class="coord-value">{{
                                                                        feature.coordinates[1].toFixed(6)
                                                                    }}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </LPopup>
                                            </LMarker>

                                            <!-- Renderizar Líneas (LineString) -->
                                            <LPolyline
                                                v-else-if="feature.type === 'LineString'"
                                                :lat-lngs="feature.coordinates"
                                                :color="feature.color"
                                                :weight="4"
                                            >
                                                <LPopup>
                                                    <div class="popup-content">
                                                        <div class="popup-header">
                                                            <div class="popup-badge"
                                                                 :style="{ backgroundColor: feature.color }">
                                                                📏
                                                            </div>
                                                            <span class="popup-title">{{
                                                                    feature.name || 'Línea sin nombre'
                                                                }}</span>
                                                        </div>
                                                        <div v-if="feature.description" class="popup-description" v-html="feature.description">
                                                        </div>
                                                    </div>
                                                </LPopup>
                                            </LPolyline>

                                            <!-- Renderizar Polígonos -->
                                            <LPolygon
                                                v-else-if="feature.type === 'Polygon'"
                                                :lat-lngs="feature.coordinates"
                                                :color="feature.color"
                                                :weight="3"
                                                :fillColor="feature.color"
                                                :fillOpacity="0.3"
                                            >
                                                <LPopup>
                                                    <div class="popup-content">
                                                        <div class="popup-header">
                                                            <div class="popup-badge"
                                                                 :style="{ backgroundColor: feature.color }">
                                                                ⬟
                                                            </div>
                                                            <span class="popup-title">{{
                                                                    feature.name || 'Polígono sin nombre'
                                                                }}</span>
                                                        </div>
                                                        <div v-if="feature.description" class="popup-description" v-html="feature.description">
                                                        </div>
                                                    </div>
                                                </LPopup>
                                            </LPolygon>
                                        </template>
                                    </LMap>
                                </div>

                                <template #fallback>
                                    <div
                                        class="w-full h-[600px] flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                                        <div class="text-center">
                                            <UIcon name="i-heroicons-map"
                                                   class="w-16 h-16 text-neutral-400 mx-auto mb-3 animate-pulse"/>
                                            <p class="text-sm text-neutral-500">Cargando mapa interactivo...</p>
                                        </div>
                                    </div>
                                </template>
                            </ClientOnly>

                            <!-- Controles del mapa -->
                            <div v-if="features.length > 0" class="absolute top-4 right-4 z-[1000] space-y-2">
                                <UButton
                                    color="neutral"
                                    icon="i-heroicons-arrows-pointing-out"
                                    size="sm"
                                    @click="fitBounds"
                                >
                                    Ajustar vista
                                </UButton>
                            </div>

                            <!-- Estadísticas -->
                            <div v-if="features.length > 0"
                                 class="mt-3 bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm border border-neutral-200 dark:border-neutral-700">
                                <div class="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                                    Estadísticas del archivo
                                </div>
                                <div class="grid grid-cols-3 gap-2 text-xs">
                                    <div class="flex items-center gap-2">
                                        <div class="w-4 h-4 rounded-full bg-blue-500"></div>
                                        <span>{{ countByType('Point') }} Puntos</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <div class="w-4 h-1 bg-green-500"></div>
                                        <span>{{ countByType('LineString') }} Líneas</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <div class="w-4 h-4 bg-purple-500 opacity-50 border border-purple-500"></div>
                                        <span>{{ countByType('Polygon') }} Polígonos</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Panel DERECHO: Lista de elementos -->
                <div class="order-1 lg:order-2 space-y-4">
                    <!-- Instrucciones -->
                    <div
                        class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                        <div class="flex items-start gap-3">
                            <div class="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                                <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-white"/>
                            </div>
                            <div class="text-xs">
                                <div class="font-semibold text-green-900 dark:text-green-100 mb-2">¿Cómo usar?</div>
                                <ol class="list-decimal list-inside space-y-1 text-green-700 dark:text-green-300">
                                    <li>Haz clic en "Seleccionar archivo"</li>
                                    <li>Elige un archivo KMZ, KML, json o CSV</li>
                                    <li>El mapa mostrará todas las geometrías</li>
                                    <li>Haz clic en elementos para ver detalles</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <!-- Lista de elementos -->
                    <div
                        class="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-700">
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="text-sm font-semibold flex items-center gap-2">
                                <UIcon name="i-heroicons-list-bullet" class="w-4 h-4"/>
                                Elementos Cargados
                            </h3>
                            <div class="flex gap-2">
                                <UButton
                                    v-if="features.length > 0"
                                    size="xs"
                                    color="neutral"
                                    variant="ghost"
                                    @click="toggleAll(true)"
                                >
                                    Mostrar todos
                                </UButton>
                                <UButton
                                    v-if="features.length > 0"
                                    size="xs"
                                    color="neutral"
                                    variant="ghost"
                                    @click="toggleAll(false)"
                                >
                                    Ocultar todos
                                </UButton>
                            </div>
                        </div>

                        <div v-if="features.length === 0" class="text-center py-8 text-neutral-500">
                            <UIcon name="i-heroicons-document-arrow-up" class="w-12 h-12 mx-auto mb-2 opacity-50"/>
                            <p class="text-sm">No hay elementos cargados</p>
                            <p class="text-xs mt-1">Carga un archivo</p>
                        </div>

                        <div v-else class="space-y-2 max-h-[500px] overflow-y-auto">
                            <div
                                v-for="(feature, index) in features"
                                :key="index"
                                class="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                                :class="{ 'opacity-40': !feature.visible }"
                            >
                                <div class="flex items-center gap-3 flex-1">
                                    <div
                                        class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0"
                                        :style="{ backgroundColor: feature.color }"
                                    >
                                        {{ getFeatureIcon(feature.type) }}
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="text-sm font-medium truncate">
                                            {{ feature.name || `${feature.type} ${index + 1}` }}
                                        </div>
                                        <div class="text-xs text-neutral-500">
                                            {{ feature.type }}
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <button
                                        @click="zoomToFeature(feature)"
                                        class="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
                                        title="Centrar en mapa"
                                    >
                                        <UIcon name="i-heroicons-magnifying-glass-plus" class="w-4 h-4"/>
                                    </button>
                                    <button
                                        @click="toggleFeature(index)"
                                        class="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
                                        :title="feature.visible ? 'Ocultar' : 'Mostrar'"
                                    >
                                        <UIcon :name="feature.visible ? 'i-heroicons-eye' : 'i-heroicons-eye-slash'"
                                               class="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Información del archivo -->
                    <div v-if="fileInfo"
                         class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <div
                            class="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                            <UIcon name="i-heroicons-document-text" class="w-4 h-4"/>
                            Información del Archivo
                        </div>
                        <div class="space-y-1 text-xs">
                            <div class="flex justify-between">
                                <span class="text-blue-600 dark:text-blue-400">Nombre:</span>
                                <span class="font-semibold text-blue-700 dark:text-blue-300 truncate">{{ fileInfo.name }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-blue-600 dark:text-blue-400">Tamaño:</span>
                                <span class="font-semibold text-blue-700 dark:text-blue-300">{{
                                        formatFileSize(fileInfo.size)
                                    }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-blue-600 dark:text-blue-400">Tipo:</span>
                                <span class="font-semibold text-blue-700 dark:text-blue-300">{{ fileInfo.type }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Botones de acción -->
                    <div v-if="features.length > 0" class="grid grid-cols-2 gap-2">
                        <UButton
                            block
                            size="sm"
                            color="primary"
                            variant="soft"
                            icon="i-heroicons-arrow-down-tray"
                            @click="exportGeoJSON"
                        >
                            Exportar json
                        </UButton>
                        <UButton
                            block
                            size="sm"
                            color="error"
                            variant="soft"
                            icon="i-heroicons-trash"
                            @click="clearAll"
                        >
                            Limpiar todo
                        </UButton>
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
    </UContainer>
</template>

<script setup lang="ts">
import JSZip from 'jszip'

// Asegúrate de tener @vue-leaflet/vue-leaflet instalado
// Si usas Nuxt, deberías tener un plugin para cargarlo en modo cliente
// p.ej. ~/plugins/leaflet.client.ts
// import { LMap, LTileLayer, LMarker, LPopup, LIcon, LPolyline, LPolygon } from '@vue-leaflet/vue-leaflet';
// import 'leaflet/dist/leaflet.css';

const toast = useToast()

const features = ref<any[]>([])
const fileName = ref<string>('')
const fileInfo = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const mapRef = ref<any>(null)
const mapZoom = ref(6)
const mapCenter = ref<[number, number]>([19.4326, -99.1332]) // Centro en Ciudad de México
const isClient = ref(false)

const visibleFeatures = computed(() => {
    return features.value.filter(f => f.visible)
})

onMounted(() => {
    isClient.value = true
})

const getFeatureIcon = (type: string) => {
    const icons: Record<string, string> = {
        'Point': '📍',
        'LineString': '📏',
        'Polygon': '⬟'
    }
    return icons[type] || '●'
}

const countByType = (type: string) => {
    return features.value.filter(f => f.type === type).length
}

const handleFileUpload = async (event: any) => {
    const file = event.target.files[0]
    if (!file) return

    loading.value = true
    error.value = null
    fileName.value = file.name
    features.value = [] // Limpiar features anteriores

    fileInfo.value = {
        name: file.name,
        size: file.size,
        type: 'Desconocido'
    }

    try {
        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        let fileType = ''

        if (fileExtension === 'kmz') {
            fileType = 'KMZ (KML Comprimido)'
            const zip = new JSZip()
            const contents = await zip.loadAsync(file)
            const kmlFile = Object.keys(contents.files).find(name => name.endsWith('.kml'))
            if (!kmlFile) {
                throw new Error('No se encontró archivo KML dentro del KMZ')
            }
            const kmlContent = await contents.files[kmlFile].async('string')
            parseKML(kmlContent)

        } else if (fileExtension === 'kml') {
            fileType = 'KML'
            const kmlContent = await file.text()
            parseKML(kmlContent)

        } else if (fileExtension === 'json') {
            fileType = 'json'
            const geojsonContent = await file.text()
            parseGeoJSON(geojsonContent)

        } else if (fileExtension === 'csv') {
            fileType = 'CSV'
            const csvContent = await file.text()
            parseCSV(csvContent)

        } else {
            throw new Error(`Formato de archivo no soportado: .${fileExtension}`)
        }

        fileInfo.value.type = fileType
        toast.add({
            title: 'Archivo cargado exitosamente',
            description: `${features.value.length} elementos encontrados`,
            color: 'success',
            icon: 'i-heroicons-check-circle',
        })

        // Ajustar vista del mapa
        setTimeout(() => fitBounds(), 500)

    } catch (e: any) {
        error.value = e.message || 'Error al cargar el archivo'
        features.value = []
        fileInfo.value = null
        fileName.value = ''
        toast.add({
            title: 'Error al cargar archivo',
            description: error.value,
            color: 'error',
            timeout: 5000
        })
    } finally {
        loading.value = false
        // Reset file input para permitir recargar el mismo archivo
        event.target.value = null
    }
}

/**
 * Parsea contenido KML y lo convierte a la estructura de 'features'
 */
const parseKML = (kmlString: string) => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(kmlString, 'text/xml')
    const newFeatures: any[] = []

    // Parsear Placemarks
    const placemarks = xmlDoc.getElementsByTagName('Placemark')

    for (let i = 0; i < placemarks.length; i++) {
        const placemark = placemarks[i]

        const name = placemark.getElementsByTagName('name')[0]?.textContent || ''
        const description = placemark.getElementsByTagName('description')[0]?.textContent || ''
        const color = getRandomColor(i)

        // Procesar Point
        const point = placemark.getElementsByTagName('Point')[0]
        if (point) {
            const coords = point.getElementsByTagName('coordinates')[0]?.textContent?.trim()
            if (coords) {
                const [lng, lat] = coords.split(',').map(Number)
                newFeatures.push({
                    type: 'Point',
                    name,
                    description,
                    coordinates: [lat, lng], // KML es [lng, lat], Leaflet espera [lat, lng]
                    color,
                    visible: true
                })
            }
        }

        // Procesar LineString
        const lineString = placemark.getElementsByTagName('LineString')[0]
        if (lineString) {
            const coords = lineString.getElementsByTagName('coordinates')[0]?.textContent?.trim()
            if (coords) {
                const points = coords.split(/\s+/).filter(c => c).map(coord => {
                    const [lng, lat] = coord.split(',').map(Number)
                    return [lat, lng] // Swap
                })
                newFeatures.push({
                    type: 'LineString',
                    name,
                    description,
                    coordinates: points,
                    color,
                    visible: true
                })
            }
        }

        // Procesar Polygon
        const polygon = placemark.getElementsByTagName('Polygon')[0]
        if (polygon) {
            const outerBoundary = polygon.getElementsByTagName('outerBoundaryIs')[0]
            const linearRing = outerBoundary?.getElementsByTagName('LinearRing')[0]
            const coords = linearRing?.getElementsByTagName('coordinates')[0]?.textContent?.trim()

            if (coords) {
                const points = coords.split(/\s+/).filter(c => c).map(coord => {
                    const [lng, lat] = coord.split(',').map(Number)
                    return [lat, lng] // Swap
                })
                newFeatures.push({
                    type: 'Polygon',
                    name,
                    description,
                    coordinates: points,
                    color,
                    visible: true
                })
            }
        }
    }
    features.value = newFeatures
}

/**
 * Parsea contenido json y lo convierte a la estructura de 'features'
 */
const parseGeoJSON = (jsonString: string) => {
    const geojsonData = JSON.parse(jsonString)
    const newFeatures: any[] = []
    let featuresList: any[] = []

    if (geojsonData.type === 'FeatureCollection') {
        featuresList = geojsonData.features
    } else if (geojsonData.type === 'Feature') {
        featuresList = [geojsonData]
    } else {
        throw new Error('Formato json no válido. Se esperaba FeatureCollection o Feature.');
    }

    featuresList.forEach((feature: any, index: number) => {
        const { geometry, properties } = feature
        if (!geometry) return

        const name = properties?.name || properties?.Name || `Elemento ${index + 1}`
        const description = properties?.description || properties?.Description || ''
        const color = properties?.color || getRandomColor(index)
        const type = geometry.type
        let coordinates: any

        // json es [lng, lat], Leaflet espera [lat, lng]
        if (type === 'Point') {
            const [lng, lat] = geometry.coordinates
            coordinates = [lat, lng]
        } else if (type === 'LineString') {
            coordinates = geometry.coordinates.map((c: number[]) => [c[1], c[0]]) // Swap
        } else if (type === 'Polygon') {
            // Solo tomamos el anillo exterior por simplicidad, como en KML
            coordinates = geometry.coordinates[0].map((c: number[]) => [c[1], c[0]]) // Swap
        } else {
            return // Omitir tipos no soportados (MultiPoint, etc.)
        }

        newFeatures.push({
            type,
            name,
            description,
            coordinates,
            color,
            visible: true
        })
    })
    features.value = newFeatures
}

/**
 * Parsea contenido CSV y lo convierte a la estructura de 'features' (solo Puntos)
 */
const parseCSV = (csvString: string) => {
    const newFeatures: any[] = []
    const lines = csvString.trim().split(/\r?\n/)
    if (lines.length < 2) {
        throw new Error('El archivo CSV está vacío o no contiene datos.');
    }

    const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));

    // Función para encontrar el índice de una columna por posibles nombres
    const findCol = (keys: string[]) => keys.reduce((acc, key) => (acc !== -1 ? acc : header.indexOf(key)), -1);

    const latCol = findCol(['lat', 'latitude', 'latitud']);
    const lngCol = findCol(['lon', 'lng', 'longitude', 'longitud']);

    if (latCol === -1 || lngCol === -1) {
        throw new Error(`No se pudieron encontrar las columnas de latitud/longitud. (Buscando: 'lat', 'latitude', 'latitud', 'lon', 'lng', 'longitude', 'longitud')`);
    }

    // Buscar columnas opcionales de nombre y descripción
    const nameCol = findCol(['name', 'nombre', 'title', 'titulo']);
    const descCol = findCol(['description', 'descripcion']);

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue; // Omitir líneas vacías

        // Un parser de CSV muy simple (no maneja comas dentro de comillas)
        // Para algo más robusto, se necesitaría una librería
        const row = lines[i].split(',');

        if (row.length <= Math.max(latCol, lngCol)) continue; // Skip malformed rows

        const lat = parseFloat(row[latCol]);
        const lng = parseFloat(row[lngCol]);

        if (!isNaN(lat) && !isNaN(lng)) {
            const name = nameCol !== -1 ? (row[nameCol] || `Punto ${i}`) : `Punto ${i}`;
            let description = descCol !== -1 ? (row[descCol] || '') : '';

            // Si no hay descripción, construir una con el resto de datos
            if (!description) {
                description = header.map((h, idx) => {
                    if (idx !== latCol && idx !== lngCol && idx !== nameCol && row[idx]) {
                        return `<strong>${h}:</strong> ${row[idx]}`;
                    }
                    return '';
                }).filter(Boolean).join('<br>');
            }

            newFeatures.push({
                type: 'Point', // CSVs siempre se parsean como Puntos
                name: name,
                description: description,
                coordinates: [lat, lng], // CSV ya suele estar en [lat, lng]
                color: getRandomColor(i),
                visible: true
            });
        }
    }

    if (newFeatures.length === 0) {
        throw new Error('No se encontraron puntos válidos en el CSV.');
    }
    features.value = newFeatures
}

const getRandomColor = (index: number) => {
    const colors = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
        '#06b6d4', '#84cc16', '#f43f5e', '#6366f1'
    ]
    return colors[index % colors.length]
}

const toggleFeature = (index: number) => {
    features.value[index].visible = !features.value[index].visible
}

const toggleAll = (visible: boolean) => {
    features.value.forEach(f => f.visible = visible)
}

const zoomToFeature = (feature: any) => {
    if (!mapRef.value?.leafletObject) return

    if (feature.type === 'Point') {
        mapCenter.value = feature.coordinates
        mapRef.value.leafletObject.flyTo(feature.coordinates, 15) // Usar flyTo para suavidad
    } else if (feature.type === 'LineString' || feature.type === 'Polygon') {
        const bounds = feature.coordinates
        mapRef.value.leafletObject.flyToBounds(bounds, {padding: [50, 50]})
    }
}

const fitBounds = () => {
    if (!mapRef.value?.leafletObject || features.value.length === 0) return

    const allCoords: any[] = []

    features.value.forEach(feature => {
        if (feature.type === 'Point') {
            allCoords.push(feature.coordinates)
        } else if (feature.type === 'LineString' || feature.type === 'Polygon') {
            // Asegurarse de no desanidar si ya es plano (para Puntos)
            allCoords.push(...feature.coordinates)
        }
    })

    if (allCoords.length > 0) {
        mapRef.value.leafletObject.fitBounds(allCoords, {padding: [50, 50]})
    }
}

const clearAll = () => {
    features.value = []
    fileName.value = ''
    fileInfo.value = null
    error.value = null
    mapRef.value.leafletObject.flyTo([19.4326, -99.1332], 6)

    toast.add({
        title: 'Datos limpiados',
        color: 'neutral',

    })
}

const exportGeoJSON = () => {
    const json = {
        type: 'FeatureCollection',
        features: features.value.map(f => {
            let coords: any
            // Convertir de [lat, lng] de Leaflet a [lng, lat] de json
            if (f.type === 'Point') {
                coords = [f.coordinates[1], f.coordinates[0]] // Swap
            } else if (f.type === 'LineString') {
                coords = f.coordinates.map((c: number[]) => [c[1], c[0]]) // Swap
            } else if (f.type === 'Polygon') {
                // json Polygons requieren un array extra de anidación para los anillos
                coords = [f.coordinates.map((c: number[]) => [c[1], c[0]])] // Swap y anidar
            }

            return {
                type: 'Feature',
                properties: {
                    name: f.name,
                    description: f.description,
                    color: f.color
                },
                geometry: {
                    type: f.type,
                    coordinates: coords
                }
            }
        })
    }

    const blob = new Blob([JSON.stringify(json, null, 2)], {type: 'application/json'})
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName.value || 'export'}_${Date.now()}.json`
    a.click()
    window.URL.revokeObjectURL(url)

    toast.add({
        title: 'json exportado',
        color: 'success',

    })
}

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
/* Estilos para marcadores */
.marker-pin {
    position: relative;
    width: 30px;
    height: 30px;
    cursor: pointer;
}

.marker-pin::before {
    content: '';
    position: absolute;
    width: 30px;
    height: 30px;
    background: var(--marker-color);
    border: 3px solid white;
    border-radius: 50% 50% 50% 0;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
    transform: rotate(-45deg);
    top: 0;
    left: 0;
}

.marker-icon {
    position: absolute;
    top: 4px;
    left: 7px;
    font-size: 16px;
    z-index: 10;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

/* Estilos para popups */
.popup-content {
    min-width: 220px;
    max-width: 300px; /* Añadido para evitar popups demasiado anchos */
    padding: 4px;
}

.popup-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e5e7eb;
}

.popup-badge {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    flex-shrink: 0; /* Evitar que el ícono se encoja */
}

.popup-title {
    font-weight: 600;
    font-size: 14px;
    color: #1f2937;
    flex: 1;
    word-break: break-word; /* Evitar desbordamiento de títulos largos */
}

.popup-description {
    background: #f9fafb;
    border-radius: 6px;
    padding: 8px;
    margin-bottom: 10px;
    font-size: 12px;
    color: #4b5563;
    line-height: 1.4;
    max-height: 150px; /* Limitar altura de descripción */
    overflow-y: auto; /* Scroll si es muy larga */
}

/* Estilos para la descripción de CSV */
.popup-description :deep(strong) {
    color: #374151;
}
.popup-description :deep(br) {
    margin-bottom: 4px;
}

.popup-coords {
    background: #f9fafb;
    border-radius: 8px;
    padding: 8px;
}

.coord-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
    font-size: 12px;
}

.coord-label {
    color: #6b7280;
    font-weight: 500;
}

.coord-value {
    font-family: 'Courier New', monospace;
    color: #1f2937;
    font-weight: 600;
}

/* Estilos del mapa */
:deep(.leaflet-container) {
    background: #f3f4f6;
    outline: none;
}

:deep(.leaflet-marker-icon) {
    background: transparent !important;
    border: none !important;
}

:deep(.leaflet-popup-content-wrapper) {
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    padding: 12px;
}

:deep(.leaflet-popup-content) {
    margin: 0;
}

:deep(.leaflet-popup-tip) {
    background: white;
    box-shadow: 0 3px 14px rgba(0, 0, 0, 0.2);
}
</style>