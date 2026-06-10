import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Separar vendors del código de la app: react/supabase cambian poco,
        // así el usuario solo re-descarga el chunk de la app en cada deploy.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'supabase'
            if (id.includes('react')) return 'react'
            return 'vendor'
          }
        },
      },
    },
  },
})
