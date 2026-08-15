# CoordinateHub

**CoordinateHub** es un sistema profesional para la gestión, conversión, cálculo y visualización de coordenadas geográficas. Construido sobre las últimas tecnologías web, ofrece una interfaz moderna y rápida para trabajar con diferentes sistemas de referencia espacial.

## Objetivo del Proyecto

El objetivo principal de CoordinateHub es proveer un conjunto de herramientas precisas y fáciles de usar para desarrolladores, geógrafos y profesionales que necesiten manipular datos espaciales. Facilita la conversión entre distintos formatos, el cálculo de distancias y áreas, y la visualización directa sobre mapas interactivos, todo desde una única plataforma centralizada.

## Características y Funciones Principales

El sistema incluye las siguientes herramientas:

- **Mapa Interactivo:** Visualiza coordenadas directamente en el mapa.
- **Convertidor de Coordenadas:** Convierte entre diferentes sistemas de referencia (ej. WGS84, Web Mercator, UTM).
- **Calculadora de Distancias:** Calcula distancias precisas entre puntos utilizando métodos como Haversine.
- **Generador de Bounding Box:** Crea cajas delimitadoras a partir de conjuntos de coordenadas.
- **Conversión por Lotes:** Procesa múltiples coordenadas simultáneamente (soporte para archivos).
- **Calculadora de Área de Polígonos:** Determina el área de un polígono trazado por coordenadas.

## Tecnologías Utilizadas

- **[Nuxt](https://nuxt.com/) / Vue 3:** Framework para la construcción de la aplicación.
- **[@nuxt/ui](https://ui.nuxt.com/):** Componentes de interfaz de usuario modernos y accesibles.
- **[Leaflet](https://leafletjs.com/):** Biblioteca para mapas interactivos.
- **JSZip:** Para el manejo de archivos comprimidos en conversiones por lotes.

---

## 🛠️ Cómo montarlo para pruebas (Setup & Development)

Sigue estos pasos para ejecutar el proyecto en tu entorno local.

### 1. Requisitos Previos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).

### 2. Instalación de Dependencias

Clona el repositorio y ejecuta el comando de instalación en la raíz del proyecto dependiendo de tu gestor de paquetes favorito:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### 3. Variables de Entorno

Si el proyecto requiere conectarse a una API externa, crea un archivo `.env` en la raíz basándote en la configuración de `nuxt.config.ts`:

```env
NUXT_PUBLIC_API_BASE=tu_api_key_o_url_aqui
```
*(Revisar `.env` si existe para más variables necesarias).*

### 4. Servidor de Desarrollo

Para iniciar el servidor local con Hot Module Replacement (HMR) y probar la aplicación:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

La aplicación estará disponible en `http://localhost:3000`.

### 5. Compilación para Producción (Opcional)

Si deseas probar cómo se comportaría la versión final optimizada:

```bash
# Compilar la aplicación
npm run build

# Previsualizar localmente la versión de producción
npm run preview
```
