

## Plan: ปรับ UI หน้า School Management ให้สวยงามและใช้ font THSarabun

### Changes

**1. `index.html`** — เพิ่ม Google Font "THSarabunNew" (THSarabun บน Google Fonts ชื่อ "Sarabun")
- เพิ่ม link Google Fonts สำหรับ Sarabun weight 400,700

**2. `tailwind.config.ts`** — เพิ่ม font family "sarabun" ใน theme
```typescript
sarabun: ['Sarabun', 'THSarabunNew', 'sans-serif']
```

**3. `src/pages/AdminSchoolManagement.tsx`** — ปรับ UI ให้สวยงาม:

- เปลี่ยน root container ใช้ `font-sarabun` และ gradient สีสดใส (purple/blue/indigo)
- **Header**: เพิ่ม gradient card สำหรับชื่อโรงเรียน พร้อม icon สีสันสดใส
- **School Info Card**: เพิ่ม border-left สี gradient, shadow ใหญ่ขึ้น
- **Tabs**: ปรับ TabsList ให้มี gradient background, TabsTrigger ใช้สีต่างกันตาม tab:
  - ห้องเรียน → สีเขียว
  - ครู → สีม่วง  
  - นักเรียน → สีฟ้า
- **Classroom cards**: เพิ่ม gradient border-top สี, hover effect ใหญ่ขึ้น, shadow
- **Member rows**: เพิ่ม gradient avatar background, border-left สีตาม role
- **Empty states**: เพิ่ม icon สีสัน, ข้อความเชิญชวน
- ปรับ font size ให้ใหญ่ขึ้นเล็กน้อย (THSarabun อ่านง่ายที่ขนาดใหญ่กว่า)
- เพิ่ม `text-lg` / `text-xl` ให้กับข้อความหลัก

