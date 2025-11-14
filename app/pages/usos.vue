<script setup lang="ts">

</script>

<template>

    <UContainer>
        <UCard>
            <template #header>
                <h3 class="text-lg font-semibold">Ejemplos de Uso</h3>
            </template>

            <div class="space-y-6">
                <!-- Ejemplo 1 -->
                <div class="border-l-4 border-blue-500 pl-4">
                    <h4 class="font-medium mb-2">1. Convertir coordenadas WGS84 a Web Mercator</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Útil para sistemas de mapas web como Google Maps u OpenStreetMap
                    </p>
                    <UCard class="bg-neutral-50 dark:bg-neutral-800">
                    <pre class="text-xs overflow-x-auto"><code>POST /api/coordinates/convert/web-mercator/
{
  "latitude": 19.4326,
  "longitude": -99.1332
}

Respuesta:
{
  "input": {
    "latitude": 19.4326,
    "longitude": -99.1332
  },
  "output": {
    "x": -11035322.76,
    "y": 2215942.68
  },
  "system": "EPSG:3857"
}</code></pre>
                    </UCard>
                </div>

                <!-- Ejemplo 2 -->
                <div class="border-l-4 border-green-500 pl-4">
                    <h4 class="font-medium mb-2">2. Calcular distancia entre dos puntos</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Usa la fórmula de Haversine para cálculos precisos en la esfera terrestre
                    </p>
                    <UCard class="bg-neutral-50 dark:bg-neutral-800">
                    <pre class="text-xs overflow-x-auto"><code>POST /api/coordinates/distance/
{
  "point1_lat": 19.4326,
  "point1_lon": -99.1332,
  "point2_lat": 19.4970,
  "point2_lon": -99.1276,
  "unit": "km"
}

Respuesta:
{
  "point1": { "latitude": 19.4326, "longitude": -99.1332 },
  "point2": { "latitude": 19.4970, "longitude": -99.1276 },
  "distance": 7.21,
  "unit": "km"
}</code></pre>
                    </UCard>
                </div>

                <!-- Ejemplo 3 -->
                <div class="border-l-4 border-purple-500 pl-4">
                    <h4 class="font-medium mb-2">3. Generar bounding box</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Crea un área rectangular alrededor de un punto con un radio específico
                    </p>
                    <UCard class="bg-neutral-50 dark:bg-neutral-800">
                    <pre class="text-xs overflow-x-auto"><code>POST /api/coordinates/bounding-box/
{
  "center_lat": 19.4326,
  "center_lon": -99.1332,
  "radius_km": 5.0
}

Respuesta:
{
  "center": { "latitude": 19.4326, "longitude": -99.1332 },
  "radius_km": 5.0,
  "bounding_box": {
    "north": 19.47752,
    "south": 19.38768,
    "east": -99.07885,
    "west": -99.18755
  }
}</code></pre>
                    </UCard>
                </div>

                <!-- Ejemplo 4 -->
                <div class="border-l-4 border-orange-500 pl-4">
                    <h4 class="font-medium mb-2">4. Conversión por lotes</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Convierte múltiples coordenadas en una sola petición
                    </p>
                    <UCard class="bg-neutral-50 dark:bg-neutral-800">
                    <pre class="text-xs overflow-x-auto"><code>POST /api/coordinates/batch-convert/
{
  "coordinates": [
    {"latitude": 19.4326, "longitude": -99.1332},
    {"latitude": 20.6597, "longitude": -103.3496}
  ],
  "to_system": "utm"
}

Respuesta:
{
  "total": 2,
  "successful": 2,
  "results": [...]
}</code></pre>
                    </UCard>
                </div>
            </div>
        </UCard>

        <!-- Casos de uso -->
        <UCard>
            <template #header>
                <h3 class="text-lg font-semibold">Casos de Uso Comunes</h3>
            </template>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <UIcon name="i-heroicons-map" class="w-6 h-6 text-blue-600 mb-2"/>
                    <h4 class="font-medium mb-1">Aplicaciones de mapas</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        Integración con Leaflet, Google Maps, Mapbox
                    </p>
                </div>

                <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <UIcon name="i-heroicons-truck" class="w-6 h-6 text-green-600 mb-2"/>
                    <h4 class="font-medium mb-1">Logística y transporte</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        Cálculo de rutas y distancias entre ubicaciones
                    </p>
                </div>

                <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <UIcon name="i-heroicons-building-office" class="w-6 h-6 text-purple-600 mb-2"/>
                    <h4 class="font-medium mb-1">Bienes raíces</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        Búsqueda de propiedades por área geográfica
                    </p>
                </div>

                <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-orange-600 mb-2"/>
                    <h4 class="font-medium mb-1">Análisis espacial</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        GIS y procesamiento de datos geográficos
                    </p>
                </div>
            </div>
        </UCard>
    </UContainer>

</template>

<style scoped>

</style>