import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    // Not 3000 (Martin) or 4500 (main frontend)
    port: 4600,
    open: true,
  },
  build: {
    // Same folder CRA used, so whatever serves Engage needs no change
    outDir: 'build',
  },
})
