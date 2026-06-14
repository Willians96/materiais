import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { Toaster } from 'sonner'
import './style.css'
import App from './App.tsx'

const convexUrl = import.meta.env.VITE_CONVEX_URL
if (!convexUrl) {
  throw new Error("VITE_CONVEX_URL não configurado. Execute 'npx convex dev' primeiro.")
}

// Configurar cliente Convex com opções de reconexão
const convex = new ConvexReactClient(convexUrl, {
  // Reconectar automaticamente em caso de desconexão
  unsavedChangesWarning: false,
  // Timeout aumentado para conexões lentas
  webSocketConstructor: typeof WebSocket !== 'undefined' ? WebSocket : undefined,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <App />
      <Toaster position="top-right" />
    </ConvexProvider>
  </StrictMode>,
)

