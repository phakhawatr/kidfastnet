

# ปรับปรุง UI ระบบ School Admin Dashboard

## ปัญหาปัจจุบัน
- สีพื้นหลังกับตัวอักษรไม่ตัดกันชัดเจน (เช่น `text-slate-400` บนพื้น dark ไม่ผ่าน WCAG AA)
- ไม่มีปุ่ม Dark/Light toggle
- ไม่ได้ใช้ Font TH Sarabun
- UI ดูไม่เป็นทางการ ขาดความ professional

## แผนการแก้ไข

### 1. เพิ่ม Font TH Sarabun (`src/index.css`)
- เพิ่ม `@import` Google Fonts สำหรับ `Sarabun`
- กำหนด `font-family: 'Sarabun'` ให้กับ body/root ในหน้า school-admin

### 2. เพิ่มปุ่ม Dark/Light Mode (`SchoolAdminDashboard.tsx`)
- เพิ่ม `ThemeToggle` component ที่ header section ของ dashboard
- ใช้ `next-themes` ที่มีอยู่แล้ว

### 3. ปรับสี WCAG 2.1 AA ทั้งหน้า (`SchoolAdminDashboard.tsx`)
รองรับทั้ง Light และ Dark mode:

**Dark Mode:**
- พื้นหลังหลัก: `from-slate-950 via-slate-900 to-slate-950` 
- Card: `bg-slate-800/90 border-slate-600`
- ข้อความหลัก: `text-white` (contrast ratio 15.4:1)
- ข้อความรอง: `text-slate-200` แทน `text-slate-400` (เพิ่ม contrast)
- Label: `text-slate-100` แทน `text-slate-300`

**Light Mode:**
- พื้นหลังหลัก: `bg-gradient-to-br from-slate-50 via-white to-blue-50`
- Card: `bg-white border-slate-200 shadow-md`
- ข้อความหลัก: `text-slate-900` (contrast ratio 15.4:1)
- ข้อความรอง: `text-slate-600` (contrast ratio 5.7:1, ผ่าน AA)

### 4. ปรับ Layout ให้เป็นทางการ
- เพิ่ม divider ที่ชัดเจนระหว่าง section
- ปรับ stat cards ให้มี border ชัดเจนขึ้น
- ปรับ Tab indicator ให้เห็นเด่นชัด
- ใช้ `font-sarabun` class ครอบทั้งหน้า

### ไฟล์ที่แก้ไข
| ไฟล์ | การเปลี่ยนแปลง |
|------|---------------|
| `src/index.css` | เพิ่ม Google Font Sarabun + utility class `font-sarabun` |
| `src/pages/SchoolAdminDashboard.tsx` | ปรับสีทั้งหมดให้ผ่าน WCAG AA, เพิ่ม ThemeToggle, ใช้ font Sarabun, รองรับ light/dark |
| `tailwind.config.ts` | เพิ่ม `sarabun` ใน fontFamily |

