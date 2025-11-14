// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/leaflet'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'CoordinateHub',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Sistema profesional de gestión de coordenadas geográficas'
        }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Configuración de build
  build: {
    transpile: ['leaflet']
  },

  runtimeConfig: {
    public: {
      apiKey:  process.env.NUXT_PUBLIC_API_BASE,
    }
  },

})