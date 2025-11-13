export interface SkillConfig {
  skill: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  range?: [number, number];
  tables?: number[];
}

export const curriculumConfig: Record<string, Record<string, SkillConfig[]>> = {
  grade1: {
    semester1: [
      // 1. จำนวนนับพื้นฐาน (0-100)
      { skill: 'counting', difficulty: 'easy', count: 5, range: [0, 100] },
      { skill: 'comparing', difficulty: 'easy', count: 4, range: [0, 100] },
      { skill: 'ordering', difficulty: 'easy', count: 3, range: [0, 100] },
      { skill: 'placeValue', difficulty: 'easy', count: 3, range: [0, 99] },
      
      // 2. การบวก-ลบ (ผลลัพธ์/ตัวตั้งไม่เกิน 10)
      { skill: 'addition', difficulty: 'easy', count: 5, range: [0, 10] },
      { skill: 'subtraction', difficulty: 'easy', count: 5, range: [0, 10] },
      
      // 3. แบบรูป
      { skill: 'patterns', difficulty: 'easy', count: 4 },
      
      // 4. เรขาคณิต
      { skill: 'shapes', difficulty: 'easy', count: 4 },
      
      // 5. การวัด
      { skill: 'measurement', difficulty: 'easy', count: 3 },
      
      // 6. สถิติ
      { skill: 'pictograph', difficulty: 'easy', count: 3 }
    ],
    semester2: [
      // 1. จำนวนนับและค่าประจำหลัก (21-100) - 12 ข้อ
      { skill: 'counting', difficulty: 'easy', count: 4, range: [21, 100] },
      { skill: 'comparing', difficulty: 'easy', count: 3, range: [21, 100] },
      { skill: 'ordering', difficulty: 'easy', count: 2, range: [21, 100] },
      { skill: 'placeValue', difficulty: 'easy', count: 3, range: [21, 100] },
      
      // 2. การบวก-ลบ (ขยายถึง 100) - 10 ข้อ
      { skill: 'addition', difficulty: 'easy', count: 5, range: [21, 100] },
      { skill: 'subtraction', difficulty: 'easy', count: 5, range: [21, 100] },
      
      // 3. แบบรูป (ต่อยอด) - 4 ข้อ
      { skill: 'patterns', difficulty: 'easy', count: 4 },
      
      // 4. เรขาคณิต (ต่อยอด) - 4 ข้อ
      { skill: 'shapes', difficulty: 'easy', count: 4 },
      
      // 5. การวัดความยาว (ต่อยอด) - 3 ข้อ
      { skill: 'measurement', difficulty: 'easy', count: 3 }
    ]
  },
  grade2: {
    semester1: [
      { skill: 'addition', difficulty: 'medium', count: 8, range: [20, 100] },
      { skill: 'subtraction', difficulty: 'medium', count: 8, range: [20, 100] },
      { skill: 'multiplication', difficulty: 'easy', count: 7, tables: [2, 3, 5] },
      { skill: 'placeValue', difficulty: 'easy', count: 7 }
    ],
    semester2: [
      { skill: 'multiplication', difficulty: 'medium', count: 10, tables: [2, 3, 4, 5] },
      { skill: 'division', difficulty: 'easy', count: 8, range: [1, 50] },
      { skill: 'money', difficulty: 'medium', count: 6 },
      { skill: 'time', difficulty: 'easy', count: 6 }
    ]
  },
  grade3: {
    semester1: [
      { skill: 'addition', difficulty: 'medium', count: 7, range: [100, 999] },
      { skill: 'subtraction', difficulty: 'medium', count: 7, range: [100, 999] },
      { skill: 'multiplication', difficulty: 'medium', count: 8, tables: [2, 3, 4, 5, 6, 7, 8, 9] },
      { skill: 'division', difficulty: 'medium', count: 8, range: [1, 100] }
    ],
    semester2: [
      { skill: 'multiplication', difficulty: 'hard', count: 8, tables: [6, 7, 8, 9, 10, 11, 12] },
      { skill: 'division', difficulty: 'medium', count: 8, range: [1, 100] },
      { skill: 'fractions', difficulty: 'easy', count: 7 },
      { skill: 'measurement', difficulty: 'medium', count: 7 }
    ]
  },
  grade4: {
    semester1: [
      { skill: 'multiplication', difficulty: 'hard', count: 8, range: [10, 999] },
      { skill: 'division', difficulty: 'hard', count: 8, range: [10, 999] },
      { skill: 'fractions', difficulty: 'medium', count: 7 },
      { skill: 'decimals', difficulty: 'easy', count: 7 }
    ],
    semester2: [
      { skill: 'fractions', difficulty: 'hard', count: 8 },
      { skill: 'decimals', difficulty: 'medium', count: 8 },
      { skill: 'percentage', difficulty: 'easy', count: 7 },
      { skill: 'geometry', difficulty: 'medium', count: 7 }
    ]
  },
  grade5: {
    semester1: [
      { skill: 'fractions', difficulty: 'hard', count: 8 },
      { skill: 'decimals', difficulty: 'hard', count: 8 },
      { skill: 'percentage', difficulty: 'medium', count: 7 },
      { skill: 'ratios', difficulty: 'easy', count: 7 }
    ],
    semester2: [
      { skill: 'percentage', difficulty: 'hard', count: 8 },
      { skill: 'ratios', difficulty: 'medium', count: 8 },
      { skill: 'algebra', difficulty: 'easy', count: 7 },
      { skill: 'geometry', difficulty: 'medium', count: 7 }
    ]
  },
  grade6: {
    semester1: [
      { skill: 'algebra', difficulty: 'medium', count: 8 },
      { skill: 'ratios', difficulty: 'hard', count: 8 },
      { skill: 'percentage', difficulty: 'hard', count: 7 },
      { skill: 'geometry', difficulty: 'hard', count: 7 }
    ],
    semester2: [
      { skill: 'algebra', difficulty: 'hard', count: 8 },
      { skill: 'statistics', difficulty: 'medium', count: 8 },
      { skill: 'probability', difficulty: 'easy', count: 7 },
      { skill: 'geometry', difficulty: 'hard', count: 7 }
    ]
  }
};

export const getGradeOptions = () => [
  { value: 1, label: 'ประถมศึกษาปีที่ 1' },
  { value: 2, label: 'ประถมศึกษาปีที่ 2' },
  { value: 3, label: 'ประถมศึกษาปีที่ 3' },
  { value: 4, label: 'ประถมศึกษาปีที่ 4' },
  { value: 5, label: 'ประถมศึกษาปีที่ 5' },
  { value: 6, label: 'ประถมศึกษาปีที่ 6' }
];

export const getSemesterOptions = () => [
  { value: 1, label: 'เทอม 1' },
  { value: 2, label: 'เทอม 2' }
];
