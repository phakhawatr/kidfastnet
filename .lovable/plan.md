
# แก้ไข Error "Cannot read properties of undefined (reading 'skill_name')" ในหน้า Profile

## ปัญหา

มี 2 ปัญหาที่เกิดขึ้นพร้อมกัน:

1. **ฟังก์ชัน `generateTodayMission`** (บรรทัด 735) พยายามอ่าน `data.mission.skill_name` แต่ edge function `generate-daily-mission` คืนค่า `data.missions` (array) ไม่ใช่ `data.mission` (object เดี่ยว) ทำให้เกิด TypeError
2. **Auto-generate loop ไม่หยุด** - เมื่อ error เกิดขึ้น todayMissions ยังคง < 3 ทำให้ useEffect ใน Profile.tsx เรียก generateTodayMission ซ้ำไปเรื่อยๆ ทุกๆ 2 วินาที

## แนวทางแก้ไข

### 1. แก้ไข `src/hooks/useTrainingCalendar.ts`

- บรรทัด 735: เปลี่ยนจาก `data.mission.skill_name` เป็น `data.missions?.[0]?.skill_name` หรือใช้ optional chaining `data.mission?.skill_name` เพื่อรองรับทั้งสองกรณี
- เพิ่ม fallback text กรณีไม่มีข้อมูล

### 2. แก้ไข `src/pages/Profile.tsx`

- เพิ่ม retry limit (สูงสุด 2 ครั้ง) เพื่อป้องกัน infinite loop
- เพิ่ม state `autoGenAttempted` เพื่อ track ว่าเคยลองแล้วหรือยัง ถ้าลองแล้ว error ให้หยุด ไม่ลองซ้ำ

## รายละเอียดทางเทคนิค

| ไฟล์ | การเปลี่ยนแปลง |
|------|----------------|
| `src/hooks/useTrainingCalendar.ts` | ใช้ optional chaining `data.mission?.skill_name` และ fallback ไป `data.missions?.[0]?.skill_name` |
| `src/pages/Profile.tsx` | เพิ่ม `useRef` สำหรับ retry count, จำกัดการ auto-generate ไม่เกิน 2 ครั้ง, reset เมื่อ missions สำเร็จ |
