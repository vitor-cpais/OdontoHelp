import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

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
  plugins: [react(), restartOnPackageVersionChange()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
})
