import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { OfflineStorageService } from './services/offlineStorage';

// Prepopulate offline cache for instant PWA availability
OfflineStorageService.initializeOfflineCache();

// Register Service Worker for offline resilience
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[RED ALERT AI] ServiceWorker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('[RED ALERT AI] ServiceWorker registration failed:', error);
      });
  });
}

// [RENDER START]
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
// [RENDER END]

