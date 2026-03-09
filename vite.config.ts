import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      devOptions: {
        enabled: false,
      },
      includeAssets: ['favicon.png', 'robots.txt'],
      manifest: {
        name: 'KidFastAI - คณิตคิดเร็วสำหรับเด็กประถม',
        short_name: 'KidFastAI',
        description: 'เรียนคณิตแบบสนุกๆ สำหรับเด็กประถม ป.1-ป.6',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Only precache static assets - NEVER cache JS/CSS/HTML in precache
        globPatterns: ['**/*.{ico,png,svg,woff,woff2}'],
        // Remove navigateFallback to prevent serving stale index.html
        navigateFallbackDenylist: [/.*/],
        runtimeCaching: [
          {
            // JS and CSS - NEVER cache, always fetch fresh
            urlPattern: /\.(?:js|css)$/,
            handler: 'NetworkOnly',
          },
          {
            // Navigation requests (SPA) - always fetch fresh HTML
            urlPattern: ({request}) => request.mode === 'navigate',
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
