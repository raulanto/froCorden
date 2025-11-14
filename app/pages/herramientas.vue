<script setup lang="ts">

import BoundingBoxTool from "~/components/coordinate/BoundingBoxTool.vue";
import BatchConverter from "~/components/coordinate/BatchConverter.vue";
import DistanceCalculator from "~/components/coordinate/DistanceCalculator.vue";


const mainTabs = [
    {label: 'Mapa Interactivo', icon: 'i-heroicons-map',  slot: 'map'},
    {label: 'Convertidor de Coordenadas', icon: 'i-heroicons-arrow-path', slot: 'examples'},
    {label: 'Calculadora de Distancias', icon: 'i-heroicons-map-pin', slot: 'examples2'},
    {label: 'Generador de Bounding Box', icon: 'i-heroicons-square-3-stack-3d',  slot: 'examples3'},
    {label: 'Conversión por Lotes', icon: 'i-heroicons-document-duplicate',  slot: 'examples4'},
]
const handlePointSelected = (point: any) => {
    console.log('Punto seleccionado:', point)
}

const handleInfoLoaded = (info: any) => {
    console.log('Información cargada:', info)
}

</script>

<template>
    <UContainer class="">
        <UTabs :items="mainTabs" class="mb-8 mt-4">
            <!-- Tab: Mapa Interactivo -->
            <template #map>
                <div class="mt-6">
                    <UCard>
                        <template #header>
                            <div class="flex justify-between items-center">
                                <h3 class="text-lg font-semibold">Mapa Interactivo</h3>
                                <UBadge color="secondary" variant="soft">Herramienta principal</UBadge>
                            </div>
                        </template>
                        <CoordinateMap
                            :center="[19.4326, -99.1332]"
                            :zoom="13"
                            height="600px"
                            @point-selected="handlePointSelected"
                            @info-loaded="handleInfoLoaded"
                        />
                    </UCard>
                </div>
            </template>


            <!-- Tab: Ejemplos -->
            <template #examples>
                <div class="mt-6 space-y-6">
                    <CoordinateConverter/>
                </div>
            </template>

            <template #examples2>
                <div class="mt-6 space-y-6">
                    <DistanceCalculator/>
                </div>
            </template>

            <template #examples3>
                <div class="mt-6 space-y-6">
                    <BoundingBoxTool/>
                </div>
            </template>

            <template #examples4>
                <div class="mt-6 space-y-6">
                    <BatchConverter/>
                </div>
            </template>
        </UTabs>
    </UContainer>

</template>

<style scoped>
.fondo {
    background: radial-gradient(ellipse 85% 90% at 50% 0%, rgba(119, 29, 216, 0.63), transparent 70%);
    z-index: 0;
}
</style>