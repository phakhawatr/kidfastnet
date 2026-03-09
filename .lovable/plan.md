

## Problem Analysis

ปัญหาคือ **PWA Service Worker** แคชโค้ดเก่าไว้ และแม้ refresh ก็ยังแสดงเวอร์ชันเก่า สาเหตุหลัก:

1. **Runtime caching สำหรับ JS/CSS** ใช้ `NetworkFirst` แต่มี timeout 2 วินาที — ถ้าเน็ตช้าจะ fallback ไปใช้ cache เก่า
2. **HTML pattern ไม่ตรง** — regex `^https:\/\/.*\.(?:html)$` ไม่ match กับ navigation request ที่ serve index.html ผ่าน SPA
3. **navigateFallback** ใช้ cached index.html เก่า ทำให้โหลด JS bundle เก่าตาม
4. **ไม่มี version-based cache busting** — ไม่มีกลไกบังคับ clear cache เมื่อ deploy ใหม่

## Plan

### 1. แก้ไข `vite.config.ts` — ปรับ PWA caching strategy
- เปลี่ยน JS/CSS runtime caching เป็น **NetworkOnly** (ไม่แคชเลย) หรือลด maxAgeSeconds ลงมาก
- แก้ HTML urlPattern ให้ match navigation requests ถูกต้อง
- เพิ่ม `navigateFallback` ให้ทำงานร่วมกับ NetworkFirst ที่ timeout ต่ำมาก (0.5s)

### 2. แก้ไข `src/main.tsx` — เพิ่ม force cache clear on load
- เพิ่มโค้ดตรวจ version จาก `version.ts` กับ localStorage
- ถ้า version ไม่ตรง → unregister service workers ทั้งหมด + clear caches + reload

### 3. แก้ไข `src/components/PWAUpdatePrompt.tsx` — auto-update แทน prompt
- เปลี่ยนจาก prompt user ให้กด refresh → เป็น auto-refresh ทันทีเมื่อพบ update ใหม่

### 4. อัปเดต `src/config/version.ts` — bump version
- อัปเดต build number เพื่อ trigger cache invalidation

### Summary of Changes
| File | Change |
|------|--------|
| `vite.config.ts` | JS/CSS → NetworkOnly, fix HTML pattern |
| `src/main.tsx` | Add version-based cache buster on startup |
| `src/components/PWAUpdatePrompt.tsx` | Auto-update instead of prompting |
| `src/config/version.ts` | Bump version |

