<template>
    <UCard>
        <template #header>
            <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-document-duplicate" class="w-5 h-5" />
                <h2 class="text-xl font-semibold">Conversión por Lotes</h2>
            </div>
        </template>

        <div class="space-y-6">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
                Convierte múltiples coordenadas simultáneamente. Puedes ingresarlas manualmente o importar desde archivo CSV.
            </p>

            <!-- Sistema de destino -->
            <UFieldGroup label="Convertir a">
                <USelectMenu
                    v-model="targetSystem"
                    :items="systems"
                    option-attribute="label"
                />
            </UFieldGroup>

            <!-- Tabs para entrada manual o CSV -->
            <UTabs :items="tabs" >
                <!-- Tab: Entrada Manual -->
                <template #manual>
                    <div class="space-y-4 pt-4">
                        <div
                            v-for="(coord, index) in coordinates"
                            :key="index"
                            class="flex gap-2 items-end"
                        >
                            <UFieldGroup label="Latitud" class="flex-1">
                                <UInput
                                    v-model="coord.latitude"
                                    type="number"
                                    step="0.000001"
                                    placeholder="19.4326"
                                />
                            </UFieldGroup>
                            <UFieldGroup label="Longitud" class="flex-1">
                                <UInput
                                    v-model="coord.longitude"
                                    type="number"
                                    step="0.000001"
                                    placeholder="-99.1332"
                                />
                            </UFieldGroup>
                            <UButton
                                color="error"
                                variant="soft"
                                icon="i-heroicons-trash"
                                @click="removeCoordinate(index)"
                                :disabled="coordinates.length === 1"
                            />
                        </div>

                        <UButton
                            color="neutral"
                            variant="soft"
                            icon="i-heroicons-plus"
                            @click="addCoordinate"
                        >
                            Agregar coordenada
                        </UButton>
                    </div>
                </template>

                <!-- Tab: Importar CSV -->
                <template #csv>
                    <div class="space-y-4 pt-4">
                        <UAlert
                            color="primary"
                            variant="soft"
                            icon="i-heroicons-information-circle"
                            title="Formato CSV"
                            description="El archivo debe tener dos columnas: latitude,longitude (sin encabezados o con encabezados en la primera fila)"
                        />

                        <UFieldGroup label="Archivo CSV">
                            <input
                                type="file"
                                accept=".csv"
                                @change="handleFileUpload"
                                class="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300"
                            />
                        </UFieldGroup>

                        <UTextarea
                            v-model="csvPreview"
                            :rows="8"
                            readonly
                            placeholder="Vista previa del CSV..."
                        />
                    </div>
                </template>
            </UTabs>

            <!-- Botón Convertir -->
            <UButton
                block
                size="lg"
                color="primary"
                icon="i-heroicons-arrow-path"
                :loading="loading"
                :disabled="!hasValidCoordinates"
                @click="convertBatch"
            >
                Convertir {{ coordinates.length }} coordenadas
            </UButton>

            <!-- Progreso -->
            <div v-if="loading" class="space-y-2">
                <div class="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                    <span>Convirtiendo...</span>
                    <span>{{ progress }}%</span>
                </div>
                <UProgress :value="progress" color="primary" />
            </div>

            <!-- Resultados -->
            <div v-if="results" class="space-y-4">
                <USeparator label="Resultados" />

                <div class="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div>
                        <div class="font-medium text-green-700 dark:text-green-300">
                            ✓ {{ results.successful }} conversiones exitosas
                        </div>
                        <div v-if="results.total - results.successful > 0" class="text-sm text-red-600 dark:text-red-400 mt-1">
                            ⚠ {{ results.total - results.successful }} fallidas
                        </div>
                    </div>
                    <UButton
                        color="success"
                        variant="soft"
                        icon="i-heroicons-arrow-down-tray"
                        @click="downloadResults"
                    >
                        Descargar CSV
                    </UButton>
                </div>

                <!-- Tabla de resultados -->
                <div class="overflow-x-auto max-h-96 border dark:border-neutral-700 rounded-lg">
                    <table class="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                        <thead class="bg-neutral-50 dark:bg-neutral-800 sticky top-0">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">#</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Entrada</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Salida</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Estado</th>
                        </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                        <tr v-for="(result, index) in results.results" :key="index">
                            <td class="px-4 py-3 text-sm">{{ index + 1 }}</td>
                            <td class="px-4 py-3 text-sm font-mono">
                                {{ result.input.latitude }}, {{ result.input.longitude }}
                            </td>
                            <td class="px-4 py-3 text-sm font-mono">
                                <div v-if="!result.error">
                                    <div v-if="result.output.x !== undefined">
                                        X: {{ result.output.x.toFixed(2) }}<br>
                                        Y: {{ result.output.y.toFixed(2) }}
                                    </div>
                                    <div v-if="result.output.zone !== undefined">
                                        {{ result.output.zone }}{{ result.output.letter }}<br>
                                        E: {{ result.output.easting.toFixed(2) }}<br>
                                        N: {{ result.output.northing.toFixed(2) }}
                                    </div>
                                </div>
                                <span v-else class="text-red-600 dark:text-red-400">Error</span>
                            </td>
                            <td class="px-4 py-3">
                                <UBadge
                                    :color="result.error ? 'error' : 'success'"
                                    variant="soft"
                                >
                                    {{ result.error ? 'Error' : 'OK' }}
                                </UBadge>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Error -->
            <UAlert
                v-if="error"
                color="error"
                variant="soft"
                title="Error"
                :description="error"
            />
        </div>
    </UCard>
</template>

<script setup lang="ts">
const { batchConvert } = useCoordinateAPI()
const toast = useToast()


const tabs = [
    { label: 'Entrada Manual',slot: 'manual' },
    { label: 'Importar CSV',  slot: 'csv' }
]

const targetSystem = ref({ value: 'web_mercator', label: 'Web Mercator (EPSG:3857)' })
const systems = [
    { value: 'web_mercator', label: 'Web Mercator (EPSG:3857)' },
    { value: 'utm', label: 'UTM' }
]

const coordinates = ref([
    { latitude: '', longitude: '' }
])

const csvPreview = ref('')
const loading = ref(false)
const progress = ref(0)
const results = ref<any>(null)
const error = ref<string | null>(null)

const hasValidCoordinates = computed(() => {
    return coordinates.value.some(c => c.latitude && c.longitude)
})

const addCoordinate = () => {
    coordinates.value.push({ latitude: '', longitude: '' })
}

const removeCoordinate = (index: number) => {
    coordinates.value.splice(index, 1)
}

const handleFileUpload = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
        const text = e.target?.result as string
        csvPreview.value = text
        parseCSV(text)
    }
    reader.readAsText(file)
}

const parseCSV = (text: string) => {
    const lines = text.trim().split('\n')
    const parsed: Array<{ latitude: string; longitude: string }> = []

    lines.forEach((line, index) => {
        // Saltar primera línea si parece ser encabezado
        if (index === 0 && (line.toLowerCase().includes('lat') || line.toLowerCase().includes('lon'))) {
            return
        }

        const [lat, lon] = line.split(',').map(s => s.trim())
        if (lat && lon) {
            parsed.push({ latitude: lat, longitude: lon })
        }
    })

    coordinates.value = parsed
    toast.add({
        title: 'CSV cargado',
        description: `${parsed.length} coordenadas importadas`,
        color: 'success'
    })
}

const convertBatch = async () => {
    loading.value = true
    error.value = null
    results.value = null
    progress.value = 0

    try {
        const validCoords = coordinates.value
            .filter(c => c.latitude && c.longitude)
            .map(c => ({
                latitude: parseFloat(c.latitude),
                longitude: parseFloat(c.longitude)
            }))

        const response = await batchConvert(
            validCoords,
            targetSystem.value.value as 'web_mercator' | 'utm'
        )

        results.value = response
        progress.value = 100

        toast.add({
            title: 'Conversión completada',
            description: `${response.successful} de ${response.total} coordenadas convertidas`,
            color: 'success'
        })
    } catch (e: any) {
        error.value = e.message || 'Error en la conversión por lotes'
    } finally {
        loading.value = false
    }
}

const downloadResults = () => {
    if (!results.value) return

    let csv = ''

    if (targetSystem.value.value === 'web_mercator') {
        csv = 'input_lat,input_lon,output_x,output_y,status\n'
        results.value.results.forEach((r: any) => {
            if (!r.error) {
                csv += `${r.input.latitude},${r.input.longitude},${r.output.x},${r.output.y},success\n`
            } else {
                csv += `${r.input.latitude},${r.input.longitude},,,error\n`
            }
        })
    } else {
        csv = 'input_lat,input_lon,zone,letter,easting,northing,status\n'
        results.value.results.forEach((r: any) => {
            if (!r.error) {
                csv += `${r.input.latitude},${r.input.longitude},${r.output.zone},${r.output.letter},${r.output.easting},${r.output.northing},success\n`
            } else {
                csv += `${r.input.latitude},${r.input.longitude},,,,,error\n`
            }
        })
    }

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversion_results_${Date.now()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
}
</script>