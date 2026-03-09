

# ปรับ Color Scheme ของ School Admin Dashboard ตามภาพแนบ

## แนวทางสีจากภาพอ้างอิง

ภาพแนบใช้โทนสี **warm brown/orange** ทั้ง Light และ Dark mode:

**Light Mode:**
- พื้นหลัง: สีขาวครีม (`#FFF8F0` / `orange-50`)
- Card: สีครีมอ่อน (`#FFF0E0` / `orange-100`) พร้อม border สีน้ำตาลอ่อน
- ข้อความหลัก: สีดำ/น้ำตาลเข้ม
- ข้อความรอง: สีน้ำตาลกลาง
- ปุ่มหลัก: พื้นสีน้ำตาลเข้ม/ดำ + ข้อความขาว (rounded-full)
- ปุ่มรอง/ลิงก์: สีส้มน้ำตาล (accent)
- Icon highlight: สีส้ม

**Dark Mode:**
- พื้นหลัง: สีดำเข้ม (`#1A1A1A` / `neutral-950`)
- Card: สีเทาเข้ม (`#2A2A2A` / `neutral-800`) พร้อม border สีเทา
- ข้อความหลัก: สีขาว
- ข้อความรอง: สีเทาอ่อน
- ปุ่มหลัก: พื้นสีน้ำตาลเข้ม + ข้อความขาว
- ปุ่มรอง/ลิงก์: สีส้ม
- Icon highlight: สีส้ม

## การเปลี่ยนแปลงใน `SchoolAdminDashboard.tsx`

### Style Variables ที่ต้องเปลี่ยน (บรรทัด 312-325)

```typescript
const pageBackground = 'bg-orange-50/50 dark:bg-neutral-950';
const cardStyle = 'bg-orange-50 border-orange-200/60 shadow-sm dark:bg-neutral-800 dark:border-neutral-700';
const cardInnerStyle = 'bg-white border-orange-200/50 dark:bg-neutral-900 dark:border-neutral-700';
const textPrimary = 'text-neutral-900 dark:text-white';
const textSecondary = 'text-amber-800 dark:text-neutral-300';
const textMuted = 'text-amber-700/60 dark:text-neutral-400';
const borderStyle = 'border-orange-200/60 dark:border-neutral-700';
const inputStyle = 'bg-white border-orange-300 text-neutral-900 dark:bg-neutral-900 dark:border-neutral-600 dark:text-white';
const labelStyle = 'text-amber-900 dark:text-neutral-200';
const dialogStyle = 'bg-white border-orange-200 dark:bg-neutral-800 dark:border-neutral-700';
const selectContentStyle = 'bg-white border-orange-200 dark:bg-neutral-800 dark:border-neutral-700';
const selectItemStyle = 'text-neutral-900 dark:text-white hover:bg-orange-100 dark:hover:bg-neutral-700';
const cancelBtnStyle = 'text-amber-700 hover:text-amber-900 dark:text-neutral-400 dark:hover:text-white';
```

### ปุ่มหลัก (Primary Buttons)
- เปลี่ยนจาก `bg-primary` → `bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 text-white rounded-full`
- ปุ่ม "ดูสถิติ": `bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white rounded-full`
- ปุ่ม "เพิ่มครู": `bg-amber-800 hover:bg-amber-900 text-white rounded-full`
- ปุ่ม "เพิ่มนักเรียน": `bg-amber-800 hover:bg-amber-900 text-white rounded-full`
- ปุ่มลิงก์/รอง: `text-orange-600 dark:text-orange-400`

### Stat Cards Icon Backgrounds
- เปลี่ยนจาก purple/blue/green/orange → ใช้โทนส้ม/น้ำตาลแทน:
  - `bg-orange-100 dark:bg-orange-500/20` + `text-orange-700 dark:text-orange-300`

### Tab Indicators
- Active tab: `bg-amber-800 text-white` (แทน emerald/purple/blue)
- Tab list background: `bg-orange-100/60 dark:bg-neutral-800`

### Role Badge Colors
- เปลี่ยนจาก purple/blue/green → warm tones:
  - school_admin: `bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700`
  - teacher: `bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700`
  - student: `bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700`

### Member Avatar Backgrounds
- ครู: `bg-orange-100 dark:bg-orange-500/20`
- นักเรียน: `bg-amber-100 dark:bg-amber-500/20`

## ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|------|---------------|
| `src/pages/SchoolAdminDashboard.tsx` | เปลี่ยน color scheme ทั้งหมดจาก slate/purple/blue → warm brown/orange ตาม reference image |

