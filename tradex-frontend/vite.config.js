import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charting': ['lightweight-charts'],
          'vendor-ui': ['react-icons', 'lucide-react', 'react-toastify', 'react-tooltip', 'clsx'],
          'vendor-data': ['@supabase/supabase-js', 'axios', 'zustand', 'date-fns'],
        },
      },
    },
  },
})
