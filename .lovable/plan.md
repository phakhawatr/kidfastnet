

# เพิ่มการเปรียบเทียบผลสอบ 2 ครั้งล่าสุด พร้อม Radar Chart ซ้อนทับ

## สิ่งที่จะทำ
เพิ่มส่วนเปรียบเทียบในหน้าผลสอบ (results screen) ที่แสดง:
1. **Radar Chart ซ้อนทับ 2 ครั้ง** - ครั้งก่อนหน้า (สีเทา) vs ครั้งล่าสุด (สีหลัก)
2. **บทวิเคราะห์การพัฒนา** - แสดงทักษะที่ดีขึ้น/แย่ลง พร้อม % เปลี่ยนแปลง
3. **แนะนำการฝึกทักษะ** - จากผลวิเคราะห์ แนะนำทักษะที่ควรฝึกเพิ่ม

## รายละเอียดทางเทคนิค

| ไฟล์ | การเปลี่ยนแปลง |
|------|----------------|
| `src/components/ComparisonRadarChart.tsx` | **สร้างใหม่** - Recharts RadarChart ที่แสดง 2 Radar ซ้อนกัน (ครั้งก่อน = สีเทาจาง, ครั้งล่าสุด = สีตามคะแนน) พร้อม Legend |
| `src/pages/Quiz.tsx` | เพิ่ม logic ดึงผลสอบครั้งก่อนหน้าจาก `level_assessments` (เฉพาะ grade+semester เดียวกัน) แล้วคำนวณ skill breakdown ของครั้งก่อน → แสดงส่วนเปรียบเทียบใต้ Radar Chart ปัจจุบัน |

### ComparisonRadarChart Component
- รับ `currentData` และ `previousData` (array ของ `{skill, percentage}`)
- ใช้ Recharts RadarChart เดียว แต่มี 2 `<Radar>`: ครั้งก่อน (fill สีเทา, opacity ต่ำ) และครั้งล่าสุด (fill สีตามคะแนนเฉลี่ย)
- แสดง Legend "ครั้งก่อน" vs "ครั้งล่าสุด"

### บทวิเคราะห์ใน Quiz.tsx
- Fetch ครั้งก่อนหน้าด้วย: `level_assessments` WHERE `user_id` = current, `grade` = selected, `semester` = selected, ORDER BY `created_at` DESC LIMIT 1 OFFSET 1
- คำนวณ `computeSkillBreakdown` จาก `assessment_data` ของครั้งก่อน (ใช้ logic เดียวกับ QuizHistory)
- แสดงตาราง: ทักษะ | ครั้งก่อน% | ครั้งนี้% | เปลี่ยนแปลง (▲/▼)
- สรุปภาพรวม: จำนวนทักษะที่ดีขึ้น/แย่ลง/คงที่
- แนะนำฝึก: ทักษะที่ยังต่ำกว่า 85% หรือลดลง พร้อมปุ่ม "ฝึกเลย"

