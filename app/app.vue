<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [{
    label: 'Inicio',
    to: '/',

}, {
    label: 'Herramientas',
    to: '/herramientas',

}, {
    label: 'Documentación API',
    icon:'i-heroicons-book-open',
    to: 'https://api-coorden.vercel.app/#/',
    target: '_blank'
},{
    label: 'Ejemplos y Documentación',
    to: '/usos',
}])
</script>

<template>
    <UApp>
        <UHeader>
            <template #title>
                <div class="flex items-center gap-3">
                    <UIcon name="i-heroicons-globe-alt" class="w-8 h-8 text-primary" />
                    <div>
                        <h1 class="text-xl font-bold">CoordinateHub</h1>
                        <p class="text-xs text-neutral-500">Sistema de gestión de coordenadas</p>
                    </div>
                </div>
            </template>

            <UNavigationMenu :items="items" />

            <template #right>
                <UColorModeButton />

                <UButton
                    color="neutral"
                    variant="ghost"
                    to="https://github.com/raulanto"
                    target="_blank"
                    icon="i-simple-icons-github"
                    aria-label="GitHub"
                />
            </template>

            <template #body>
                <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
            </template>
        </UHeader>

        <UMain>
            <NuxtLayout>
                <NuxtPage />
            </NuxtLayout>
        </UMain>

        <UFooter>
            <template #left>
                <p class="text-muted text-sm">Copyright © {{ new Date().getFullYear() }}</p>
            </template>

            <UNavigationMenu :items="items" variant="link" />

            <template #right>
                <UButton
                    icon="i-simple-icons-discord"
                    color="neutral"
                    variant="ghost"
                    to="https://go.nuxt.com/discord"
                    target="_blank"
                    aria-label="Discord"
                />
                <UButton
                    icon="i-simple-icons-x"
                    color="neutral"
                    variant="ghost"
                    to="https://go.nuxt.com/x"
                    target="_blank"
                    aria-label="X"
                />
                <UButton
                    icon="i-simple-icons-github"
                    color="neutral"
                    variant="ghost"
                    to="https://github.com/nuxt/nuxt"
                    target="_blank"
                    aria-label="GitHub"
                />
            </template>
        </UFooter>
    </UApp>
</template>
