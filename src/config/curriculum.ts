export interface SkillConfig {
  skill: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  range?: [number, number];
  tables?: number[];
  description?: string;
  points?: number[];
  questionTypes?: string[];
}

export const assessmentTypes = {
  semester1: 'semester1',
  semester2: 'semester2',
  nt: 'nt'
} as const;

export const curriculumConfig: Record<string, Record<string, SkillConfig[]>> = {
  grade1: {
    semester1: [
      // 1. จำนวนนับพื้นฐาน (0-100)
      { skill: 'counting', difficulty: 'easy', count: 5, range: [0, 100], description: 'นับทีละ 1 และทีละ 10 อ่าน-เขียนเลขไทย/อารบิก ในช่วง 0-100' },
      { skill: 'comparing', difficulty: 'easy', count: 4, range: [0, 100], description: 'เปรียบเทียบจำนวนด้วยสัญลักษณ์ =, ≠, >, <' },
      { skill: 'ordering', difficulty: 'easy', count: 3, range: [0, 100], description: 'เรียงลำดับจำนวนจากน้อยไปมาก มากไปน้อย และอันดับที่' },
      { skill: 'placeValue', difficulty: 'easy', count: 3, range: [0, 99], description: 'แยกจำนวนเป็นหลักสิบและหลักหน่วย' },
      
      // 2. การบวก-ลบ (ผลลัพธ์/ตัวตั้งไม่เกิน 10)
      { skill: 'addition', difficulty: 'easy', count: 6, range: [0, 10], description: 'บวกสองจำนวน ผลบวกไม่เกิน 10 และใช้สมบัติสลับที่' },
      { skill: 'subtraction', difficulty: 'easy', count: 6, range: [0, 10], description: 'ลบสองจำนวน ตัวตั้งไม่เกิน 10 และโจทย์สถานการณ์' },
      
      // 3. แบบรูป
      { skill: 'patterns', difficulty: 'easy', count: 4, description: 'เติมจำนวนที่หายไปในแบบรูปที่เพิ่ม/ลดทีละ 1 หรือทีละ 10 และแบบรูปซ้ำ' },
      
      // 4. เรขาคณิต
      { skill: 'shapes', difficulty: 'easy', count: 4, description: 'จำแนกรูปร่าง 2 มิติและ 3 มิติพื้นฐาน เช่น สามเหลี่ยม สี่เหลี่ยม วงกลม' },
      
      // 5. การวัด
      { skill: 'measurement', difficulty: 'easy', count: 3, description: 'วัดและเปรียบเทียบความยาว (ซม./ม.) และน้ำหนัก (กก./ขีด)' },
      
      // 6. สถิติ
      { skill: 'pictograph', difficulty: 'easy', count: 2, description: 'อ่านและตีความแผนภูมิรูปภาพ (1 รูป = 1 หน่วย)' }
    ],
    semester2: [
      // 1. จำนวนนับและค่าประจำหลัก (21-100) - 15 ข้อ
      { skill: 'counting', difficulty: 'easy', count: 5, range: [21, 100], description: 'นับ อ่าน-เขียนเลขไทย/อารบิก 21-100 ใช้ตารางร้อยและแบบรูป' },
      { skill: 'comparing', difficulty: 'easy', count: 4, range: [21, 100], description: 'เปรียบเทียบจำนวน 21-100 ด้วยสัญลักษณ์ =, ≠, >, <' },
      { skill: 'ordering', difficulty: 'easy', count: 3, range: [21, 100], description: 'เรียงลำดับจำนวน 21-100 จากน้อยไปมาก มากไปน้อย' },
      { skill: 'placeValue', difficulty: 'easy', count: 3, range: [21, 100], description: 'เข้าใจหลักสิบและหลักหน่วยของจำนวน 21-100' },
      
      // 2. การบวก-ลบ (ขยายถึง 100) - 12 ข้อ
      { skill: 'addition', difficulty: 'easy', count: 6, range: [21, 100], description: 'บวกสองหลัก+หนึ่งหลัก สองหลัก+สองหลัก ผลไม่เกิน 100 ตั้งคอลัมน์' },
      { skill: 'subtraction', difficulty: 'easy', count: 6, range: [21, 100], description: 'ลบสองหลัก ตั้งคอลัมน์ หาค่าที่ไม่ทราบ และโจทย์สถานการณ์' },
      
      // 3. แบบรูป (ต่อยอด) - 5 ข้อ
      { skill: 'patterns', difficulty: 'easy', count: 5, description: 'แบบรูปบนตารางร้อย และแบบรูปซ้ำของรูปเรขาคณิต เติมสมาชิกที่หายไป' },
      
      // 4. เรขาคณิต (ต่อยอด) - 4 ข้อ
      { skill: 'shapes', difficulty: 'easy', count: 4, description: 'จำแนกรูป 2 มิติ/3 มิติ เชื่อมโยงสิ่งรอบตัว วาด/สร้างแบบรูปซ้ำ' },
      
      // 5. การวัดความยาว (ต่อยอด) - 4 ข้อ
      { skill: 'measurement', difficulty: 'easy', count: 4, description: 'วัดความยาว (ซม./ม.) คาดคะเน เปรียบเทียบ และแก้โจทย์บวก-ลบ' }
    ]
  },
  grade2: {
    semester1: [
      // 1. จำนวนนับไม่เกิน 1,000 และ 0
      { skill: 'counting', difficulty: 'easy', count: 5, range: [0, 1000], description: 'นับ อ่าน-เขียนเลขไทย/อารบิก 0-1,000 นับทีละ 2/5/10/100 จำนวนคี่-คู่' },
      { skill: 'comparing', difficulty: 'easy', count: 4, range: [0, 1000], description: 'เปรียบเทียบและเรียงลำดับจำนวน 0-1,000' },
      { skill: 'placeValue', difficulty: 'easy', count: 4, range: [0, 1000], description: 'ค่าประจำหลัก: หลักร้อย หลักสิบ หลักหน่วย' },
      
      // 2. การบวกและการลบจำนวนนับไม่เกิน 1,000
      { skill: 'addition', difficulty: 'medium', count: 7, range: [0, 1000], description: 'บวกตั้งคอลัมน์ ผลบวกไม่เกิน 1,000 และโจทย์สถานการณ์' },
      { skill: 'subtraction', difficulty: 'medium', count: 7, range: [0, 1000], description: 'ลบตั้งคอลัมน์ ตัวตั้งไม่เกิน 1,000 หาค่าที่ไม่ทราบ' },
      
      // 3. การวัดความยาว
      { skill: 'measurement', difficulty: 'easy', count: 4, description: 'วัดความยาว (เมตร/เซนติเมตร) คาดคะเน แก้โจทย์' },
      
      // 4. การวัดน้ำหนัก
      { skill: 'weighing', difficulty: 'easy', count: 4, description: 'วัดน้ำหนัก (กิโลกรัม/กรัม/ขีด) ความสัมพันธ์หน่วย แก้โจทย์' },
      
      // 5. การคูณ (เบื้องต้น)
      { skill: 'multiplication', difficulty: 'easy', count: 5, tables: [2, 3, 4, 5], description: 'ความหมายการคูณ สร้างประโยคสัญลักษณ์จากกลุ่มเท่า ๆ กัน' }
    ],
    semester2: [
      // 1. การหาร
      { skill: 'division', difficulty: 'easy', count: 8, range: [1, 99], description: 'ความหมายการหาร ผลหาร/เศษ ความสัมพันธ์คูณ-หาร โจทย์ (ตัวตั้ง ≤ 2 หลัก)' },
      
      // 2. เวลา
      { skill: 'time', difficulty: 'easy', count: 7, description: 'บอกเวลา นาฬิกา/นาที (ช่วง 5 นาที) ระยะเวลา อ่านปฏิทิน โจทย์เวลา' },
      
      // 3. การวัดปริมาตร/ความจุ
      { skill: 'volume', difficulty: 'easy', count: 5, description: 'หน่วยไม่มาตรฐานถึงลิตร เปรียบเทียบ คาดคะเน โจทย์' },
      
      // 4. รูปเรขาคณิต
      { skill: 'shapes', difficulty: 'easy', count: 6, description: 'จำแนก/บอกลักษณะรูปสองมิติ เขียนรูปจากแบบ' },
      
      // 5. บวก-ลบ-คูณ-หารระคน
      { skill: 'mixedOperations', difficulty: 'medium', count: 6, description: 'แปลสถานการณ์เป็นประโยคสัญลักษณ์และหาคำตอบ' },
      
      // 6. แผนภูมิรูปภาพ
      { skill: 'pictograph', difficulty: 'easy', count: 5, description: 'อ่าน-ใช้ข้อมูล 1 รูปแทน 2/5/10 หน่วย' }
    ]
  },
  grade3: {
    semester1: [
      // 1. จำนวนนับไม่เกิน 100,000
      { skill: 'counting', difficulty: 'medium', count: 5, range: [1000, 100000], description: 'อ่าน-เขียนตัวเลขไทย-อารบิก ไม่เกิน 100,000' },
      { skill: 'placeValue', difficulty: 'medium', count: 6, range: [1000, 100000], description: 'ค่าประจำหลัก (หมื่น พัน ร้อย สิบ หน่วย)' },
      { skill: 'comparing', difficulty: 'medium', count: 4, range: [1000, 100000], description: 'เปรียบเทียบและเรียงลำดับจำนวน' },
      { skill: 'patterns', difficulty: 'medium', count: 3, range: [1000, 100000], description: 'แบบรูปจำนวน (เพิ่ม/ลดเท่า ๆ กัน) ตารางร้อย-พัน' },
      
      // 2. การดำเนินการของจำนวน
      { skill: 'addition', difficulty: 'medium', count: 7, range: [100, 100000], description: 'บวกแบบตั้งคอลัมน์ มี/ไม่มีการทด ผลไม่เกิน 100,000' },
      { skill: 'subtraction', difficulty: 'medium', count: 7, range: [100, 100000], description: 'ลบแบบตั้งคอลัมน์ มี/ไม่มีการกระจาย ตัวตั้งไม่เกิน 100,000' },
      
      // 3. เรขาคณิต 2 มิติ & ความสมมาตร
      { skill: 'shapes', difficulty: 'medium', count: 6, description: 'จำแนกรูป 2 มิติ ระบุ-นับแกนสมมาตร visualization' },
      
      // 4. เวลา
      { skill: 'time', difficulty: 'medium', count: 6, description: 'บอกเวลา เปลี่ยนหน่วย ชม.⇄นาที เปรียบเทียบ โจทย์บวก-ลบ/คูณ-หาร' },
      
      // 5. เศษส่วนเบื้องต้น
      { skill: 'fractions', difficulty: 'easy', count: 6, description: 'เต็ม/ครึ่งหน่วย อ่าน-เขียนเศษส่วน เท่ากับ 1 เปรียบเทียบ' }
    ],
    semester2: [
      // 1. การหาร (25-30%)
      { skill: 'division', difficulty: 'medium', count: 12, range: [10, 9999], description: 'หารสั้น/หารยาว ตัวตั้ง 2-4 หลัก หารด้วย 1 หลัก ลงตัว-ไม่ลงตัว คูณ-หารสัมพันธ์' },
      
      // 2. การวัดความยาว (15-20%)
      { skill: 'measurement', difficulty: 'medium', count: 8, description: 'มม.-ซม.-ม.-กม. ความสัมพันธ์หน่วย เลือกเครื่องมือ บวก-ลบ-คูณ-หาร' },
      
      // 3. การวัดน้ำหนัก (10-15%)
      { skill: 'weighing', difficulty: 'medium', count: 6, description: 'กรัม-ขีด-กก.-ตัน อ่านเครื่องชั่ง ความสัมพันธ์หน่วย บวก-ลบ-คูณ-หาร' },
      
      // 4. การวัดปริมาตร/ความจุ (10-15%)
      { skill: 'volume', difficulty: 'medium', count: 6, description: 'มล.-ลิตร เครื่องตวง ความสัมพันธ์หน่วย คำนวณ' },
      
      // 5. เงินและบันทึกรายรับ-รายจ่าย (10-15%)
      { skill: 'money', difficulty: 'medium', count: 6, description: 'นับ/แลกเปลี่ยน คิดเงินทอน บันทึกรายรับ-รายจ่าย' },
      
      // 6. บวก-ลบ-คูณ-หารระคน (15-20%)
      { skill: 'mixedOperations', difficulty: 'medium', count: 8, description: 'เขียนประโยคสัญลักษณ์ มีวงเล็บ ตรวจสอบความสมเหตุสมผล' }
    ],
    nt: [
      // การสอบวัดระดับชาติ (NT) ป.3 - 30 ข้อ แบบเลือกตอบ 4 ตัวเลือก
      // 1. การนับและแบบรูป (5 ข้อ)
      { 
        skill: 'counting', 
        difficulty: 'medium', 
        count: 5, 
        range: [0, 10000],
        points: [3, 3, 3, 4, 4],
        questionTypes: ['compare_from_table', 'number_patterns', 'place_value', 'ordering', 'word_problems'],
        description: 'เปรียบเทียบจำนวน แบบรูป ค่าประจำหลัก เรียงลำดับ โจทย์ปัญหา'
      },
      
      // 2. เศษส่วน (6 ข้อ)
      { 
        skill: 'fractions', 
        difficulty: 'medium', 
        count: 6,
        points: [3, 3, 3, 3, 4, 4],
        questionTypes: ['compare_with_pictures', 'equivalent_fractions', 'add_same_denominator', 'subtract_same_denominator', 'word_problems', 'mixed_operations'],
        description: 'เปรียบเทียบ เศษส่วนเท่ากัน บวก-ลบเศษส่วน โจทย์ปัญหา'
      },
      
      // 3. เงิน (4 ข้อ)
      { 
        skill: 'money', 
        difficulty: 'medium', 
        count: 4,
        points: [3, 4, 4, 4],
        questionTypes: ['count_money_pictures', 'making_change', 'shopping_problems', 'budgeting'],
        description: 'นับเงิน ทอนเงิน โจทย์ซื้อของ การวางแผนใช้เงิน'
      },
      
      // 4. เวลา (4 ข้อ)
      { 
        skill: 'time', 
        difficulty: 'medium', 
        count: 4,
        points: [3, 3, 4, 4],
        questionTypes: ['read_clock', 'time_duration', 'schedules', 'word_problems'],
        description: 'อ่านนาฬิกา ระยะเวลา ตารางเวลา โจทย์ปัญหา'
      },
      
      // 5. การวัด (4 ข้อ)
      { 
        skill: 'measurement', 
        difficulty: 'medium', 
        count: 4,
        points: [3, 3, 4, 4],
        questionTypes: ['length_comparison', 'unit_conversion', 'perimeter', 'word_problems'],
        description: 'เปรียบเทียบความยาว แปลงหน่วย รอบรูป โจทย์ปัญหา'
      },
      
      // 6. รูปเรขาคณิต (3 ข้อ)
      { 
        skill: 'shapes', 
        difficulty: 'medium', 
        count: 3,
        points: [3, 3, 4],
        questionTypes: ['identify_shapes', 'symmetry', 'patterns'],
        description: 'จำแนกรูป สมมาตร แบบรูปเรขาคณิต'
      },
      
      // 7. การนำเสนอข้อมูล (4 ข้อ)
      { 
        skill: 'dataPresentation', 
        difficulty: 'medium', 
        count: 4,
        points: [3, 3, 3, 4],
        questionTypes: ['read_table', 'read_pictograph', 'read_bar_chart', 'interpret_data'],
        description: 'อ่านตาราง แผนภูมิรูปภาพ แผนภูมิแท่ง แปลความหมายข้อมูล'
      }
    ]
  },
  grade4: {
    semester1: [
      // 1. จำนวนนับที่มากกว่า 100,000 (25-30%)
      { skill: 'counting', difficulty: 'hard', count: 6, range: [100000, 10000000], description: 'อ่าน-เขียนเลขไทย-อารบิก-ตัวหนังสือ ถึงสิบล้าน' },
      { skill: 'placeValue', difficulty: 'hard', count: 6, range: [100000, 10000000], description: 'หลัก-ค่าประจำหลัก (ล้าน แสน หมื่น พัน ร้อย สิบ หน่วย)' },
      { skill: 'comparing', difficulty: 'hard', count: 3, range: [100000, 10000000], description: 'เปรียบเทียบ-เรียงลำดับ ประมาณค่า' },
      
      // 2. บวก-ลบ ≥6 หลัก (20-25%)
      { skill: 'addition', difficulty: 'hard', count: 6, range: [100000, 10000000], description: 'บวกตั้งคอลัมน์ ≥6 หลัก ตรวจความสมเหตุสมผล' },
      { skill: 'subtraction', difficulty: 'hard', count: 6, range: [100000, 10000000], description: 'ลบตั้งคอลัมน์ ≥6 หลัก ค่าที่ไม่ทราบ' },
      
      // 3. คูณ-หาร (20-25%)
      { skill: 'multiplication', difficulty: 'hard', count: 6, range: [10, 9999], description: 'คูณหลายหลัก ความสัมพันธ์คูณ-หาร' },
      { skill: 'division', difficulty: 'hard', count: 6, range: [100, 99999], description: 'หารยาว/สั้น ตัวหาร 1-2 หลัก โจทย์สถานการณ์' },
      
      // 4. ระคน 4 กระบวนการ + ค่าเฉลี่ย (10-15%)
      { skill: 'mixedOperations', difficulty: 'hard', count: 4, description: 'ระคน มี/ไม่มีวงเล็บ แปลงสถานการณ์' },
      { skill: 'average', difficulty: 'easy', count: 3, description: 'ค่าเฉลี่ยอย่างง่าย' },
      
      // 5. เวลา (15-20%)
      { skill: 'time', difficulty: 'hard', count: 8, description: 'วินาที-นาที-ชม.-วัน-สัปดาห์-เดือน-ปี ตารางเวลา โจทย์' }
    ],
    semester2: [
      // 1. เศษส่วน (25-30%)
      { skill: 'fractions', difficulty: 'hard', count: 12, description: 'เศษส่วนแท้-เศษเกิน-จำนวนคละ เศษส่วนเท่ากัน/อย่างต่ำ เปรียบเทียบ-เรียงลำดับ บวก-ลบ โจทย์' },
      
      // 2. ทศนิยม (20-25%)
      { skill: 'decimals', difficulty: 'medium', count: 10, description: 'อ่าน-เขียนทศนิยม (ไม่เกิน 3 ตำแหน่ง) เปรียบเทียบ-เรียงลำดับ บวก-ลบ โจทย์' },
      
      // 3. มุม (10-15%)
      { skill: 'angles', difficulty: 'medium', count: 6, description: 'จุด เส้นตรง รังสี ส่วนของเส้นตรง ชนิดมุม วัด-เปรียบเทียบองศา สร้างมุม' },
      
      // 4. สี่เหลี่ยมมุมฉาก (20-25%)
      { skill: 'rectangles', difficulty: 'medium', count: 10, description: 'ชนิด-สมบัติ สร้างรูป ความยาวรอบรูป พื้นที่ โจทย์' },
      
      // 5. การนำเสนอข้อมูล (10-15%)
      { skill: 'dataPresentaton', difficulty: 'easy', count: 6, description: 'เก็บ-จำแนกข้อมูล นำเสนอ (แผนภูมิ/ตาราง) ตอบคำถาม' }
    ]
  },
  grade5: {
    semester1: [
      // เศษส่วน (40-45%)
      { skill: 'fractions', difficulty: 'medium', count: 25, range: [1, 20], description: 'เศษส่วนเท่ากัน เปรียบเทียบ-เรียงลำดับ ย่อ/ขยาย บวก-ลบ (รวมจำนวนคละ) โจทย์สถานการณ์' },
      // ทศนิยม (35-40%)
      { skill: 'decimals', difficulty: 'medium', count: 22, range: [0, 1000], description: 'ทศนิยมถึงหลักพันส่วน ค่าประจำหลัก อ่าน-เขียน เปรียบเทียบ บวก-ลบ คูณด้วย 10,100,1000' },
      // ประมาณค่า (10-15%)
      { skill: 'estimation', difficulty: 'medium', count: 8, range: [0, 1000], description: 'การประมาณค่า ปัดเศษ ตรวจความสมเหตุสมผล' },
      // บูรณาการ (5-10%)
      { skill: 'mixedProblems', difficulty: 'medium', count: 5, range: [0, 100], description: 'โจทย์บูรณาการเศษส่วน-ทศนิยม' }
    ],
    semester2: [
      // ร้อยละ & บัญญัติไตรยางศ์ (35-40%)
      { skill: 'percentage', difficulty: 'medium', count: 22, range: [0, 100], description: 'ร้อยละ ลดราคา กำไร-ขาดทุน บัญญัติไตรยางศ์' },
      // อัตราส่วน-สัดส่วน
      { skill: 'ratios', difficulty: 'medium', count: 10, range: [1, 100], description: 'อัตราส่วน สัดส่วน Rule of Three' },
      // รูปสี่เหลี่ยม & พื้นที่สามเหลี่ยม (20-25%)
      { skill: 'quadrilaterals', difficulty: 'medium', count: 15, range: [1, 20], description: 'จำแนก-สมบัติรูปสี่เหลี่ยม รอบรูป พื้นที่ พื้นที่สามเหลี่ยม' },
      // ปริมาตร-ความจุ (15-20%)
      { skill: 'volume', difficulty: 'medium', count: 12, range: [1, 100], description: 'ปริมาตร-ความจุของทรงสี่เหลี่ยมมุมฉาก กว้าง×ยาว×สูง เทียบหน่วย โจทย์' },
      // การนำเสนอข้อมูล (10-15%)
      { skill: 'graphReading', difficulty: 'medium', count: 8, range: [0, 100], description: 'อ่าน-ตีความ-สร้างกราฟเส้น/แผนภูมิแท่ง' }
    ]
  },
  grade6: {
    semester1: [
      // พีชคณิต (25-30%)
      { skill: 'algebra', difficulty: 'medium', count: 10, range: [1, 100], description: 'ตัวแปร สมการเชิงเส้น การแก้สมการ โจทย์ปัญหา' },
      // อัตราส่วน-สัดส่วน (25-30%)
      { skill: 'ratios', difficulty: 'hard', count: 10, range: [1, 1000], description: 'อัตราส่วน สัดส่วน การขยาย-ย่ออัตราส่วน การแบ่งตามสัดส่วน' },
      // ร้อยละ (20-25%)
      { skill: 'percentage', difficulty: 'hard', count: 10, range: [0, 100], description: 'ร้อยละขั้นสูง ดอกเบี้ย ส่วนลด ภาษี กำไร-ขาดทุน' },
      // เรขาคณิต (20-25%)
      { skill: 'geometry', difficulty: 'hard', count: 10, range: [1, 100], description: 'ทรงกลม ทรงกระบอก ปริมาตร พื้นที่ผิว การแปลงรูป' }
    ],
    semester2: [
      // พีชคณิตขั้นสูง (25-30%)
      { skill: 'algebra', difficulty: 'hard', count: 10, range: [1, 100], description: 'สมการเชิงเส้นขั้นสูง อสมการ กราฟเส้นตรง' },
      // สถิติ (25-30%)
      { skill: 'statistics', difficulty: 'medium', count: 10, range: [1, 100], description: 'ค่าเฉลี่ย มัธยฐาน ฐานนิยม พิสัย การเก็บข้อมูล การวิเคราะห์กราฟ' },
      // ความน่าจะเป็น (20-25%)
      { skill: 'probability', difficulty: 'easy', count: 10, range: [1, 10], description: 'ความน่าจะเป็นเบื้องต้น การนับเหตุการณ์ ทดลองโยนเหรียญ-ทอยลูกเต๋า' },
      // เรขาคณิตขั้นสูง (20-25%)
      { skill: 'geometry', difficulty: 'hard', count: 10, range: [1, 100], description: 'ปริซึม พีระมิด วงกลม เส้นรอบวงกลม พื้นที่วงกลม' }
    ]
  },
  grade7: {
    semester1: [
      // ทบทวนทุกหัวข้อ ป.1-6 สำหรับเตรียมสอบเข้า ม.1
      { skill: 'counting', difficulty: 'hard', count: 4, range: [0, 1000000], description: 'ทบทวนจำนวนนับและค่าประจำหลัก ทุกระดับ' },
      { skill: 'addition', difficulty: 'hard', count: 3, range: [100, 1000000], description: 'ทบทวนการบวก ระดับยาก' },
      { skill: 'subtraction', difficulty: 'hard', count: 3, range: [100, 1000000], description: 'ทบทวนการลบ ระดับยาก' },
      { skill: 'multiplication', difficulty: 'hard', count: 4, range: [10, 9999], description: 'ทบทวนการคูณ หลายหลัก' },
      { skill: 'division', difficulty: 'hard', count: 4, range: [100, 99999], description: 'ทบทวนการหาร หารยาว' },
      { skill: 'fractions', difficulty: 'hard', count: 6, description: 'ทบทวนเศษส่วน บวก-ลบ-คูณ-หาร เศษส่วนเท่ากัน' },
      { skill: 'decimals', difficulty: 'hard', count: 5, range: [0, 1000], description: 'ทบทวนทศนิยม ค่าประจำหลัก บวก-ลบ-คูณ-หาร' },
      { skill: 'percentage', difficulty: 'hard', count: 4, range: [0, 100], description: 'ทบทวนร้อยละ ดอกเบี้ย ส่วนลด กำไร-ขาดทุน' },
      { skill: 'ratios', difficulty: 'hard', count: 4, range: [1, 100], description: 'ทบทวนอัตราส่วน สัดส่วน การแบ่งตามสัดส่วน' },
      { skill: 'algebra', difficulty: 'hard', count: 3, range: [1, 100], description: 'พื้นฐานพีชคณิต สมการเชิงเส้น ตัวแปร' },
      { skill: 'geometry', difficulty: 'hard', count: 5, range: [1, 100], description: 'ทบทวนเรขาคณิต พื้นที่ ปริมาตร รูปเรขาคณิต 2D-3D' },
      { skill: 'mixedOperations', difficulty: 'hard', count: 4, description: 'โจทย์ผสม 4 กระบวนการ วงเล็บ โจทย์ปัญหาซับซ้อน' },
      { skill: 'time', difficulty: 'hard', count: 2, description: 'เวลา ตารางเวลา โจทย์ปัญหา' },
      { skill: 'measurement', difficulty: 'hard', count: 2, description: 'การวัด แปลงหน่วย โจทย์ปัญหา' },
      { skill: 'statistics', difficulty: 'medium', count: 2, range: [1, 100], description: 'สถิติ ค่าเฉลี่ย การนำเสนอข้อมูล' }
    ],
    semester2: [] // ใช้เหมือน semester1 สำหรับเตรียมสอบ
  }
};

export const getGradeOptions = () => [
  { value: 1, label: 'ประถมศึกษาปีที่ 1' },
  { value: 2, label: 'ประถมศึกษาปีที่ 2' },
  { value: 3, label: 'ประถมศึกษาปีที่ 3' },
  { value: 4, label: 'ประถมศึกษาปีที่ 4' },
  { value: 5, label: 'ประถมศึกษาปีที่ 5' },
  { value: 6, label: 'ประถมศึกษาปีที่ 6' },
  { value: 7, label: 'เตรียมสอบเข้า ม.1' }
];

export const getSemesterOptions = () => [
  { value: 1, label: 'เทอม 1' },
  { value: 2, label: 'เทอม 2' }
];
