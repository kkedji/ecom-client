import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    // Optimisations pour déploiement
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Chunking pour performance
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        }
      }
    },
    // Optimisation des assets
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 600
  },
  // Configuration PWA
  publicDir: 'public',
  // Optimisation pour Netlify
  base: '/'
})
