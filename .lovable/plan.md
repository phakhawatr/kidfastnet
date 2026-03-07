

## Plan: แยก Tab "สมาชิก" เป็น "ครู" และ "นักเรียน"

### Problem
ปัจจุบัน Tab "สมาชิก" รวมทุก role ไว้ด้วยกัน ผู้ใช้ต้องการแยกเป็น 2 tabs: "ครู" (ครู + ผู้ดูแลโรงเรียน) และ "นักเรียน"

### Changes — `src/pages/AdminSchoolManagement.tsx`

1. **เปลี่ยน Tab "สมาชิก" เป็น "ครู"** (lines 735-738):
   - เปลี่ยน `value="members"` → `value="teachers"`
   - เปลี่ยนข้อความ "สมาชิก" → "ครู"
   - แสดงจำนวนเฉพาะ role = `teacher` หรือ `school_admin`

2. **เพิ่ม Tab "นักเรียน"** ใหม่ถัดจาก Tab ครู:
   - `value="students"` พร้อม icon `Users`
   - แสดงจำนวนสมาชิกที่มี role = `student`

3. **แยก TabsContent "members" เป็น 2 ส่วน**:
   - `TabsContent value="teachers"` — filter แสดงเฉพาะ `member.role === 'teacher' || 'school_admin'` พร้อมปุ่ม "เพิ่มครู" (default role = teacher)
   - `TabsContent value="students"` — filter แสดงเฉพาะ `member.role === 'student'` พร้อมปุ่ม "เพิ่มนักเรียน" (default role = student)

4. **Dialog เพิ่มสมาชิก** — ใช้ Dialog เดิมร่วมกันทั้ง 2 tabs โดยตั้ง default role ตาม tab ที่กดปุ่ม (teacher หรือ student)

### Computed values ที่เพิ่ม
```typescript
const teacherMembers = members.filter(m => m.role === 'teacher' || m.role === 'school_admin');
const studentMembers = members.filter(m => m.role === 'student');
```

### Tab structure ใหม่
```
[ห้องเรียน (6)] [ครู (1)] [นักเรียน (0)]
```

