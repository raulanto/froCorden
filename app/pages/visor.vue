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
                            <p class="text-xs text-neutral-500">Carga y visualiza KMZ, KML, GeoJSON y CSV</p>
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
                                            accept=".kmz,.kml,.json,.geojson,.csv"
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
                                            {{ fileName || 'Seleccionar archivo' }}
                                        </UButton>
                                    </label>
                                    <p class="text-xs text-green-600 dark:text-green-400 mt-1">
                                        Formatos: .kmz, .kml, .json, .geojson, .csv
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

                                                        <!-- Descripción -->
                                                        <div v-if="feature.description" class="popup-description" v-html="feature.description"></div>

                                                        <!-- Propiedades adicionales -->
                                                        <div v-if="feature.properties && Object.keys(feature.properties).length > 0" class="popup-properties">
                                                            <div class="properties-title">Propiedades</div>
                                                            <div class="properties-grid">
                                                                <div v-for="(value, key) in feature.properties" :key="key" class="property-row">
                                                                    <span class="property-key">{{ key }}:</span>
                                                                    <span class="property-value">{{ value }}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <!-- Coordenadas -->
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

                                                        <!-- Descripción -->
                                                        <div v-if="feature.description" class="popup-description" v-html="feature.description"></div>

                                                        <!-- Propiedades adicionales -->
                                                        <div v-if="feature.properties && Object.keys(feature.properties).length > 0" class="popup-properties">
                                                            <div class="properties-title">Propiedades</div>
                                                            <div class="properties-grid">
                                                                <div v-for="(value, key) in feature.properties" :key="key" class="property-row">
                                                                    <span class="property-key">{{ key }}:</span>
                                                                    <span class="property-value">{{ value }}</span>
                                                                </div>
                                                            </div>
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

                                                        <!-- Descripción -->
                                                        <div v-if="feature.description" class="popup-description" v-html="feature.description"></div>

                                                        <!-- Propiedades adicionales -->
                                                        <div v-if="feature.properties && Object.keys(feature.properties).length > 0" class="popup-properties">
                                                            <div class="properties-title">Propiedades</div>
                                                            <div class="properties-grid">
                                                                <div v-for="(value, key) in feature.properties" :key="key" class="property-row">
                                                                    <span class="property-key">{{ key }}:</span>
                                                                    <span class="property-value">{{ value }}</span>
                                                                </div>
                                                            </div>
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
                                    <li>Elige un archivo KMZ, KML, GeoJSON o CSV</li>
                                    <li>El mapa mostrará todas las geometrías</li>
                                    <li>Haz clic en elementos para ver propiedades</li>
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
                            <p class="text-xs mt-1">Carga un archivo geográfico</p>
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
                                            <span v-if="feature.properties && Object.keys(feature.properties).length > 0">
                                                • {{ Object.keys(feature.properties).length }} props
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <button
                                        @click="openEditProperties(index)"
                                        class="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
                                        title="Editar propiedades"
                                    >
                                        <UIcon name="i-heroicons-pencil-square" class="w-4 h-4"/>
                                    </button>
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
                                <span class="font-semibold text-blue-700 dark:text-blue-300 truncate max-w-[180px]">{{ fileInfo.name }}</span>
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
                            Exportar GeoJSON
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

            <!-- Modal para editar propiedades -->
            <UModal v-model:open="showEditModal" :ui="{ width: 'sm:max-w-2xl' }">

                    <template #header>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                                    <UIcon name="i-heroicons-pencil-square" class="w-5 h-5 text-white"/>
                                </div>
                                <div>
                                    <h3 class="text-lg font-bold">Editar Propiedades</h3>
                                    <p class="text-xs text-neutral-500">{{ editingFeature?.name || 'Elemento' }}</p>
                                </div>
                            </div>
                            <UButton
                                color="neutral"
                                variant="ghost"
                                icon="i-heroicons-x-mark"
                                @click="closeEditModal"
                            />
                        </div>
                    </template>
                    <template #body >
                        <div v-if="editingFeature" class="space-y-4">
                            <!-- Propiedades básicas -->
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-sm font-medium mb-1">Nombre</label>
                                    <UInput
                                        v-model="editingFeature.name"
                                        placeholder="Nombre del elemento"
                                        size="md"
                                    />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium mb-1">Descripción</label>
                                    <UTextarea
                                        v-model="editingFeature.description"
                                        placeholder="Descripción del elemento"
                                        :rows="3"
                                    />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium mb-1">Color</label>
                                    <div class="flex gap-2 items-center">
                                        <input
                                            type="color"
                                            v-model="editingFeature.color"
                                            class="w-12 h-10 rounded border border-neutral-300 cursor-pointer"
                                        />
                                        <UInput
                                            v-model="editingFeature.color"
                                            placeholder="#3b82f6"
                                            size="md"
                                            class="flex-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <!-- Propiedades personalizadas -->
                            <div class="border-t pt-4">
                                <div class="flex items-center justify-between mb-3">
                                    <h4 class="text-sm font-semibold">Propiedades Personalizadas</h4>
                                    <UButton
                                        size="xs"
                                        color="primary"
                                        icon="i-heroicons-plus"
                                        @click="addNewProperty"
                                    >
                                        Agregar Propiedad
                                    </UButton>
                                </div>

                                <div v-if="!editingFeature.properties || Object.keys(editingFeature.properties).length === 0"
                                     class="text-center py-4 text-neutral-500 text-sm">
                                    No hay propiedades personalizadas
                                </div>

                                <div v-else class="space-y-2 max-h-64 overflow-y-auto">
                                    <div
                                        v-for="(value, key) in editingFeature.properties"
                                        :key="key"
                                        class="flex gap-2 items-start bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg"
                                    >
                                        <div class="flex-1 grid grid-cols-2 gap-2">
                                            <UInput
                                                :model-value="key"
                                                @update:model-value="updatePropertyKey(key, $event)"
                                                placeholder="Clave"
                                                size="sm"
                                            />
                                            <UInput
                                                v-model="editingFeature.properties[key]"
                                                placeholder="Valor"
                                                size="sm"
                                            />
                                        </div>
                                        <UButton
                                            color="error"
                                            variant="soft"
                                            icon="i-heroicons-trash"
                                            size="xs"
                                            @click="deleteProperty(key)"
                                        />
                                    </div>
                                </div>
                            </div>

                            <!-- Nueva propiedad -->
                            <div v-if="showNewPropertyForm" class="border-t pt-4">
                                <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-3">
                                    <h5 class="text-sm font-semibold text-blue-700 dark:text-blue-300">Nueva Propiedad</h5>
                                    <div class="grid grid-cols-2 gap-2">
                                        <UInput
                                            v-model="newPropertyKey"
                                            placeholder="Nombre de la propiedad"
                                            size="md"
                                        />
                                        <UInput
                                            v-model="newPropertyValue"
                                            placeholder="Valor"
                                            size="md"
                                        />
                                    </div>
                                    <div class="flex gap-2">
                                        <UButton
                                            size="sm"
                                            color="primary"
                                            @click="saveNewProperty"
                                            :disabled="!newPropertyKey || !newPropertyValue"
                                        >
                                            Guardar
                                        </UButton>
                                        <UButton
                                            size="sm"
                                            color="neutral"
                                            variant="ghost"
                                            @click="cancelNewProperty"
                                        >
                                            Cancelar
                                        </UButton>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </template>


                    <template #footer>
                        <div class="flex justify-end gap-2">
                            <UButton
                                color="neutral"
                                variant="ghost"
                                @click="closeEditModal"
                            >
                                Cancelar
                            </UButton>
                            <UButton
                                color="primary"
                                @click="saveProperties"
                            >
                                Guardar Cambios
                            </UButton>
                        </div>
                    </template>

            </UModal>
        </UCard>
    </UContainer>
</template>

<script setup lang="ts">
import JSZip from 'jszip'

const toast = useToast()

const features = ref<any[]>([])
const fileName = ref<string>('')
const fileInfo = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const mapRef = ref<any>(null)
const mapZoom = ref(6)
const mapCenter = ref<[number, number]>([19.4326, -99.1332])
const isClient = ref(false)

// Estados para edición de propiedades
const showEditModal = ref(false)
const editingFeature = ref<any>(null)
const editingIndex = ref<number>(-1)
const showNewPropertyForm = ref(false)
const newPropertyKey = ref('')
const newPropertyValue = ref('')

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
    features.value = []

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

        } else if (fileExtension === 'json' || fileExtension === 'geojson') {
            fileType = 'GeoJSON'
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
        event.target.value = null
    }
}

const parseKML = (kmlString: string) => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(kmlString, 'text/xml')
    const newFeatures: any[] = []

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
                    coordinates: [lat, lng],
                    color,
                    visible: true,
                    properties: {}
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
                    return [lat, lng]
                })
                newFeatures.push({
                    type: 'LineString',
                    name,
                    description,
                    coordinates: points,
                    color,
                    visible: true,
                    properties: {}
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
                    return [lat, lng]
                })
                newFeatures.push({
                    type: 'Polygon',
                    name,
                    description,
                    coordinates: points,
                    color,
                    visible: true,
                    properties: {}
                })
            }
        }
    }
    features.value = newFeatures
}

const parseGeoJSON = (jsonString: string) => {
    const geojsonData = JSON.parse(jsonString)
    const newFeatures: any[] = []
    let featuresList: any[] = []

    if (geojsonData.type === 'FeatureCollection') {
        featuresList = geojsonData.features
    } else if (geojsonData.type === 'Feature') {
        featuresList = [geojsonData]
    } else {
        throw new Error('Formato GeoJSON no válido. Se esperaba FeatureCollection o Feature.')
    }

    featuresList.forEach((feature: any, index: number) => {
        const { geometry, properties } = feature
        if (!geometry) return

        // Extraer propiedades comunes
        const name = properties?.name || properties?.Name || `Elemento ${index + 1}`
        const description = properties?.description || properties?.Description || ''
        const color = properties?.color || getRandomColor(index)

        // Guardar TODAS las propiedades originales (excepto name, description, color que ya manejamos)
        const additionalProperties: Record<string, any> = {}
        if (properties) {
            Object.keys(properties).forEach(key => {
                const lowerKey = key.toLowerCase()
                if (lowerKey !== 'name' && lowerKey !== 'description' && lowerKey !== 'color') {
                    additionalProperties[key] = properties[key]
                }
            })
        }

        const type = geometry.type
        let coordinates: any

        if (type === 'Point') {
            const [lng, lat] = geometry.coordinates
            coordinates = [lat, lng]
        } else if (type === 'LineString') {
            coordinates = geometry.coordinates.map((c: number[]) => [c[1], c[0]])
        } else if (type === 'Polygon') {
            coordinates = geometry.coordinates[0].map((c: number[]) => [c[1], c[0]])
        } else {
            return
        }

        newFeatures.push({
            type,
            name,
            description,
            coordinates,
            color,
            visible: true,
            properties: additionalProperties // Guardar todas las propiedades adicionales
        })
    })
    features.value = newFeatures
}

const parseCSV = (csvString: string) => {
    const newFeatures: any[] = []
    const lines = csvString.trim().split(/\r?\n/)
    if (lines.length < 2) {
        throw new Error('El archivo CSV está vacío o no contiene datos.')
    }

    const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))

    const findCol = (keys: string[]) => keys.reduce((acc, key) => (acc !== -1 ? acc : header.indexOf(key)), -1)

    const latCol = findCol(['lat', 'latitude', 'latitud'])
    const lngCol = findCol(['lon', 'lng', 'longitude', 'longitud'])

    if (latCol === -1 || lngCol === -1) {
        throw new Error('No se pudieron encontrar las columnas de latitud/longitud.')
    }

    const nameCol = findCol(['name', 'nombre', 'title', 'titulo'])
    const descCol = findCol(['description', 'descripcion'])

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue

        const row = lines[i].split(',')

        if (row.length <= Math.max(latCol, lngCol)) continue

        const lat = parseFloat(row[latCol])
        const lng = parseFloat(row[lngCol])

        if (!isNaN(lat) && !isNaN(lng)) {
            const name = nameCol !== -1 ? (row[nameCol] || `Punto ${i}`) : `Punto ${i}`
            let description = descCol !== -1 ? (row[descCol] || '') : ''

            // Construir propiedades adicionales de las columnas restantes
            const additionalProperties: Record<string, any> = {}

            if (!description) {
                description = header.map((h, idx) => {
                    if (idx !== latCol && idx !== lngCol && idx !== nameCol && row[idx]) {
                        additionalProperties[h] = row[idx]
                        return `<strong>${h}:</strong> ${row[idx]}`
                    }
                    return ''
                }).filter(Boolean).join('<br>')
            }

            newFeatures.push({
                type: 'Point',
                name: name,
                description: description,
                coordinates: [lat, lng],
                color: getRandomColor(i),
                visible: true,
                properties: additionalProperties
            })
        }
    }

    if (newFeatures.length === 0) {
        throw new Error('No se encontraron puntos válidos en el CSV.')
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

// Funciones para editar propiedades
const openEditProperties = (index: number) => {
    editingIndex.value = index
    // Crear una copia profunda del feature para editar
    editingFeature.value = JSON.parse(JSON.stringify(features.value[index]))
    showEditModal.value = true
    showNewPropertyForm.value = false
}

const closeEditModal = () => {
    showEditModal.value = false
    editingFeature.value = null
    editingIndex.value = -1
    showNewPropertyForm.value = false
    newPropertyKey.value = ''
    newPropertyValue.value = ''
}

const saveProperties = () => {
    if (editingIndex.value >= 0 && editingFeature.value) {
        // Actualizar el feature original con los cambios
        features.value[editingIndex.value] = editingFeature.value

        toast.add({
            title: 'Propiedades actualizadas',
            description: 'Los cambios se han guardado exitosamente',
            color: 'success',
            icon: 'i-heroicons-check-circle',
            timeout: 2000
        })

        closeEditModal()
    }
}

const addNewProperty = () => {
    showNewPropertyForm.value = true
    newPropertyKey.value = ''
    newPropertyValue.value = ''
}

const saveNewProperty = () => {
    if (newPropertyKey.value && newPropertyValue.value && editingFeature.value) {
        if (!editingFeature.value.properties) {
            editingFeature.value.properties = {}
        }

        // Verificar si la clave ya existe
        if (editingFeature.value.properties[newPropertyKey.value]) {
            toast.add({
                title: 'Propiedad duplicada',
                description: 'Ya existe una propiedad con ese nombre',
                color: 'warning',
                timeout: 3000
            })
            return
        }

        editingFeature.value.properties[newPropertyKey.value] = newPropertyValue.value

        toast.add({
            title: 'Propiedad agregada',
            color: 'success',
            timeout: 2000
        })

        cancelNewProperty()
    }
}

const cancelNewProperty = () => {
    showNewPropertyForm.value = false
    newPropertyKey.value = ''
    newPropertyValue.value = ''
}

const updatePropertyKey = (oldKey: string, newKey: string) => {
    if (oldKey === newKey || !editingFeature.value?.properties) return

    // Verificar si la nueva clave ya existe
    if (editingFeature.value.properties[newKey]) {
        toast.add({
            title: 'Propiedad duplicada',
            description: 'Ya existe una propiedad con ese nombre',
            color: 'warning',
            timeout: 3000
        })
        return
    }

    const value = editingFeature.value.properties[oldKey]
    delete editingFeature.value.properties[oldKey]
    editingFeature.value.properties[newKey] = value
}

const deleteProperty = (key: string) => {
    if (editingFeature.value?.properties) {
        delete editingFeature.value.properties[key]

        toast.add({
            title: 'Propiedad eliminada',
            color: 'warning',
            timeout: 2000
        })
    }
}

const zoomToFeature = (feature: any) => {
    if (!mapRef.value?.leafletObject) return

    if (feature.type === 'Point') {
        mapCenter.value = feature.coordinates
        mapRef.value.leafletObject.flyTo(feature.coordinates, 15)
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
    if (mapRef.value?.leafletObject) {
        mapRef.value.leafletObject.flyTo([19.4326, -99.1332], 6)
    }

    toast.add({
        title: 'Datos limpiados',
        color: 'neutral',
    })
}

const exportGeoJSON = () => {
    const geojson = {
        type: 'FeatureCollection',
        features: features.value.map(f => {
            let coords: any

            if (f.type === 'Point') {
                coords = [f.coordinates[1], f.coordinates[0]]
            } else if (f.type === 'LineString') {
                coords = f.coordinates.map((c: number[]) => [c[1], c[0]])
            } else if (f.type === 'Polygon') {
                coords = [f.coordinates.map((c: number[]) => [c[1], c[0]])]
            }

            // Combinar todas las propiedades incluyendo name, description, color y propiedades adicionales
            const properties: Record<string, any> = {
                name: f.name,
                description: f.description,
                color: f.color,
                ...f.properties // Incluir todas las propiedades adicionales
            }

            return {
                type: 'Feature',
                properties: properties,
                geometry: {
                    type: f.type,
                    coordinates: coords
                }
            }
        })
    }

    const blob = new Blob([JSON.stringify(geojson, null, 2)], {type: 'application/json'})
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName.value.replace(/\.[^/.]+$/, '') || 'export'}_${Date.now()}.geojson`
    a.click()
    window.URL.revokeObjectURL(url)

    toast.add({
        title: 'GeoJSON exportado',
        description: 'Archivo descargado con todas las propiedades',
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
    min-width: 240px;
    max-width: 320px;
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
    flex-shrink: 0;
}

.popup-title {
    font-weight: 600;
    font-size: 14px;
    color: #1f2937;
    flex: 1;
    word-break: break-word;
}

.popup-description {
    background: #f9fafb;
    border-radius: 6px;
    padding: 8px;
    margin-bottom: 10px;
    font-size: 12px;
    color: #4b5563;
    line-height: 1.4;
    max-height: 120px;
    overflow-y: auto;
}

/* Estilos para propiedades adicionales */
.popup-properties {
    background: #f0f9ff;
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #e0f2fe;
}

.properties-title {
    font-size: 11px;
    font-weight: 700;
    color: #0369a1;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
}

.properties-grid {
    display: grid;
    gap: 6px;
}

.property-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    font-size: 12px;
    padding: 4px 0;
    border-bottom: 1px solid #e0f2fe;
}

.property-row:last-child {
    border-bottom: none;
}

.property-key {
    color: #0369a1;
    font-weight: 600;
    min-width: fit-content;
}

.property-value {
    color: #1e40af;
    font-weight: 500;
    text-align: right;
    word-break: break-word;
}

.popup-description :deep(strong) {
    color: #374151;
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