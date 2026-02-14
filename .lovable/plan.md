

# แผนปรับปรุง: ทำภารกิจได้ทุกวัน (ไม่มีวันหยุด)

## สรุปการเปลี่ยนแปลง

ลบระบบ "วันหยุด" (เสาร์-อาทิตย์) ออกทั้งหมด ให้นักเรียนทำภารกิจได้ทุกวัน 7 วันต่อสัปดาห์

## ไฟล์ที่ต้องแก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|------|----------------|
| `src/pages/TrainingCalendar.tsx` | ลบการตรวจ isWeekend ออกจาก getDayStatus(), ลบ Legend "วันหยุด", แก้การนับ workDays ให้รวมทุกวัน |
| `src/pages/TodayFocusMode.tsx` | ลบการตรวจ isWeekend ทั้งหมด, ลบ Weekend view, ให้สร้างภารกิจได้ทุกวัน |
| `src/pages/Profile.tsx` | ลบการ skip วันเสาร์-อาทิตย์ในการ auto-generate |

---

## รายละเอียดทางเทคนิค

### 1. TrainingCalendar.tsx

- **getDayStatus()** (บรรทัด 52-56): ลบ `const isWeekend = ...` และ `if (isWeekend) return 'rest'` ออก ให้ทุกวันถูกจัดสถานะปกติ (today/future/skipped/perfect/good/pass/pending)
- **workDays calculation** (บรรทัด 156-159): เปลี่ยนจากนับเฉพาะวันจันทร์-ศุกร์ เป็นนับทุกวันที่ผ่านมาแล้ว
- **Legend** (บรรทัด 402-405): ลบรายการ "วันหยุด" ออกจากคำอธิบายสัญลักษณ์

### 2. TodayFocusMode.tsx

- ลบตัวแปร `isWeekend` (บรรทัด 77-78)
- ลบเงื่อนไข `if (isWeekend) return` ใน auto-generate (บรรทัด 150-151)
- ลบเงื่อนไข `!isWeekend` ใน retry logic (บรรทัด 189)
- ลบ dependencies `isWeekend` จาก useEffect arrays
- ลบ Weekend view UI ทั้งบล็อก (บรรทัด 601-640 โดยประมาณ)

### 3. Profile.tsx

- ลบเงื่อนไข weekend skip (บรรทัด 152-154): `if (dayOfWeek === 0 || dayOfWeek === 6) return`

### ผลลัพธ์
- ปฏิทินจะแสดงทุกวันเป็นวันทำภารกิจ ไม่มีวันสีฟ้า "วันหยุด" อีกต่อไป
- ระบบสร้างภารกิจได้ทุกวันรวมเสาร์-อาทิตย์
- การนับ "ภารกิจเดือนนี้" จะรวมทุกวันแทนเฉพาะวันจันทร์-ศุกร์

