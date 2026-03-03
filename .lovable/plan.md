
# เพิ่มปุ่ม "ฝึกใหม่" สำหรับฝึกทักษะเฉพาะด้าน

## สิ่งที่จะทำ
เพิ่มปุ่ม "ฝึกใหม่" ในแต่ละแถวทักษะของหน้าผลสอบ เมื่อกดจะเข้าสู่โหมดฝึกทำโจทย์ 10 ข้อเฉพาะทักษะนั้น ทำทีละข้อจนครบ แล้วแสดงคะแนน

## รายละเอียดทางเทคนิค

| ไฟล์ | การเปลี่ยนแปลง |
|------|----------------|
| `src/utils/assessmentUtils.ts` | Export ฟังก์ชัน `generateSkillPracticeQuestions(skill, grade, semester, count)` ที่สร้างโจทย์ 10 ข้อเฉพาะทักษะ โดยใช้ switch-case เดียวกับ `generateSemesterQuestionsWithAI` |
| `src/pages/Quiz.tsx` | เพิ่ม state สำหรับ "practice mode" (`practiceSkill`, `practiceQuestions`, `practiceIndex`, `practiceAnswers`, `practiceSubmitted`) พร้อม UI แสดงโจทย์ทีละข้อ + ปุ่ม "ฝึกใหม่" ในแต่ละแถวทักษะ (ส่วน Skill Breakdown ~line 1192-1229) |

### Flow
1. ผู้ใช้กดปุ่ม "ฝึกใหม่" ที่แถวทักษะ → เรียก `generateSkillPracticeQuestions` สร้างโจทย์ 10 ข้อ
2. แสดง screen ฝึก: ชื่อทักษะ + progress + โจทย์ทีละข้อ + ตัวเลือก 4 ข้อ
3. ตอบแล้วกด "ข้อถัดไป" จนครบ 10 ข้อ → กด "ดูผลคะแนน"
4. แสดงคะแนน (เช่น 8/10 = 80%) พร้อมปุ่ม "กลับดูผลสอบ" หรือ "ฝึกอีกครั้ง"
