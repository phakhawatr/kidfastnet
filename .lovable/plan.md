

## Problem Analysis

Preview แสดงโค้ดเก่าเพราะ **PWA Service Worker** cache ไฟล์ไว้อย่างแรง (aggressive caching) ใน `vite.config.ts`:

- `globPatterns: ['**/*.{js,css,html,...}']` — cache ทุกไฟล์ JS/CSS/HTML ไว้
- `CacheFirst` strategy สำหรับรูปภาพ — ใช้ cache ก่อนเสมอ ไม่เช็คเวอร์ชั่นใหม่
- แม้มี `skipWaiting: true` แต่ Service Worker ยังต้อง activate ก่อนถึงจะใช้โค้ดใหม่ ซึ่งบางครั้งไม่ทันทำงานในตอน preview

## Plan

**File: `vite.config.ts`** — ปรับ PWA config ให้ไม่ cache JS/CSS ใน preview:

1. เปลี่ยน `globPatterns` ให้ cache เฉพาะ assets คงที่ (icons, fonts) ไม่รวม JS/CSS/HTML
2. เพิ่ม runtime caching สำหรับ JS/CSS ด้วย `NetworkFirst` strategy (เช็คเวอร์ชั่นใหม่จาก server ก่อนเสมอ)
3. เปลี่ยน HTML cache `networkTimeoutSeconds` จาก 3 วิ → 1 วิ ให้ fallback เร็วขึ้น
4. เพิ่ม `cleanupOutdatedCaches: true` เพื่อลบ cache เก่าอัตโนมัติ

```typescript
workbox: {
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  globPatterns: ['**/*.{ico,png,svg,woff,woff2}'], // ไม่รวม js,css,html
  navigateFallback: '/index.html',
  navigateFallbackDenylist: [/^\/api/, /^\/supabase/],
  runtimeCaching: [
    {
      urlPattern: /\.(?:js|css)$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'assets-cache',
        networkTimeoutSeconds: 2,
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }
      }
    },
    {
      urlPattern: /^https:\/\/.*\.(?:html)$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'html-cache',
        networkTimeoutSeconds: 1,
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 }
      }
    },
    // keep existing font & image caching rules
  ]
}
```

This ensures the browser always fetches the latest JS/CSS/HTML from the server first, only falling back to cache when offline.

