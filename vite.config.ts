import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Local Vite uses the root URL; the production build targets the GitHub Pages repo path.
  base: command === 'serve' ? '/' : '/SIH-15/',
}))
