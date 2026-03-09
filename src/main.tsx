import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import App from './App.tsx'
import './index.css'
import { getVersionString } from './config/version.ts'

// === Force cache clear on version mismatch ===
const currentVersion = getVersionString();
const cachedVersion = localStorage.getItem('app_version');

if (cachedVersion && cachedVersion !== currentVersion) {
  console.log(`[Version] Mismatch: cached="${cachedVersion}" current="${currentVersion}". Clearing caches...`);
  
  // Unregister all service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(reg => reg.unregister());
    });
  }
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  // Update stored version and force reload
  localStorage.setItem('app_version', currentVersion);
  window.location.reload();
} else {
  // Store current version
  localStorage.setItem('app_version', currentVersion);
  
  console.log(`[Version] ${currentVersion}`);
  
  createRoot(document.getElementById("root")!).render(
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <App />
    </ThemeProvider>
  );
}
