import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
      // Alias específico para arquivos gerados do Convex (sem @ no início)
      'convex-generated': path.resolve(process.cwd(), './convex/_generated'),
    },
    // Garantir que arquivos .js sejam resolvidos corretamente
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  // Otimizar dependências do Convex
  optimizeDeps: {
    include: ['convex/react'],
  },
  // Permitir que o Vite resolva arquivos fora do src
  server: {
    fs: {
      strict: false,
    },
  },
})

