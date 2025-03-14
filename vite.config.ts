import react from '@vitejs/plugin-react'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import * as path from 'path'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { fileURLToPath } from 'url'
import {defineConfig} from "vite"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  base: '/portfolio-overview/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
