
# เพิ่มปุ่ม "กระดาษทด" (Scratch Pad) ในแต่ละข้อ

## สิ่งที่จะทำ

เพิ่มปุ่ม icon รูปดินสอ/กระดาษ ข้างปุ่ม Hint และ Equation ในแต่ละข้อ เมื่อกดจะแสดง popup Canvas ให้เด็กใช้นิ้วหรือเมาส์วาด/เขียนทดเลขได้ พร้อมปุ่มลบ (ล้างกระดาษ) และปุ่มปิด

## การแก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|------|----------------|
| `src/pages/MixedMathPracticeApp.tsx` | เพิ่ม ScratchPad component และปุ่ม icon |

## รายละเอียดทางเทคนิค

### 1. เพิ่ม import
- เพิ่ม `Pencil` จาก `lucide-react` สำหรับ icon ปุ่มกระดาษทด
- เพิ่ม `Dialog, DialogContent, DialogHeader, DialogTitle` จาก `@/components/ui/dialog`

### 2. สร้าง ScratchPad component (inline ในไฟล์เดียวกัน)
- ใช้ HTML5 `<canvas>` element สำหรับวาด
- รองรับทั้ง mouse events (`mousedown`, `mousemove`, `mouseup`) และ touch events (`touchstart`, `touchmove`, `touchend`) เพื่อใช้งานได้บนมือถือ/แท็บเล็ต
- พื้นหลังสีขาวหรือครีม เส้นสีน้ำเงินเข้ม ขนาดเส้น 2-3px
- ปุ่ม "ลบทั้งหมด" (ไอคอนถังขยะ/ยางลบ) เพื่อ clear canvas
- ขนาด canvas ยืดหยุ่นตาม dialog (ประมาณ 400x300 บน mobile, ใหญ่ขึ้นบน desktop)

### 3. เพิ่มปุ่ม icon ในแต่ละ question card
- เพิ่มปุ่มที่มี icon `Pencil` ข้างปุ่ม Hint และ Equation
- สี: `text-emerald-400/70` พร้อม `bg-emerald-500/10` ให้เข้ากับ theme มืด
- เมื่อกด เปิด Dialog ที่มี ScratchPad

### 4. State management
- เพิ่ม state `scratchPadOpen` เก็บ question id ที่กำลังเปิดกระดาษทด (หรือ `null` ถ้าไม่มี)
- Canvas data เก็บไว้ใน ref เพื่อไม่ให้หายเมื่อปิด-เปิด (optional, อาจ reset ทุกครั้ง)

### 5. Dialog popup
- ใช้ Radix Dialog component ที่มีอยู่แล้ว
- Header แสดง "กระดาษทด - ข้อที่ X"
- Footer มีปุ่ม "ลบ" (clear) และ "ปิด"
- ขนาด `max-w-2xl` เพื่อให้พื้นที่วาดเพียงพอ
