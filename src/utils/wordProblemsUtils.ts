export type ProblemCategory = 'length' | 'weight' | 'volume' | 'time' | 'science' | 'engineering';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface WordProblem {
  id: string;
  category: ProblemCategory;
  difficulty: Difficulty;
  question: string;
  correctAnswer: number;
  unit: string;
  choices: number[];
  explanation: string;
  symbolHint: string;
  conceptHint: string;
  hasMultipleUnits?: boolean;
  mainUnit?: number;
  subUnit?: number;
  subUnitName?: string;
}

// ฟังก์ชันแปลงหน่วย
export function convertKhitToKg(khit: number): number {
  return khit * 0.6;
}

export function convertMlToLiter(ml: number): number {
  return ml / 1000;
}

export function convertCmToM(cm: number): number {
  return cm / 100;
}

// ฟังก์ชันสร้างตัวเลือกคำตอบ
function generateChoices(correctAnswer: number, difficulty: Difficulty): number[] {
  const choices = new Set<number>([correctAnswer]);
  
  const range = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 50;
  
  while (choices.size < 4) {
    const offset = Math.floor(Math.random() * range) + 1;
    const isAdd = Math.random() > 0.5;
    const wrongAnswer = isAdd ? correctAnswer + offset : correctAnswer - offset;
    
    if (wrongAnswer > 0 && !choices.has(wrongAnswer)) {
      choices.add(wrongAnswer);
    }
  }
  
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

// โจทย์วัดความยาว
export function generateLengthProblems(count: number, difficulty: Difficulty): WordProblem[] {
  const problems: WordProblem[] = [];
  const templates = [
    // การบวก
    {
      question: (a: number, b: number, unit: string) => 
        `โบว์ผูกผมยาว ${a} ${unit} ยางมัดผมยาว ${b} ${unit} รวมยาวกี่${unit}`,
      answer: (a: number, b: number) => a + b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} + ${b} = ${ans}`,
      symbolHint: (a: number, b: number) => `${a} + ${b} = ?`,
      conceptHint: () => "นำความยาวทั้งสองมาบวกกัน",
    },
    // การลบ
    {
      question: (a: number, b: number, unit: string) => 
        `โบว์ผูกผมยาว ${a} ${unit} ยางมัดผมยาว ${b} ${unit} โบว์ผูกผมยาวกว่ายางมัดผมกี่${unit}`,
      answer: (a: number, b: number) => a - b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} - ${b} = ${ans}`,
      symbolHint: (a: number, b: number) => `${a} - ${b} = ?`,
      conceptHint: () => "นำความยาวของโบว์มาลบด้วยความยาวของยาง",
    },
    // การหาส่วนที่เพิ่ม
    {
      question: (a: number, b: number, unit: string) => 
        `ไม้ท่อนที่หนึ่งยาว ${a} ${unit} ไม้ท่อนที่สองยาวกว่าไม้ท่อนที่หนึ่ง ${b} ${unit} ไม้ท่อนที่สองยาวกี่${unit}`,
      answer: (a: number, b: number) => a + b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} + ${b} = ${ans}`,
      symbolHint: (a: number, b: number) => `${a} + ${b} = ?`,
      conceptHint: () => "ไม้ท่อนที่สองยาวกว่า = ไม้ท่อนที่หนึ่ง + ส่วนที่เพิ่ม",
    },
    // การหาส่วนต่าง
    {
      question: (a: number, b: number, unit: string) => 
        `เชือกเส้นแรกยาว ${a} ${unit} เชือกเส้นที่สองยาว ${b} ${unit} เชือกเส้นแรกยาวกว่าเชือกเส้นที่สองกี่${unit}`,
      answer: (a: number, b: number) => a - b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} - ${b} = ${ans}`,
      symbolHint: (a: number, b: number) => `${a} - ${b} = ?`,
      conceptHint: () => "นำความยาวเชือกเส้นแรกมาลบความยาวเชือกเส้นที่สอง",
    }
  ];

  const maxValue = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 200 : 500;
  const unit = difficulty === 'hard' ? 'เมตร' : 'เซนติเมตร';

  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const a = Math.floor(Math.random() * maxValue) + 10;
    const b = Math.floor(Math.random() * (a - 5)) + 5;
    const correctAnswer = template.answer(a, b);
    
    problems.push({
      id: `length-${i}`,
      category: 'length',
      difficulty,
      question: template.question(a, b, unit),
      correctAnswer,
      unit,
      choices: generateChoices(correctAnswer, difficulty),
      explanation: template.explanation(a, b, correctAnswer),
      symbolHint: template.symbolHint(a, b),
      conceptHint: template.conceptHint(),
    });
  }

  return problems;
}

// โจทย์น้ำหนัก
export function generateWeightProblems(count: number, difficulty: Difficulty): WordProblem[] {
  const problems: WordProblem[] = [];
  const templates = [
    {
      question: (a: number, b: number, unit: string) => 
        `ซื้อส้มโอหนัก ${a} ${unit} ซื้อมะม่วงหนัก ${b} ${unit} รวมหนักกี่${unit}`,
      answer: (a: number, b: number) => a + b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} + ${b} = ${ans}`,
      symbolHint: (a: number, b: number) => `${a} + ${b} = ?`,
      conceptHint: () => "นำน้ำหนักทั้งสองมาบวกกัน",
    },
    {
      question: (a: number, b: number, unit: string) => 
        `แป้งทำขนมหนัก ${a} ${unit} ซึ่งหนักกว่านํ้าตาล ${b} ${unit} นํ้าตาลหนักเท่าไร`,
      answer: (a: number, b: number) => a - b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} - ${b} = ${ans}`,
      symbolHint: (a: number, b: number) => `${a} - ${b} = ?`,
      conceptHint: () => "น้ำตาลหนักน้อยกว่า = นำน้ำหนักแป้งมาลบส่วนต่าง",
    },
    {
      question: (a: number, b: number, unit: string) => 
        `มีน้ำตาล ${a} ${unit} ต้องการให้ครบ ${a + b} ${unit} ต้องซื้อเพิ่มอีกกี่${unit}`,
      answer: (a: number, b: number) => b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a + b} - ${a} = ${ans}`,
      symbolHint: (a: number, b: number) => `${a + b} - ${a} = ?`,
      conceptHint: () => "หาส่วนที่ขาด = เป้าหมาย - มีอยู่",
    }
  ];

  const maxValue = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 100 : 500;
  const unit = difficulty === 'hard' ? 'กิโลกรัม' : difficulty === 'medium' ? 'กิโลกรัม' : 'ขีด';

  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const a = Math.floor(Math.random() * maxValue) + 5;
    const b = Math.floor(Math.random() * a) + 1;
    const correctAnswer = template.answer(a, b);
    
    problems.push({
      id: `weight-${i}`,
      category: 'weight',
      difficulty,
      question: template.question(a, b, unit),
      correctAnswer,
      unit,
      choices: generateChoices(correctAnswer, difficulty),
      explanation: template.explanation(a, b, correctAnswer),
      symbolHint: template.symbolHint(a, b),
      conceptHint: template.conceptHint(),
    });
  }

  return problems;
}

// โจทย์การตวง/ปริมาตร
export function generateVolumeProblems(count: number, difficulty: Difficulty): WordProblem[] {
  const problems: WordProblem[] = [];
  const templates = [
    {
      question: (a: number, b: number, unit: string) => 
        `แม่ค้าขายผ้าให้คุณยายยาว ${a} ${unit} แม่ค้ายังเหลือผ้าอีก ${b} ${unit} เดิมแม่ค้ามีผ้ายาวกี่${unit}`,
      answer: (a: number, b: number) => a + b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} + ${b} = ${ans}`,
      symbolHint: (a: number, b: number) => `${a} + ${b} = ?`,
      conceptHint: () => "นำความยาวที่ขายและเหลือมาบวกกัน",
    },
    {
      question: (a: number, b: number, unit: string) => 
        `มีผ้าผืนหนึ่งยาว ${a} ${unit} ใช้ตัดกระโปรงไปแล้วเหลือผ้ายาว ${b} ${unit} ใช้ผ้าตัดกระโปรงไปทั้งหมดกี่${unit}`,
      answer: (a: number, b: number) => a - b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} - ${b} = ${ans}`,
      symbolHint: (a: number, b: number) => `${a} - ${b} = ?`,
      conceptHint: () => "นำความยาวเดิมมาลบความยาวที่เหลือ",
    },
    {
      question: (a: number, b: number) => 
        `ขวดนํ้าจุได้ ${a} ลิตร แก้วนํ้าจุได้ ${b} มิลลิลิตร รวมกันจุได้กี่ลิตร`,
      answer: (a: number, b: number) => a + (b / 1000),
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} + (${b} ÷ 1000) = ${ans}`,
      symbolHint: (a: number, b: number) => `${a} + (${b} ÷ 1,000) = ?`,
      conceptHint: () => "แปลงมิลลิลิตรเป็นลิตรก่อน แล้วบวกกัน (1,000 มล. = 1 ล.)",
    }
  ];

  const maxValue = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 200 : 1000;
  const unit = 'เมตร';

  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const a = Math.floor(Math.random() * maxValue) + 10;
    const b = Math.floor(Math.random() * a) + 1;
    const correctAnswer = Math.round(template.answer(a, b) * 100) / 100;
    
    problems.push({
      id: `volume-${i}`,
      category: 'volume',
      difficulty,
      question: template.question(a, b, unit),
      correctAnswer,
      unit: unit,
      choices: generateChoices(correctAnswer, difficulty),
      explanation: template.explanation(a, b, correctAnswer),
      symbolHint: template.symbolHint ? template.symbolHint(a, b) : `${a} + ${b} = ?`,
      conceptHint: template.conceptHint ? template.conceptHint() : "คิดตามโจทย์",
    });
  }

  return problems;
}

// โจทย์เวลา
export function generateTimeProblems(count: number, difficulty: Difficulty): WordProblem[] {
  const problems: WordProblem[] = [];
  const templates = [
    {
      question: (a: number, b: number) => 
        `ระยะห่างระหว่างเรือเล็กกับท่าเรือ ${a} เมตร ระยะห่างระหว่างเรือใหญ่กับท่าเรือน้อยกว่า ${b} เมตร เรือใหญ่อยู่ห่างจากท่าเรือเท่าไร`,
      answer: (a: number, b: number) => a - b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} - ${b} = ${ans} เมตร`,
      symbolHint: (a: number, b: number) => `${a} - ${b} = ?`,
      conceptHint: () => "ระยะทางน้อยกว่า = นำระยะทางเรือเล็กมาลบส่วนต่าง",
    },
    {
      question: (a: number, b: number) => 
        `เดินทางไป ${a} นาที พักผ่อน ${b} นาที รวมเวลาทั้งหมดกี่นาที`,
      answer: (a: number, b: number) => a + b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} + ${b} = ${ans} นาที`,
      symbolHint: (a: number, b: number) => `${a} + ${b} = ?`,
      conceptHint: () => "นำเวลาทั้งสองมาบวกกัน",
    }
  ];

  const maxValue = difficulty === 'easy' ? 100 : difficulty === 'medium' ? 500 : 1000;

  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const a = Math.floor(Math.random() * maxValue) + 20;
    const b = Math.floor(Math.random() * (a / 2)) + 10;
    const correctAnswer = template.answer(a, b);
    
    problems.push({
      id: `time-${i}`,
      category: 'time',
      difficulty,
      question: template.question(a, b),
      correctAnswer,
      unit: 'นาที',
      choices: generateChoices(correctAnswer, difficulty),
      explanation: template.explanation(a, b, correctAnswer),
      symbolHint: template.symbolHint(a, b),
      conceptHint: template.conceptHint(),
    });
  }

  return problems;
}

// โจทย์วิทยาศาสตร์ (Science)
export function generateScienceProblems(count: number, difficulty: Difficulty): WordProblem[] {
  const problems: WordProblem[] = [];
  const templates = [
    // การทดลองและการวัด
    {
      question: (a: number, b: number) => 
        `ต้นถั่วงอกสูง ${a} เซนติเมตร หลังจาก 1 สัปดาห์สูงขึ้น ${b} เซนติเมตร ต้นถั่วงอกสูงเท่าไร`,
      answer: (a: number, b: number) => a + b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} + ${b} = ${ans} เซนติเมตร (ความสูงเดิม + ความสูงที่เพิ่ม)`,
      symbolHint: (a: number, b: number) => `${a} + ${b} = ?`,
      conceptHint: () => "การเจริญเติบโตของพืช = ความสูงเดิม + ส่วนที่งอกเพิ่ม",
      unit: "เซนติเมตร"
    },
    {
      question: (a: number, b: number) => 
        `น้ำในบีกเกอร์มี ${a} มิลลิลิตร เอาน้ำออกไป ${b} มิลลิลิตร น้ำเหลือกี่มิลลิลิตร`,
      answer: (a: number, b: number) => a - b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} - ${b} = ${ans} มิลลิลิตร (น้ำเดิม - น้ำที่เทออก)`,
      symbolHint: (a: number, b: number) => `${a} - ${b} = ?`,
      conceptHint: () => "การวัดปริมาตรของเหลว ใช้การลบ",
      unit: "มิลลิลิตร"
    },
    {
      question: (a: number, b: number) => 
        `อุณหภูมิตอนเช้า ${a} องศา ตอนบ่ายร้อนขึ้น ${b} องศา อุณหภูมิตอนบ่ายเท่าไร`,
      answer: (a: number, b: number) => a + b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} + ${b} = ${ans} องศา (อุณหภูมิเช้า + ที่เพิ่มขึ้น)`,
      symbolHint: (a: number, b: number) => `${a} + ${b} = ?`,
      conceptHint: () => "การวัดอุณหภูมิ เมื่อร้อนขึ้นใช้การบวก",
      unit: "องศา"
    },
    // พลังงานและการเคลื่อนที่
    {
      question: (a: number, b: number) => 
        `รถของเล่นวิ่งได้ ${a} เมตร แล้วเดินต่อไปอีก ${b} เมตร รถวิ่งไปรวมกี่เมตร`,
      answer: (a: number, b: number) => a + b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} + ${b} = ${ans} เมตร (ระยะทางรวม)`,
      symbolHint: (a: number, b: number) => `${a} + ${b} = ?`,
      conceptHint: () => "การเคลื่อนที่ ระยะทางรวม = ระยะทาง 1 + ระยะทาง 2",
      unit: "เมตร"
    },
    {
      question: (a: number, b: number) => 
        `ทดลองดันลูกบอล ${a} ครั้ง วันต่อมาดันเพิ่มอีก ${b} ครั้ง ดันรวมกี่ครั้ง`,
      answer: (a: number, b: number) => a + b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} + ${b} = ${ans} ครั้ง (จำนวนรวม)`,
      symbolHint: (a: number, b: number) => `${a} + ${b} = ?`,
      conceptHint: () => "แรงและการเคลื่อนที่ นับจำนวนครั้งรวม",
      unit: "ครั้ง"
    },
    // วงจรชีวิตและธรรมชาติ
    {
      question: (a: number, b: number) => 
        `มีเมล็ดพันธุ์ ${a} เมล็ด งอกแล้ว ${b} เมล็ด เหลือเมล็ดที่ยังไม่งอกกี่เมล็ด`,
      answer: (a: number, b: number) => a - b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} - ${b} = ${ans} เมล็ด (เมล็ดทั้งหมด - ที่งอกแล้ว)`,
      symbolHint: (a: number, b: number) => `${a} - ${b} = ?`,
      conceptHint: () => "วงจรชีวิตพืช นำเมล็ดทั้งหมดลบด้วยที่งอกแล้ว",
      unit: "เมล็ด"
    },
    {
      question: (a: number, b: number) => 
        `สังเกตผีเสื้อ ${a} ตัว มีผีเสื้อบินมาเพิ่มอีก ${b} ตัว มีผีเสื้อทั้งหมดกี่ตัว`,
      answer: (a: number, b: number) => a + b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} + ${b} = ${ans} ตัว (จำนวนรวม)`,
      symbolHint: (a: number, b: number) => `${a} + ${b} = ?`,
      conceptHint: () => "การสังเกตสิ่งมีชีวิต นับจำนวนรวมกัน",
      unit: "ตัว"
    }
  ];

  const maxValue = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 100 : 200;

  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const a = Math.floor(Math.random() * maxValue) + 10;
    const b = Math.floor(Math.random() * (a / 2)) + 5;
    const correctAnswer = template.answer(a, b);
    
    problems.push({
      id: `science-${i}`,
      category: 'science',
      difficulty,
      question: template.question(a, b),
      correctAnswer,
      unit: template.unit,
      choices: generateChoices(correctAnswer, difficulty),
      explanation: template.explanation(a, b, correctAnswer),
      symbolHint: template.symbolHint(a, b),
      conceptHint: template.conceptHint(),
    });
  }

  return problems;
}

// โจทย์วิศวกรรม (Engineering)
export function generateEngineeringProblems(count: number, difficulty: Difficulty): WordProblem[] {
  const problems: WordProblem[] = [];
  const templates = [
    // การออกแบบและสร้าง
    {
      question: (a: number, b: number) => 
        `สร้างสะพานใช้ไม้ ${a} แท่ง สร้างต่อเติมใช้ไม้เพิ่มอีก ${b} แท่ง ใช้ไม้ทั้งหมดกี่แท่ง`,
      answer: (a: number, b: number) => a + b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} + ${b} = ${ans} แท่ง (วัสดุรวม)`,
      symbolHint: (a: number, b: number) => `${a} + ${b} = ?`,
      conceptHint: () => "การออกแบบสะพาน คำนวณวัสดุรวม",
      unit: "แท่ง"
    },
    {
      question: (a: number, b: number) => 
        `มีอิฐก้อน ${a} ก้อน นำไปสร้างกำแพงใช้ ${b} ก้อน เหลืออิฐกี่ก้อน`,
      answer: (a: number, b: number) => a - b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} - ${b} = ${ans} ก้อน (อิฐคงเหลือ)`,
      symbolHint: (a: number, b: number) => `${a} - ${b} = ?`,
      conceptHint: () => "การสร้างโครงสร้าง คำนวณวัสดุคงเหลือ",
      unit: "ก้อน"
    },
    // การคำนวณขนาดและพื้นที่
    {
      question: (a: number, b: number) => 
        `กล่องยาว ${a} เซนติเมตร กว้าง ${b} เซนติเมตร ความยาวรอบกล่องเท่าไร`,
      answer: (a: number, b: number) => (a + b) * 2,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: (${a} + ${b}) × 2 = ${ans} เซนติเมตร (เส้นรอบรูป)`,
      symbolHint: (a: number, b: number) => `(${a} + ${b}) × 2 = ?`,
      conceptHint: () => "เส้นรอบรูปสี่เหลี่ยม = (ยาว + กว้าง) × 2",
      unit: "เซนติเมตร"
    },
    {
      question: (a: number, b: number) => 
        `ต้องการเชือกยาว ${a} เมตร มีเชือกอยู่แล้ว ${b} เมตร ต้องซื้อเพิ่มกี่เมตร`,
      answer: (a: number, b: number) => a - b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} - ${b} = ${ans} เมตร (ที่ต้องซื้อเพิ่ม)`,
      symbolHint: (a: number, b: number) => `${a} - ${b} = ?`,
      conceptHint: () => "การวางแผนวัสดุ = ที่ต้องการ - ที่มีอยู่",
      unit: "เมตร"
    },
    // เครื่องจักรอย่างง่ายและกลไก
    {
      question: (a: number, b: number) => 
        `รถเข็นมีล้อ ${a} ล้อ มีรถเข็น ${b} คัน มีล้อทั้งหมดกี่ล้อ`,
      answer: (a: number, b: number) => a * b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} × ${b} = ${ans} ล้อ (ล้อต่อคัน × จำนวนคัน)`,
      symbolHint: (a: number, b: number) => `${a} × ${b} = ?`,
      conceptHint: () => "เครื่องจักรอย่างง่าย คำนวณชิ้นส่วนทั้งหมด",
      unit: "ล้อ"
    },
    {
      question: (a: number, b: number) => 
        `เฟืองใหญ่หมุนได้ ${a} รอบ เฟืองเล็กหมุนมากกว่า ${b} รอบ เฟืองเล็กหมุนกี่รอบ`,
      answer: (a: number, b: number) => a + b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} + ${b} = ${ans} รอบ (การหมุนของเฟืองเล็ก)`,
      symbolHint: (a: number, b: number) => `${a} + ${b} = ?`,
      conceptHint: () => "กลไกเฟือง เฟืองเล็กหมุนเร็วกว่า",
      unit: "รอบ"
    },
    // โครงสร้างและความแข็งแรง
    {
      question: (a: number, b: number) => 
        `หอสูง ${a} เมตร ต้องการสร้างให้สูงขึ้นอีก ${b} เมตร หอจะสูงเท่าไร`,
      answer: (a: number, b: number) => a + b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} + ${b} = ${ans} เมตร (ความสูงรวม)`,
      symbolHint: (a: number, b: number) => `${a} + ${b} = ?`,
      conceptHint: () => "โครงสร้างแนวตั้ง คำนวณความสูงรวม",
      unit: "เมตร"
    },
    {
      question: (a: number, b: number) => 
        `เสารับน้ำหนักได้ ${a} กิโลกรัม วางของหนัก ${b} กิโลกรัม รับน้ำหนักได้อีกกี่กิโลกรัม`,
      answer: (a: number, b: number) => a - b,
      explanation: (a: number, b: number, ans: number) => 
        `วิธีทำ: ${a} - ${b} = ${ans} กิโลกรัม (น้ำหนักที่รับได้อีก)`,
      symbolHint: (a: number, b: number) => `${a} - ${b} = ?`,
      conceptHint: () => "ความแข็งแรงโครงสร้าง = รับได้ - ใช้ไปแล้ว",
      unit: "กิโลกรัม"
    }
  ];

  const maxValue = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 80 : 150;

  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    let a = Math.floor(Math.random() * maxValue) + 10;
    let b = Math.floor(Math.random() * (a / 2)) + 5;
    
    // สำหรับโจทย์คูณ ใช้ตัวเลขเล็กลง
    if (template.symbolHint(1, 1).includes('×')) {
      a = Math.floor(Math.random() * 6) + 2;
      b = Math.floor(Math.random() * 6) + 2;
    }
    
    const correctAnswer = template.answer(a, b);
    
    problems.push({
      id: `engineering-${i}`,
      category: 'engineering',
      difficulty,
      question: template.question(a, b),
      correctAnswer,
      unit: template.unit,
      choices: generateChoices(correctAnswer, difficulty),
      explanation: template.explanation(a, b, correctAnswer),
      symbolHint: template.symbolHint(a, b),
      conceptHint: template.conceptHint(),
    });
  }

  return problems;
}

// ฟังก์ชันสร้างโจทย์ตามหมวดและระดับ
export function generateWordProblems(
  category: ProblemCategory,
  difficulty: Difficulty,
  count: number
): WordProblem[] {
  switch (category) {
    case 'length':
      return generateLengthProblems(count, difficulty);
    case 'weight':
      return generateWeightProblems(count, difficulty);
    case 'volume':
      return generateVolumeProblems(count, difficulty);
    case 'time':
      return generateTimeProblems(count, difficulty);
    case 'science':
      return generateScienceProblems(count, difficulty);
    case 'engineering':
      return generateEngineeringProblems(count, difficulty);
    default:
      return [];
  }
}

// ฟังก์ชันคำนวณคะแนน
export function calculateScore(correctAnswers: number, totalQuestions: number): {
  percentage: number;
  stars: number;
  message: string;
} {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  let stars = 0;
  let message = '';
  
  if (percentage >= 90) {
    stars = 3;
    message = 'excellent';
  } else if (percentage >= 70) {
    stars = 2;
    message = 'good';
  } else if (percentage >= 50) {
    stars = 1;
    message = 'fair';
  } else {
    stars = 0;
    message = 'needPractice';
  }
  
  return { percentage, stars, message };
}
