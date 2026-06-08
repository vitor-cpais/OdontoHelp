import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const packageJsonPath = fileURLToPath(new URL('./package.json', import.meta.url))
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
  version: string
}

const restartOnPackageVersionChange = (): Plugin => ({
  name: 'restart-on-package-version-change',
  configureServer(server) {
    server.watcher.add(packageJsonPath)
    server.watcher.on('change', (file) => {
      if (file === packageJsonPath) {
        server.restart()
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    restartOnPackageVersionChange(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'OdontoHelp',
        short_name: 'OdontoHelp',
        description: 'Gestão clínica odontológica',
        theme_color: '#0F6E56',
        background_color: '#F7F6F2',
        display: 'standalone',
        start_url: '/',
        lang: 'pt-BR',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/auth\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
})
