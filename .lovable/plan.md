

# ขยายกระดาษทดให้เลื่อนลงได้

## ปัญหา
Canvas มีขนาดคงที่ 600x400px ถ้าเด็กเขียนเต็มกระดาษจะไม่มีพื้นที่เพิ่ม

## แนวทางแก้ไข

ปรับ `src/components/ScratchPad.tsx`:

1. **เพิ่มปุ่ม "เพิ่มกระดาษ"** -- เพิ่มปุ่มที่ขยาย canvas ลงด้านล่างทีละ 400px (เพิ่มหน้ากระดาษ) โดยคัดลอกภาพวาดเดิมไว้แล้ววาด grid ต่อส่วนที่เพิ่ม
2. **ครอบ canvas ด้วย ScrollArea** -- ใส่ container ที่มี `overflow-y: auto` และ `max-height` จำกัดตาม viewport เพื่อให้เลื่อนดูส่วนที่เพิ่มได้
3. **State สำหรับความสูง** -- เพิ่ม `canvasHeight` state เริ่มต้นที่ 400 และเพิ่มได้เรื่อย ๆ
4. **ปุ่มลบ reset ขนาด** -- เมื่อกด "ลบทั้งหมด" จะ reset ความสูงกลับเป็น 400px

### รายละเอียดทางเทคนิค

| ส่วน | รายละเอียด |
|------|-----------|
| State | เพิ่ม `canvasHeight` useState เริ่มที่ 400 |
| ปุ่มเพิ่มกระดาษ | ไอคอน `ChevronDown` หรือ `Plus` พร้อมข้อความ "เพิ่มกระดาษ" วางใต้ canvas |
| Scroll container | `div` ครอบ canvas ด้วย `max-h-[60vh] overflow-y-auto` |
| ขยาย canvas | Save imageData เดิม -> เพิ่ม height +400 -> restore imageData -> วาด grid ส่วนใหม่ |
| Clear | Reset `canvasHeight` กลับ 400 แล้ว `clearCanvas()` ตามปกติ |

