

# เพิ่ม Radar Chart ผลการสอบ และประวัติการสอบพร้อมภาพ Radar Chart ขนาดเล็ก

## สิ่งที่จะทำ

### 1. เพิ่ม Radar Chart ในหน้าผลการสอบ (Results Screen)
- หลังส่งคำตอบเสร็จ สร้าง **Radar Chart** แสดงคะแนนแยกตามทักษะ (ตามหัวข้อการสอบของแต่ละระดับชั้น/เทอม)
- ใช้เกณฑ์สี 3 ระดับ:
  - **สีเขียว** ≥ 85%
  - **สีเหลือง** 50% - 84.9%
  - **สีแดง** < 50%
- Radar Chart จะแสดงชื่อทักษะภาษาไทยรอบๆ กราฟ พร้อมคะแนนเฉลี่ยรวม
- ใช้ Recharts `RadarChart` component ที่มีอยู่ใน dependencies แล้ว

### 2. เพิ่มประวัติผลการทดสอบพร้อม Radar Chart ขนาดเล็ก
- ปรับ `QuizHistory.tsx` เพิ่มส่วนแสดง **การ์ดประวัติ** ที่มี:
  - ชื่อแบบทดสอบ (เช่น "ป.1 เทอม 1")
  - วัน-เวลาที่ทำ
  - **Radar Chart ขนาดเล็ก** (thumbnail ~120x120px) แสดงภาพรวมผลสอบ
  - คะแนน % และจำนวนข้อถูก/ผิด
- คลิกที่การ์ดแต่ละอัน → เปิด **Dialog** แสดงรายละเอียดเต็ม พร้อม Radar Chart ขนาดใหญ่ + ข้อมูลแยกตามทักษะ
- ข้อมูลมาจาก `assessment_data` ที่เก็บใน `level_assessments` table อยู่แล้ว (มี questions + answers + skill)

## รายละเอียดทางเทคนิค

| ไฟล์ | การเปลี่ยนแปลง |
|------|----------------|
| `src/components/CompetencyRadarChart.tsx` | **ไฟล์ใหม่** — Reusable Radar Chart component รับ skillBreakdown data แสดงกราฟสี 3 ระดับ รองรับ size prop (sm/md/lg) |
| `src/pages/Quiz.tsx` | เพิ่ม `CompetencyRadarChart` ในหน้า results (บรรทัด ~966) แสดงก่อน skill breakdown bars |
| `src/components/QuizHistory.tsx` | ปรับเป็นการ์ดพร้อม mini radar chart, เพิ่ม Dialog สำหรับดูรายละเอียด, คำนวณ skill breakdown จาก `assessment_data` |

### โครงสร้าง CompetencyRadarChart

```text
Props:
  - skillData: { skill: string, percentage: number }[]
  - size: 'sm' | 'md' | 'lg'  (120px / 300px / 400px)
  - showLabels: boolean
  - averageScore: number

Logic:
  - แต่ละ skill วาดเป็นจุดบน radar
  - Fill color ตาม averageScore:
    ≥85% → green fill
    50-84.9% → yellow fill
    <50% → red fill
  - แต่ละแกน data point ใช้สีตาม % ของทักษะนั้นๆ
```

