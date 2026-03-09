

# School Version — แผนพัฒนาระบบโรงเรียนแบบครบวงจร

## สรุปภาพรวม

ระบบปัจจุบันมี: ตาราง `schools`, `school_memberships`, `classes`, `class_students` พร้อม RLS, หน้า `SchoolAdminDashboard` และ `AdminSchoolManagement` อยู่แล้ว แต่ยังขาด **หน้าแสดงรายชื่อโรงเรียน บน Landing** และ **หน้า Login เฉพาะ School Admin** ที่สวยงาม

---

## Phase 1: การ์ดโรงเรียนในเครือข่าย (Landing Page)

**สร้าง section "โรงเรียนในเครือข่าย"** บนหน้า Landing ก่อน CTA Section

- ดึงข้อมูลจากตาราง `schools` ที่ `is_active = true`
- แสดงเป็น **grid cards** แต่ละการ์ดมี: โลโก้โรงเรียน, ชื่อ, จังหวัด, จำนวนครู/นักเรียน
- การ์ดมี hover animation, gradient border, และ shadow
- กดการ์ด → นำไปหน้า `/school-login/:schoolId`

**ไฟล์ที่แก้ไข:**
- `src/pages/Landing.tsx` — เพิ่ม section ใหม่
- สร้าง `src/components/SchoolNetworkSection.tsx` — component แสดง grid การ์ดโรงเรียน

---

## Phase 2: หน้า School Admin Login

**สร้างหน้า Login เฉพาะโรงเรียน** ที่ `/school-login/:schoolId`

- ดึงข้อมูลโรงเรียนจาก `schools` table → แสดงโลโก้ + ชื่อโรงเรียน
- Background image จาก `background_url` ของโรงเรียน พร้อม overlay + animation (ใช้แบบเดียวกับ AdminSchoolManagement)
- ฟอร์ม login ด้วย email + password (ใช้ Supabase Auth หรือ custom auth `kidfast_auth`)
- หลัง login สำเร็จ → ตรวจสอบ `school_memberships` ว่า user มี role `school_admin` → redirect ไป `/school-admin`

**ไฟล์ที่สร้างใหม่:**
- `src/pages/SchoolLogin.tsx`
- เพิ่ม Route ใน `src/App.tsx`

---

## Phase 3: ปรับปรุง School Admin Dashboard

ปรับหน้า `SchoolAdminDashboard` ให้สมบูรณ์และสวยงามยิ่งขึ้น:

### 3.1 Dashboard Overview Cards
- **สถิติรวม**: จำนวนครู, นักเรียน, ห้องเรียน, ข้อสอบ ในรูป stat cards พร้อม icon + animation

### 3.2 จัดการครู (Teacher Management)
- เพิ่มครูโดย email → สร้าง `school_memberships` role=teacher
- ดูรายชื่อครู, แก้ไข, ลบ
- มอบหมายครูประจำชั้น

### 3.3 จัดการห้องเรียน (Class Management)
- สร้างห้อง (ชื่อ, ชั้น, ปีการศึกษา, ครูประจำชั้น)
- ดูรายชื่อนักเรียนในห้อง
- เพิ่ม/ลบนักเรียนจากห้อง

### 3.4 จัดการนักเรียน (Student Management)
- เพิ่มนักเรียนโดย email → สร้าง `school_memberships` role=student + `class_students`
- Import นักเรียนเป็น batch (CSV/Excel) — **ฟีเจอร์ใหม่**
- ดูสถิติการเรียนรู้รายบุคคล

**ไฟล์ที่แก้ไข:**
- `src/pages/SchoolAdminDashboard.tsx` — ปรับ UI + เพิ่ม tab/section

---

## Phase 4: ฟีเจอร์เพิ่มเติมที่แนะนำ (Professional Analysis)

### 4.1 School Branding & Settings
- อัปโหลดโลโก้ + background image (มีอยู่แล้วบางส่วนใน AdminSchoolManagement)
- ตั้งค่าสีธีมโรงเรียน
- แก้ไขข้อมูลโรงเรียน (ที่อยู่, เบอร์, เว็บไซต์)

### 4.2 School Analytics Dashboard
- ภาพรวมผลการเรียนทั้งโรงเรียน (มี `SchoolAnalyticsDashboard` อยู่แล้ว)
- เปรียบเทียบระหว่างห้อง
- กราฟแนวโน้มพัฒนาการรายเดือน

### 4.3 Announcement System (ระบบประกาศ)
- School Admin สามารถสร้างประกาศถึงครูและนักเรียน
- ต้องเพิ่มตาราง `school_announcements`

### 4.4 Academic Calendar (ปฏิทินการศึกษา)
- กำหนดวันสอบ, วันหยุด, กิจกรรม
- ต้องเพิ่มตาราง `school_events`

### 4.5 Report Generation (รายงาน PDF)
- สร้างรายงานผลการเรียนรายห้อง/รายบุคคล
- ใช้ jsPDF ที่มีอยู่แล้ว

---

## ลำดับการทำงานที่แนะนำ

| ลำดับ | งาน | ความซับซ้อน |
|-------|------|------------|
| 1 | สร้าง SchoolNetworkSection + เพิ่มใน Landing | ต่ำ |
| 2 | สร้างหน้า SchoolLogin | ปานกลาง |
| 3 | ปรับปรุง SchoolAdminDashboard UI | ปานกลาง |
| 4 | เพิ่ม Import นักเรียน batch | ปานกลาง |
| 5 | ระบบประกาศ + ปฏิทิน (ถ้าต้องการ) | สูง |

---

## หมายเหตุทางเทคนิค

- ข้อมูล `schools` มี `logo_url`, `background_url`, `is_active` พร้อมใช้แล้ว
- `school_memberships` รองรับ role: `school_admin`, `teacher`, `student`
- ใช้ security definer function `admin_update_school` สำหรับอัปเดตข้อมูลโรงเรียน (เนื่องจาก RLS)
- Authentication ใช้ระบบ custom auth (`kidfast_auth` ใน localStorage) ร่วมกับ Supabase Auth

