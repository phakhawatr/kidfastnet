// Utility to convert text to proper Thai pronunciation for text-to-speech

const thaiNumbers = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];

/**
 * Convert a number to Thai words
 */
export function numberToThai(num: number): string {
  if (num === 0) return 'ศูนย์';
  
  const parts: string[] = [];
  
  // Handle millions
  if (num >= 1000000) {
    const millions = Math.floor(num / 1000000);
    parts.push(numberToThaiUnder1000000(millions));
    parts.push('ล้าน');
    num %= 1000000;
  }
  
  // Handle hundred thousands and below
  if (num > 0) {
    parts.push(numberToThaiUnder1000000(num));
  }
  
  return parts.join('');
}

function numberToThaiUnder1000000(num: number): string {
  if (num === 0) return '';
  
  const parts: string[] = [];
  
  // Handle hundred thousands
  if (num >= 100000) {
    const hundredThousands = Math.floor(num / 100000);
    parts.push(thaiNumbers[hundredThousands]);
    parts.push('แสน');
    num %= 100000;
  }
  
  // Handle ten thousands
  if (num >= 10000) {
    const tenThousands = Math.floor(num / 10000);
    if (tenThousands === 2) {
      parts.push('สอง');
    } else {
      parts.push(thaiNumbers[tenThousands]);
    }
    parts.push('หมื่น');
    num %= 10000;
  }
  
  // Handle thousands
  if (num >= 1000) {
    const thousands = Math.floor(num / 1000);
    if (thousands > 1) {
      parts.push(thaiNumbers[thousands]);
    }
    parts.push('พัน');
    num %= 1000;
  }
  
  // Handle hundreds
  if (num >= 100) {
    const hundreds = Math.floor(num / 100);
    if (hundreds > 1) {
      parts.push(thaiNumbers[hundreds]);
    }
    parts.push('ร้อย');
    num %= 100;
  }
  
  // Handle tens
  if (num >= 20) {
    const tens = Math.floor(num / 10);
    if (tens === 2) {
      parts.push('ยี่สิบ');
    } else {
      parts.push(thaiNumbers[tens]);
      parts.push('สิบ');
    }
    num %= 10;
  } else if (num >= 10) {
    parts.push('สิบ');
    num %= 10;
  }
  
  // Handle ones
  if (num > 0) {
    if (parts.length > 0 && num === 1) {
      parts.push('เอ็ด');
    } else {
      parts.push(thaiNumbers[num]);
    }
  }
  
  return parts.join('');
}

/**
 * Convert fraction notation to Thai words
 */
function fractionToThai(fraction: string): string {
  const match = fraction.match(/^(\d+)\/(\d+)$/);
  if (!match) return fraction;
  
  const [, numerator, denominator] = match;
  const numTop = parseInt(numerator);
  const numBottom = parseInt(denominator);
  
  return `${numberToThai(numTop)}ส่วน${numberToThai(numBottom)}`;
}

/**
 * Convert mathematical symbols to Thai words
 */
function convertMathSymbols(text: string): string {
  return text
    .replace(/\s*\+\s*/g, ' บวก ')
    .replace(/\s*-\s*/g, ' ลบ ')
    .replace(/\s*[×x]\s*/g, ' คูณ ')
    .replace(/\s*[÷/]\s*/g, ' หาร ')
    .replace(/\s*=\s*/g, ' เท่ากับ ')
    .replace(/\s*>\s*/g, ' มากกว่า ')
    .replace(/\s*<\s*/g, ' น้อยกว่า ')
    .replace(/\s*≥\s*/g, ' มากกว่าหรือเท่ากับ ')
    .replace(/\s*≤\s*/g, ' น้อยกว่าหรือเท่ากับ ');
}

/**
 * Convert placeholders to Thai words
 */
function convertPlaceholders(text: string): string {
  return text
    .replace(/___+/g, 'จุดจุดจุด')
    .replace(/__/g, 'จุดจุดจุด')
    .replace(/\.\.\./g, 'จุดจุดจุด');
}

/**
 * Convert unit abbreviations to full Thai words
 */
function convertUnits(text: string): string {
  return text
    .replace(/\bml\b/gi, 'มิลลิลิตร')
    .replace(/\bl\b/gi, 'ลิตร')
    .replace(/\bkg\b/gi, 'กิโลกรัม')
    .replace(/\bg\b/gi, 'กรัม')
    .replace(/\bm\b/gi, 'เมตร')
    .replace(/\bcm\b/gi, 'เซนติเมตร')
    .replace(/\bmm\b/gi, 'มิลลิเมตร')
    .replace(/\bkm\b/gi, 'กิโลเมตร');
}

/**
 * Main function to convert text to Thai speech format
 */
export function convertToThaiSpeech(text: string): string {
  if (!text) return '';
  
  let result = text;
  
  // Remove shape markers and visual elements
  result = result
    .replace(/\[shapes:.*?\]/g, '')
    .replace(/\[(triangle|square|circle)-(red|blue|green|orange|yellow|sky)\]/g, '')
    .trim();
  
  // Convert fractions first (before number conversion)
  result = result.replace(/\d+\/\d+/g, (match) => fractionToThai(match));
  
  // Convert numbers to Thai words
  result = result.replace(/\d+/g, (match) => {
    const num = parseInt(match);
    return numberToThai(num);
  });
  
  // Convert mathematical symbols
  result = convertMathSymbols(result);
  
  // Convert placeholders
  result = convertPlaceholders(result);
  
  // Convert units
  result = convertUnits(result);
  
  // Clean up extra spaces
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}
