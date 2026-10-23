import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Clean up any stale or corrupted legacy service worker caches
if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then((names) => {
    names.forEach((name) => {
      if (name.includes('hasan-life-guide') || name.includes('hasan-pwa-v1') || name.includes('hasan-pwa-v2')) {
        caches.delete(name);
      }
    });
  }).catch(() => {});
}



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


