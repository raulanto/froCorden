<script setup lang="ts">
useHead({
    title: 'CoordinateHub - Gestión de Coordenadas Geográficas',
    meta: [
        {
            name: 'description',
            content: 'Sistema profesional para conversión, cálculo y visualización de coordenadas geográficas en múltiples sistemas de referencia'
        }
    ]
})

const handlePointSelected = (point: any) => {
    console.log('Punto seleccionado:', point)
}

const handleInfoLoaded = (info: any) => {
    console.log('Información cargada:', info)
}

</script>

<template>
    <div class="absolute h-full w-full ">

        <div class="absolute bottom-0 left-0 right-0 top-0
                bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]
                [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]">
        </div>
    </div>
    <section class="pt-12  sm:pt-16 fondo dark:fondodark">
        <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div class="max-w-2xl mx-auto text-center">
                <h1 class="px-6 text-lg  font-inter">Convierte, calcula y visualiza coordenadas en diferentes sistemas
                    de referencia espacial con precisión profesional</h1>
                <p class="mt-5 text-4xl font-extrabold    sm:text-5xl ">
                    Herramientas profesionales de coordenadas geográficas
                </p>

                <div class="mt-8 flex gap-4 justify-center flex-wrap">
                    <UBadge color="primary" variant="solid" size="lg">WGS84</UBadge>
                    <UBadge color="primary" variant="solid" size="lg">Web Mercator</UBadge>
                    <UBadge color="primary" variant="solid" size="lg">UTM</UBadge>
                    <UBadge color="primary" variant="solid" size="lg">Haversine</UBadge>
                </div>
            </div>
        </div>

        <div class="pb-12 mt-20">
            <div class="relative">
                <div class="absolute inset-0 h-2/3 "></div>
                <div class="relative mx-auto">
                    <div class="lg:max-w-6xl lg:mx-auto">
                        <CoordinateMap
                            :center="[19.4326, -99.1332]"
                            :zoom="13"
                            height="600px"
                            @point-selected="handlePointSelected"
                            @info-loaded="handleInfoLoaded"
                        />
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!--    <UContainer>-->
    <!--        <UCard>-->
    <!--            <template #header>-->
    <!--                <div class="flex justify-between items-center">-->
    <!--                    <h3 class="text-lg font-semibold">Mapa Interactivo</h3>-->
    <!--                    <UBadge color="secondary" variant="soft">Herramienta principal</UBadge>-->
    <!--                </div>-->
    <!--            </template>-->
    <!--            <CoordinateMap-->
    <!--                :center="[19.4326, -99.1332]"-->
    <!--                :zoom="13"-->
    <!--                height="600px"-->
    <!--                @point-selected="handlePointSelected"-->
    <!--                @info-loaded="handleInfoLoaded"-->
    <!--            />-->
    <!--        </UCard>-->
    <!--    </UContainer>-->
</template>

<style scoped>
.fondo {
    background: radial-gradient(ellipse 85% 90% at 50% 0%, rgb(119, 29, 216), transparent 70%);

}

.fondodark{
    background: radial-gradient(ellipse 85% 90% at 50% 0%, rgba(203, 169, 253, 0.67), transparent 70%);

}

</style>