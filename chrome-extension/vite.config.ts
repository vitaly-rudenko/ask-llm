import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

function getRootHtmlFiles() {
  const rootPath = dirname(fileURLToPath(import.meta.url))
  const files = fs.readdirSync(rootPath, { withFileTypes: true })
  return files.filter(file => file.isFile() && file.name.endsWith('.html')).map(file => file.name)
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: getRootHtmlFiles(),
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
    cors: true,
  },
  plugins: [
    preact(),
    crx({ manifest }),
  ],
})
