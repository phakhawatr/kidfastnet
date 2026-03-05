import { appRegistry } from '@/config/appRegistry';

export interface AppRecommendation {
  key: string;
  name: string;
  icon: string;
  color: string;
  link: string;
}

const keywordToApps: Record<string, string[]> = {
  // Addition
  'บวก': ['addition'],
  'addition': ['addition'],
  'รวม': ['addition'],
  'ผลบวก': ['addition'],
  'ผลรวม': ['addition'],
  
  // Subtraction
  'ลบ': ['subtraction'],
  'subtraction': ['subtraction'],
  'ผลลบ': ['subtraction'],
  'ผลต่าง': ['subtraction'],
  
  // Multiplication
  'คูณ': ['multiplication', 'multiplication-table', 'flower-math'],
  'multiplication': ['multiplication', 'multiplication-table'],
  'สูตรคูณ': ['multiplication-table'],
  'ผลคูณ': ['multiplication'],
  
  // Division
  'หาร': ['division'],
  'division': ['division'],
  'ผลหาร': ['division'],
  
  // Fractions
  'เศษส่วน': ['fraction-matching', 'fraction-shapes'],
  'fraction': ['fraction-matching', 'fraction-shapes'],
  
  // Time
  'เวลา': ['time'],
  'นาฬิกา': ['time'],
  'time': ['time'],
  'clock': ['time'],
  'ชั่วโมง': ['time'],
  
  // Money
  'เงิน': ['money'],
  'money': ['money'],
  'บาท': ['money'],
  'สตางค์': ['money'],
  'เหรียญ': ['money'],
  'ธนบัตร': ['money'],
  
  // Weighing
  'ชั่ง': ['weighing'],
  'น้ำหนัก': ['weighing'],
  'weighing': ['weighing'],
  'กิโลกรัม': ['weighing'],
  
  // Measurement
  'วัด': ['measurement', 'length-comparison'],
  'measurement': ['measurement'],
  'ความยาว': ['measurement', 'length-comparison'],
  'เซนติเมตร': ['measurement'],
  'เมตร': ['measurement'],
  
  // Shapes
  'รูปทรง': ['shape-matching', 'shape-series'],
  'shape': ['shape-matching', 'shape-series'],
  'รูปเรขาคณิต': ['shape-matching', 'shape-series'],
  'สามเหลี่ยม': ['shape-matching'],
  'สี่เหลี่ยม': ['shape-matching'],
  'วงกลม': ['shape-matching'],
  
  // Place Value
  'ค่าประจำหลัก': ['place-value'],
  'place value': ['place-value'],
  'หลักหน่วย': ['place-value'],
  'หลักสิบ': ['place-value'],
  'หลักร้อย': ['place-value'],
  
  // Word Problems
  'โจทย์ปัญหา': ['word-problems'],
  'word problem': ['word-problems'],
  
  // Number operations
  'จำนวน': ['number-series', 'number-bonds'],
  'number': ['number-series'],
  'อนุกรม': ['number-series'],
  'ลำดับ': ['number-series'],
  
  // Mental math
  'คิดเร็ว': ['quick-math', 'mental-math'],
  'คิดในใจ': ['mental-math'],
  'mental math': ['mental-math'],
  
  // Percentage
  'เปอร์เซ็นต์': ['percentage'],
  'ร้อยละ': ['percentage'],
  'percent': ['percentage'],
  
  // Counting
  'นับ': ['counting-challenge', 'fruit-counting', 'board-counting'],
  'counting': ['counting-challenge'],
  'เปรียบเทียบ': ['compare-stars'],
  'มากกว่า': ['compare-stars'],
  'น้อยกว่า': ['compare-stars'],
};

// Thai display names for apps
const appDisplayNames: Record<string, string> = {
  'addition': 'การบวก',
  'subtraction': 'การลบ',
  'multiplication': 'การคูณ',
  'multiplication-table': 'สูตรคูณ',
  'division': 'การหาร',
  'fraction-matching': 'จับคู่เศษส่วน',
  'fraction-shapes': 'เศษส่วนรูปทรง',
  'time': 'บอกเวลา',
  'money': 'เรื่องเงิน',
  'weighing': 'การชั่ง',
  'measurement': 'การวัด',
  'length-comparison': 'เปรียบเทียบความยาว',
  'shape-matching': 'จับคู่รูปทรง',
  'shape-series': 'อนุกรมรูปทรง',
  'place-value': 'ค่าประจำหลัก',
  'word-problems': 'โจทย์ปัญหา',
  'number-series': 'อนุกรมจำนวน',
  'number-bonds': 'พันธะตัวเลข',
  'quick-math': 'คิดเร็ว',
  'mental-math': 'คิดในใจ',
  'percentage': 'ร้อยละ',
  'counting-challenge': 'นับจำนวน',
  'fruit-counting': 'นับผลไม้',
  'board-counting': 'นับบนกระดาน',
  'compare-stars': 'เปรียบเทียบ',
  'flower-math': 'ดอกไม้คณิต',
  'sum-grid-puzzles': 'ปริศนาตาราง',
  'bar-model': 'แผนภาพแท่ง',
  'area-model': 'แผนภาพพื้นที่',
  'mixed-math': 'คณิตรวม',
  'balloon-math': 'บอลลูนคณิต',
};

export function getRecommendedApps(content: string): AppRecommendation[] {
  const lowerContent = content.toLowerCase();
  const matchedAppKeys = new Set<string>();

  for (const [keyword, appKeys] of Object.entries(keywordToApps)) {
    if (lowerContent.includes(keyword.toLowerCase())) {
      appKeys.forEach(key => matchedAppKeys.add(key));
    }
  }

  // Limit to 4 recommendations max
  const recommendations: AppRecommendation[] = [];
  for (const key of matchedAppKeys) {
    if (recommendations.length >= 4) break;
    const app = appRegistry[key];
    if (app) {
      recommendations.push({
        key,
        name: appDisplayNames[key] || key,
        icon: app.icon,
        color: app.color,
        link: app.link,
      });
    }
  }

  return recommendations;
}
