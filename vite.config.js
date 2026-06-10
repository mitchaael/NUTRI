import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // NOTA: no usar manualChunks aquí — separar react/supabase en chunks
  // creó una dependencia circular entre chunks que crasheaba la app al
  // iniciar ("Cannot access 'X' before initialization"). Bundle único.
})
