import { AssessmentQuestion } from './assessmentUtils';

const randInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// ========= NT COUNTING & PATTERNS GENERATORS =========

export const generateNTCountingQuestions = (count: number): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const questionTypes = [
    'compare_from_table',
    'number_patterns',
    'place_value',
    'ordering',
    'word_problems'
  ];

  for (let i = 0; i < count; i++) {
    const type = questionTypes[i % questionTypes.length];
    let question = '';
    let correctAnswer: string = '';
    let choices: string[] = [];
    let explanation = '';
    let imagePrompt = '';
    const points = i < 3 ? 3 : 4; // First 3 questions = 3 points, rest = 4 points

    switch (type) {
      case 'compare_from_table': {
        const provinces = ['กรุงเทพฯ', 'เชียงใหม่', 'ภูเก็ต', 'ขอนแก่น', 'สงขลา'];
        const selectedProvinces = shuffleArray(provinces).slice(0, 4);
        const cases = selectedProvinces.map(() => randInt(3000, 9000));
        const maxIndex = cases.indexOf(Math.max(...cases));
        
        question = `จากตารางแสดงจำนวนนักท่องเที่ยวในแต่ละจังหวัด\n\n`;
        selectedProvinces.forEach((prov, idx) => {
          question += `${prov}: ${cases[idx].toLocaleString()} คน\n`;
        });
        question += `\nจังหวัดใดมีนักท่องเที่ยวมากที่สุด?`;
        
        correctAnswer = selectedProvinces[maxIndex];
        choices = shuffleArray(selectedProvinces);
        explanation = `${correctAnswer} มีนักท่องเที่ยว ${cases[maxIndex].toLocaleString()} คน ซึ่งมากที่สุด`;
        imagePrompt = `📊 ตารางข้อมูลสีฟ้าพาสเทล พื้นหลังขาว แสดงสถิติจังหวัดไทย 4 แห่ง กับจำนวนนักท่องเที่ยว ออกแบบสไตล์การ์ตูน`;
        break;
      }

      case 'number_patterns': {
        const start = randInt(3, 10);
        const step = [5, 7, 9, 11][randInt(0, 3)];
        const sequence = Array.from({ length: 4 }, (_, i) => start + step * i);
        const missing = start + step * 4;
        
        question = `จากแบบรูปของจำนวน: ${sequence.join(', ')}, ___\n\nจำนวนที่เหมาะสมในช่องว่างคือเท่าใด?`;
        correctAnswer = missing.toString();
        choices = shuffleArray([
          missing.toString(),
          (missing + 1).toString(),
          (missing - 1).toString(),
          (missing + step).toString()
        ]);
        explanation = `แบบรูปเพิ่มทีละ ${step} → ${sequence.join(', ')}, ${missing}`;
        imagePrompt = `🔢 ตัวเลขสีสันสดใสบนพื้นหลังอ่อน แสดงแบบรูปตัวเลขที่เพิ่มขึ้นทีละเท่าๆ กัน สไตล์น่ารักสำหรับเด็ก`;
        break;
      }

      case 'place_value': {
        const num = randInt(1000, 9999);
        const digits = num.toString().split('').map(Number);
        const placeNames = ['หลักพัน', 'หลักร้อย', 'หลักสิบ', 'หลักหน่วย'];
        const selectedPlace = randInt(0, 3);
        
        question = `จำนวน ${num.toLocaleString()} มีค่าประจำ${placeNames[selectedPlace]}เท่าใด?`;
        correctAnswer = (digits[selectedPlace] * Math.pow(10, 3 - selectedPlace)).toString();
        
        const wrongAnswers = [
          digits[selectedPlace].toString(),
          (digits[selectedPlace] * Math.pow(10, 3 - selectedPlace) + 100).toString(),
          (digits[selectedPlace] * Math.pow(10, 3 - selectedPlace) - 100).toString()
        ];
        choices = shuffleArray([correctAnswer, ...wrongAnswers.slice(0, 3)]);
        
        explanation = `${placeNames[selectedPlace]}ของ ${num.toLocaleString()} คือ ${correctAnswer}`;
        imagePrompt = `🏛️ บล็อกตัวเลขแบ่งเป็นหลักพัน-ร้อย-สิบ-หน่วย สีสันสดใสสไตล์การ์ตูน`;
        break;
      }

      case 'ordering': {
        const numbers = Array.from({ length: 4 }, () => randInt(1000, 9999));
        const sorted = [...numbers].sort((a, b) => b - a);
        
        question = `เรียงจำนวนต่อไปนี้จากมากไปน้อย: ${shuffleArray([...numbers]).join(', ')}`;
        correctAnswer = sorted.join(', ');
        
        const wrongOrders = [
          [...numbers].sort((a, b) => a - b).join(', '), // น้อยไปมาก
          shuffleArray([...numbers]).join(', '), // สุ่ม
          numbers.join(', ') // ตามลำดับเดิม
        ];
        choices = shuffleArray([correctAnswer, ...wrongOrders.slice(0, 3)]);
        
        explanation = `เรียงจากมากไปน้อย: ${correctAnswer}`;
        imagePrompt = `📏 ตัวเลขเรียงลำดับบนเส้นจำนวน สีฟ้าและเขียวอ่อน สไตล์การ์ตูน`;
        break;
      }

      case 'word_problems': {
        const students = randInt(120, 280);
        const perBus = 45;
        const buses = Math.ceil(students / perBus);
        
        question = `โรงเรียนมีนักเรียน ${students} คน จะไปทัศนศึกษา\nรถบัสแต่ละคันจุได้ ${perBus} คน\nต้องใช้รถบัสกี่คัน?`;
        correctAnswer = buses.toString();
        
        choices = shuffleArray([
          buses.toString(),
          (buses - 1).toString(),
          (buses + 1).toString(),
          Math.floor(students / perBus).toString()
        ]);
        
        explanation = `${students} ÷ ${perBus} = ${(students / perBus).toFixed(2)} → ต้องใช้ ${buses} คัน`;
        imagePrompt = `🚌 รถบัสสีเหลืองน่ารัก เด็กนักเรียนยืนรอขึ้นรถ พื้นหลังท้องฟ้าสดใส สไตล์การ์ตูนญี่ปุ่น`;
        break;
      }
    }

    questions.push({
      id: `nt_counting_${Date.now()}_${i}`,
      skill: 'counting',
      question,
      correctAnswer,
      choices,
      difficulty: 'medium',
      explanation,
      imagePrompt
    });
  }

  return questions;
};

// ========= NT FRACTIONS GENERATORS =========

export const generateNTFractionsQuestions = (count: number): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const questionTypes = [
    'compare_with_pictures',
    'equivalent_fractions',
    'add_same_denominator',
    'subtract_same_denominator',
    'word_problems',
    'mixed_operations'
  ];

  for (let i = 0; i < count; i++) {
    const type = questionTypes[i % questionTypes.length];
    let question = '';
    let correctAnswer: string = '';
    let choices: string[] = [];
    let explanation = '';
    let imagePrompt = '';
    const points = i < 4 ? 3 : 4;

    switch (type) {
      case 'compare_with_pictures': {
        const fractions = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]];
        const [f1, f2] = shuffleArray(fractions).slice(0, 2);
        const val1 = f1[0] / f1[1];
        const val2 = f2[0] / f2[1];
        
        question = `เปรียบเทียบเศษส่วน ${f1[0]}/${f1[1]} กับ ${f2[0]}/${f2[1]}\nเศษส่วนใดมีค่ามากกว่า?`;
        correctAnswer = val1 > val2 ? `${f1[0]}/${f1[1]}` : `${f2[0]}/${f2[1]}`;
        
        choices = shuffleArray([
          `${f1[0]}/${f1[1]}`,
          `${f2[0]}/${f2[1]}`,
          'เท่ากัน',
          'ไม่สามารถเปรียบเทียบได้'
        ]);
        
        explanation = `${f1[0]}/${f1[1]} = ${val1.toFixed(2)}, ${f2[0]}/${f2[1]} = ${val2.toFixed(2)} → ${correctAnswer} มากกว่า`;
        imagePrompt = `🍕 พิซซ่าวงกลมสองจาน แบ่งเป็นชิ้นตามเศษส่วน ระบายสีส่วนที่มี สีสันสดใส สไตล์การ์ตูน`;
        break;
      }

      case 'equivalent_fractions': {
        const num = randInt(1, 3);
        const den = randInt(2, 6);
        const multiplier = randInt(2, 4);
        const newNum = num * multiplier;
        const newDen = den * multiplier;
        
        question = `เศษส่วนใดมีค่าเท่ากับ ${num}/${den}?`;
        correctAnswer = `${newNum}/${newDen}`;
        
        choices = shuffleArray([
          `${newNum}/${newDen}`,
          `${newNum + 1}/${newDen}`,
          `${newNum}/${newDen + 1}`,
          `${num + 1}/${den + 1}`
        ]);
        
        explanation = `${num}/${den} × ${multiplier}/${multiplier} = ${newNum}/${newDen}`;
        imagePrompt = `🟦 บล็อกสี่เหลี่ยมแบ่งส่วนเท่าๆ กัน แสดงเศษส่วนที่เท่ากัน สองรูป สีฟ้าและเขียว สไตล์การศึกษา`;
        break;
      }

      case 'add_same_denominator': {
        const den = [4, 6, 8][randInt(0, 2)];
        const num1 = randInt(1, Math.floor(den / 2));
        const num2 = randInt(1, Math.floor(den / 2));
        const sum = num1 + num2;
        
        question = `${num1}/${den} + ${num2}/${den} = ?`;
        correctAnswer = sum < den ? `${sum}/${den}` : `${Math.floor(sum / den)} ${sum % den}/${den}`;
        
        choices = shuffleArray([
          correctAnswer,
          `${num1 + num2}/${den + den}`,
          `${sum}/${den * 2}`,
          `${sum + 1}/${den}`
        ]);
        
        explanation = `${num1}/${den} + ${num2}/${den} = ${sum}/${den}` + (sum >= den ? ` = ${correctAnswer}` : '');
        imagePrompt = `🧁 คัพเค้กน่ารักสองชิ้นบนจาน แต่ละชิ้นแบ่งส่วนเท่าๆ กัน สไตล์การ์ตูนน่ารัก`;
        break;
      }

      case 'subtract_same_denominator': {
        const den = [4, 6, 8][randInt(0, 2)];
        const num1 = randInt(3, den - 1);
        const num2 = randInt(1, num1 - 1);
        const diff = num1 - num2;
        
        question = `${num1}/${den} - ${num2}/${den} = ?`;
        correctAnswer = `${diff}/${den}`;
        
        choices = shuffleArray([
          correctAnswer,
          `${num1 - num2}/${den - den}`,
          `${diff}/${den * 2}`,
          `${diff + 1}/${den}`
        ]);
        
        explanation = `${num1}/${den} - ${num2}/${den} = ${diff}/${den}`;
        imagePrompt = `🍰 เค้กวงกลมหั้น แสดงการลบเศษส่วน สีชมพูและม่วงอ่อน สไตล์การ์ตูน`;
        break;
      }

      case 'word_problems': {
        const total = 8;
        const ate = randInt(2, 5);
        const left = total - ate;
        
        question = `แม่ทำขนมปัง ${total} ชิ้น\nน้องกินไป ${ate} ชิ้น\nเหลือเศษส่วนเท่าใด?`;
        correctAnswer = `${left}/${total}`;
        
        choices = shuffleArray([
          correctAnswer,
          `${ate}/${total}`,
          `${left}/${ate}`,
          `${total - ate}/${ate}`
        ]);
        
        explanation = `เหลือ ${left} จาก ${total} ชิ้น = ${left}/${total}`;
        imagePrompt = `🍞 ขนมปังน่ารักบนจานสีฟ้า บางชิ้นถูกกินไปแล้ว สไตล์การ์ตูนญี่ปุ่น`;
        break;
      }

      case 'mixed_operations': {
        const den = 6;
        const a = randInt(1, 2);
        const b = randInt(1, 2);
        const c = randInt(1, 2);
        const result = a + b - c;
        
        question = `${a}/${den} + ${b}/${den} - ${c}/${den} = ?`;
        correctAnswer = `${result}/${den}`;
        
        choices = shuffleArray([
          correctAnswer,
          `${a + b + c}/${den}`,
          `${result}/${den * 2}`,
          `${result + 1}/${den}`
        ]);
        
        explanation = `${a}/${den} + ${b}/${den} - ${c}/${den} = ${result}/${den}`;
        imagePrompt = `🎯 แผนภูมิวงกลมแสดงการบวกลบเศษส่วน สีสันสดใส สไตล์การศึกษา`;
        break;
      }
    }

    questions.push({
      id: `nt_fractions_${Date.now()}_${i}`,
      skill: 'fractions',
      question,
      correctAnswer,
      choices,
      difficulty: 'medium',
      explanation,
      imagePrompt
    });
  }

  return questions;
};

// ========= NT MONEY GENERATORS =========

export const generateNTMoneyQuestions = (count: number): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const questionTypes = [
    'count_money_pictures',
    'making_change',
    'shopping_problems',
    'budgeting'
  ];

  for (let i = 0; i < count; i++) {
    const type = questionTypes[i % questionTypes.length];
    let question = '';
    let correctAnswer: string = '';
    let choices: string[] = [];
    let explanation = '';
    let imagePrompt = '';
    const points = i === 0 ? 3 : 4;

    switch (type) {
      case 'count_money_pictures': {
        const bills = [
          { value: 100, count: randInt(1, 3) },
          { value: 50, count: randInt(0, 2) },
          { value: 20, count: randInt(1, 4) }
        ];
        const coins = [
          { value: 10, count: randInt(2, 5) },
          { value: 5, count: randInt(0, 3) },
          { value: 1, count: randInt(0, 4) }
        ];
        
        const total = bills.reduce((sum, b) => sum + b.value * b.count, 0) +
                      coins.reduce((sum, c) => sum + c.value * c.count, 0);
        
        question = `จากภาพเงิน มีเงินทั้งหมดเท่าใด?\n\n`;
        bills.forEach(b => {
          if (b.count > 0) question += `💵 ธนบัตร ${b.value} บาท ${b.count} ใบ\n`;
        });
        coins.forEach(c => {
          if (c.count > 0) question += `🪙 เหรียญ ${c.value} บาท ${c.count} เหรียญ\n`;
        });
        
        correctAnswer = `${total} บาท`;
        choices = shuffleArray([
          `${total} บาท`,
          `${total + 10} บาท`,
          `${total - 5} บาท`,
          `${total + 20} บาท`
        ]);
        
        explanation = `รวมเงินทั้งหมด = ${total} บาท`;
        imagePrompt = `💰 ธนบัตรไทยและเหรียญบาทวางเรียงบนพื้นหลังสีเขียวอ่อน สวยงามเป็นระเบียบ สไตล์ภาพถ่ายสไตล์การ์ตูน`;
        break;
      }

      case 'making_change': {
        const price = randInt(35, 85);
        const paid = 100;
        const change = paid - price;
        
        question = `ซื้อของราคา ${price} บาท\nจ่ายด้วยธนบัตร 100 บาท\nได้เงินทอนกี่บาท?`;
        correctAnswer = `${change} บาท`;
        
        choices = shuffleArray([
          `${change} บาท`,
          `${change + 5} บาท`,
          `${change - 5} บาท`,
          `${paid - price - 10} บาท`
        ]);
        
        explanation = `100 - ${price} = ${change} บาท`;
        imagePrompt = `🏪 ร้านขายของเล็กๆ ลูกค้ากำลังจ่ายเงิน พนักงานทอนเงิน สไตล์การ์ตูนน่ารัก`;
        break;
      }

      case 'shopping_problems': {
        const items = [
          { name: 'ปากกา', price: randInt(10, 20) },
          { name: 'สมุด', price: randInt(15, 25) },
          { name: 'ยางลบ', price: randInt(5, 10) }
        ];
        const total = items.reduce((sum, item) => sum + item.price, 0);
        
        question = `ซื้อของ 3 อย่าง:\n`;
        items.forEach(item => {
          question += `- ${item.name} ${item.price} บาท\n`;
        });
        question += `\nรวมเงินทั้งหมดเท่าใด?`;
        
        correctAnswer = `${total} บาท`;
        choices = shuffleArray([
          `${total} บาท`,
          `${total + 5} บาท`,
          `${total - 5} บาท`,
          `${total + 10} บาท`
        ]);
        
        explanation = `${items.map(i => i.price).join(' + ')} = ${total} บาท`;
        imagePrompt = `🛒 ตะกร้าช้อปปิ้งใส่เครื่องเขียน ปากกา สมุด ยางลบ บนพื้นหลังสีชมพูอ่อน สไตล์การ์ตูน`;
        break;
      }

      case 'budgeting': {
        const budget = 200;
        const spent = randInt(120, 170);
        const left = budget - spent;
        
        question = `มีเงิน ${budget} บาท\nซื้อของใช้ไป ${spent} บาท\nเหลือเงินกี่บาท?`;
        correctAnswer = `${left} บาท`;
        
        choices = shuffleArray([
          `${left} บาท`,
          `${left + 10} บาท`,
          `${left - 10} บาท`,
          `${budget - spent + 20} บาท`
        ]);
        
        explanation = `${budget} - ${spent} = ${left} บาท`;
        imagePrompt = `💵 กระเป๋าสตางค์เปิดแสดงธนบัตรไทย บนพื้นหลังสีฟ้าอ่อน สไตล์การ์ตูนน่ารัก`;
        break;
      }
    }

    questions.push({
      id: `nt_money_${Date.now()}_${i}`,
      skill: 'money',
      question,
      correctAnswer,
      choices,
      difficulty: 'medium',
      explanation,
      imagePrompt
    });
  }

  return questions;
};

// ========= NT TIME GENERATORS =========

export const generateNTTimeQuestions = (count: number): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const questionTypes = ['read_clock', 'time_duration', 'schedules', 'word_problems'];

  for (let i = 0; i < count; i++) {
    const type = questionTypes[i % questionTypes.length];
    let question = '';
    let correctAnswer: string = '';
    let choices: string[] = [];
    let explanation = '';
    let imagePrompt = '';
    const points = i < 2 ? 3 : 4;

    switch (type) {
      case 'read_clock': {
        const hour = randInt(1, 12);
        const minute = [0, 15, 30, 45][randInt(0, 3)];
        const minuteText = minute === 0 ? 'นาฬิกา' : minute === 15 ? 'นาฬิกา 15 นาที' : minute === 30 ? 'นาฬิกาครึ่ง' : 'นาฬิกา 45 นาที';
        
        question = `นาฬิกาแสดงเวลาเท่าใด?`;
        correctAnswer = minute === 0 ? `${hour} นาฬิกา` : `${hour} ${minuteText}`;
        
        const wrongHours = [hour + 1, hour - 1, hour + 2].filter(h => h >= 1 && h <= 12);
        choices = shuffleArray([
          correctAnswer,
          `${wrongHours[0]} ${minuteText}`,
          `${hour} นาฬิกา ${(minute + 15) % 60} นาที`,
          `${wrongHours[1]} นาฬิกา`
        ].filter(Boolean));
        
        explanation = `นาฬิกาแสดงเวลา ${correctAnswer}`;
        imagePrompt = `🕐 นาฬิกาแบบเข็มสีฟ้า หน้าปัดขาวสะอาด แสดงเวลา ${hour}:${minute.toString().padStart(2, '0')} สไตล์การ์ตูนน่ารัก`;
        
        // Add clock display data
        questions.push({
          id: `nt_time_${Date.now()}_${i}`,
          skill: 'time',
          question,
          correctAnswer,
          choices,
          difficulty: 'medium',
          explanation,
          imagePrompt,
          clockDisplay: { hour, minute }
        });
        continue;
      }

      case 'time_duration': {
        const startHour = randInt(8, 14);
        const duration = [1, 2, 3][randInt(0, 2)];
        const endHour = startHour + duration;
        
        question = `เริ่มทำการบ้านเวลา ${startHour} นาฬิกา\nเสร็จเวลา ${endHour} นาฬิกา\nใช้เวลานานกี่ชั่วโมง?`;
        correctAnswer = `${duration} ชั่วโมง`;
        
        choices = shuffleArray([
          `${duration} ชั่วโมง`,
          `${duration + 1} ชั่วโมง`,
          `${duration - 1} ชั่วโมง`,
          `${endHour} ชั่วโมง`
        ]);
        
        explanation = `${endHour} - ${startHour} = ${duration} ชั่วโมง`;
        imagePrompt = `📚 เด็กนั่งทำการบ้าน นาฬิกาบนโต๊ะ สไตล์การ์ตูนญี่ปุ่นน่ารัก`;
        break;
      }

      case 'schedules': {
        const activities = [
          { name: 'คณิตศาสตร์', time: '08:00' },
          { name: 'ภาษาไทย', time: '09:30' },
          { name: 'พักเบรก', time: '10:30' },
          { name: 'วิทยาศาสตร์', time: '11:00' }
        ];
        
        const selectedActivity = activities[randInt(0, 3)];
        question = `จากตารางเรียน\n\n`;
        activities.forEach(act => {
          question += `${act.time} - ${act.name}\n`;
        });
        question += `\nเรียนวิชา${selectedActivity.name}เวลาใด?`;
        
        correctAnswer = selectedActivity.time;
        choices = shuffleArray(activities.map(a => a.time));
        
        explanation = `เรียน${selectedActivity.name}เวลา ${selectedActivity.time}`;
        imagePrompt = `📅 ตารางเรียนสีสันสดใส แสดงรายวิชาและเวลา สไตล์การ์ตูนน่ารัก`;
        break;
      }

      case 'word_problems': {
        const movieStart = randInt(13, 16);
        const movieDuration = [90, 120, 150][randInt(0, 2)];
        const movieEndHour = movieStart + Math.floor(movieDuration / 60);
        const movieEndMinute = movieDuration % 60;
        
        question = `ดูหนังเริ่ม ${movieStart}:00 น.\nฉายยาว ${movieDuration} นาที\nจบกี่โมง?`;
        correctAnswer = movieEndMinute === 0 ? `${movieEndHour}:00 น.` : `${movieEndHour}:${movieEndMinute.toString().padStart(2, '0')} น.`;
        
        choices = shuffleArray([
          correctAnswer,
          `${movieEndHour + 1}:00 น.`,
          `${movieEndHour}:${((movieEndMinute + 30) % 60).toString().padStart(2, '0')} น.`,
          `${movieStart + 2}:00 น.`
        ]);
        
        explanation = `${movieStart}:00 + ${movieDuration} นาที = ${correctAnswer}`;
        imagePrompt = `🎬 โรงภาพยนตร์ จอใหญ่ ที่นั่งแดง สไตล์การ์ตูนน่ารัก`;
        break;
      }
    }

    questions.push({
      id: `nt_time_${Date.now()}_${i}`,
      skill: 'time',
      question,
      correctAnswer,
      choices,
      difficulty: 'medium',
      explanation,
      imagePrompt
    });
  }

  return questions;
};

// ========= NT MEASUREMENT GENERATORS =========

export const generateNTMeasurementQuestions = (count: number): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const questionTypes = ['length_comparison', 'unit_conversion', 'perimeter', 'word_problems'];

  for (let i = 0; i < count; i++) {
    const type = questionTypes[i % questionTypes.length];
    let question = '';
    let correctAnswer: string = '';
    let choices: string[] = [];
    let explanation = '';
    let imagePrompt = '';
    const points = i < 2 ? 3 : 4;

    switch (type) {
      case 'length_comparison': {
        const objects = [
          { name: 'ดินสอ', length: randInt(15, 20) },
          { name: 'ไม้บรรทัด', length: 30 },
          { name: 'ยางลบ', length: randInt(5, 8) }
        ];
        const longest = objects.reduce((max, obj) => obj.length > max.length ? obj : max);
        
        question = `วัดความยาว:\n`;
        objects.forEach(obj => {
          question += `${obj.name}: ${obj.length} ซม.\n`;
        });
        question += `\nสิ่งใดยาวที่สุด?`;
        
        correctAnswer = longest.name;
        choices = shuffleArray(objects.map(o => o.name));
        
        explanation = `${longest.name} ยาว ${longest.length} ซม. ยาวที่สุด`;
        imagePrompt = `📏 เครื่องเขียนวางเรียงบนโต๊ะ มีไม้บรรทัดวัด สไตล์การ์ตูนน่ารัก`;
        break;
      }

      case 'unit_conversion': {
        const meters = randInt(2, 8);
        const cm = meters * 100;
        
        question = `${meters} เมตร เท่ากับกี่เซนติเมตร?`;
        correctAnswer = `${cm} เซนติเมตร`;
        
        choices = shuffleArray([
          `${cm} เซนติเมตร`,
          `${meters * 10} เซนติเมตร`,
          `${meters * 1000} เซนติเมตร`,
          `${cm + 10} เซนติเมตร`
        ]);
        
        explanation = `1 เมตร = 100 ซม. → ${meters} เมตร = ${cm} ซม.`;
        imagePrompt = `📐 เส้นวัดความยาว แสดงเมตรและเซนติเมตร สีฟ้าและเหลือง สไตล์การศึกษา`;
        break;
      }

      case 'perimeter': {
        const length = randInt(5, 10);
        const width = randInt(3, 7);
        const perimeter = 2 * (length + width);
        
        question = `สี่เหลี่ยมผืนผ้า\nยาว ${length} ซม. กว้าง ${width} ซม.\nรอบรูปเท่าใด?`;
        correctAnswer = `${perimeter} เซนติเมตร`;
        
        choices = shuffleArray([
          `${perimeter} เซนติเมตร`,
          `${length + width} เซนติเมตร`,
          `${length * width} เซนติเมตร`,
          `${perimeter + 2} เซนติเมตร`
        ]);
        
        explanation = `รอบรูป = 2 × (${length} + ${width}) = ${perimeter} ซม.`;
        imagePrompt = `▭ สี่เหลี่ยมผืนผ้าสีฟ้าอ่อน มีขนาดระบุด้านยาวและกว้าง สไตล์การศึกษา`;
        break;
      }

      case 'word_problems': {
        const ribbon = randInt(120, 180);
        const pieces = randInt(3, 5);
        const each = Math.floor(ribbon / pieces);
        
        question = `ริบบิ้นยาว ${ribbon} ซม.\nตัดเป็น ${pieces} ท่อนเท่าๆ กัน\nแต่ละท่อนยาวกี่เซนติเมตร?`;
        correctAnswer = `${each} เซนติเมตร`;
        
        choices = shuffleArray([
          `${each} เซนติเมตร`,
          `${each + 5} เซนติเมตร`,
          `${each - 5} เซนติเมตร`,
          `${ribbon - pieces} เซนติเมตร`
        ]);
        
        explanation = `${ribbon} ÷ ${pieces} = ${each} ซม.`;
        imagePrompt = `🎀 ริบบิ้นสีสันสดใส ถูกตัดเป็นท่อนเท่าๆ กัน สไตล์การ์ตูนน่ารัก`;
        break;
      }
    }

    questions.push({
      id: `nt_measurement_${Date.now()}_${i}`,
      skill: 'measurement',
      question,
      correctAnswer,
      choices,
      difficulty: 'medium',
      explanation,
      imagePrompt
    });
  }

  return questions;
};

// ========= NT SHAPES GENERATORS =========

export const generateNTShapesQuestions = (count: number): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const questionTypes = ['identify_shapes', 'symmetry', 'patterns'];

  for (let i = 0; i < count; i++) {
    const type = questionTypes[i % questionTypes.length];
    let question = '';
    let correctAnswer: string = '';
    let choices: string[] = [];
    let explanation = '';
    let imagePrompt = '';
    const points = i < 2 ? 3 : 4;

    switch (type) {
      case 'identify_shapes': {
        const shapes = [
          { name: 'สามเหลี่ยม', sides: 3, corners: 3 },
          { name: 'สี่เหลี่ยมจัตุรัส', sides: 4, corners: 4 },
          { name: 'วงกลม', sides: 0, corners: 0 },
          { name: 'สี่เหลี่ยมผืนผ้า', sides: 4, corners: 4 }
        ];
        const selected = shapes[randInt(0, shapes.length - 1)];
        
        question = `รูปเรขาคณิตที่มี ${selected.sides} ด้าน ${selected.corners} มุม คืออะไร?`;
        correctAnswer = selected.name;
        
        choices = shuffleArray(shapes.map(s => s.name));
        
        explanation = `${selected.name} มี ${selected.sides} ด้าน ${selected.corners} มุม`;
        imagePrompt = `🔷 รูปเรขาคณิตพื้นฐาน ${selected.name} สีสันสดใส พื้นหลังขาว สไตล์การศึกษา`;
        break;
      }

      case 'symmetry': {
        const symmetricShapes = ['หัวใจ', 'ผีเสื้อ', 'ดอกไม้', 'ใบไม้'];
        const shape = symmetricShapes[randInt(0, symmetricShapes.length - 1)];
        const axisCount = [1, 2][randInt(0, 1)];
        
        question = `รูป${shape}มีแกนสมมาตรกี่เส้น?`;
        correctAnswer = `${axisCount} เส้น`;
        
        choices = shuffleArray([
          `${axisCount} เส้น`,
          `${axisCount + 1} เส้น`,
          `${axisCount - 1} เส้น`,
          '0 เส้น'
        ].filter(c => !c.includes('-')));
        
        explanation = `รูป${shape}มีแกนสมมาตร ${axisCount} เส้น`;
        imagePrompt = `🦋 ${shape}สวยงาม แสดงเส้นแกนสมมาตร สีสันสดใส สไตล์การ์ตูน`;
        break;
      }

      case 'patterns': {
        const shapes = ['○', '△', '□'];
        const pattern = [shapes[0], shapes[1], shapes[2], shapes[0], shapes[1]];
        const next = shapes[2];
        
        question = `แบบรูป: ${pattern.join(' ')}, ___\n\nรูปถัดไปคืออะไร?`;
        correctAnswer = next;
        
        choices = shuffleArray(shapes);
        
        explanation = `แบบรูปซ้ำ: ${shapes.join(' ')} → ${next}`;
        imagePrompt = `🔄 แบบรูปซ้ำของรูปเรขาคณิต วงกลม สามเหลี่ยม สี่เหลี่ยม สีสันสดใส สไตล์การศึกษา`;
        break;
      }
    }

    questions.push({
      id: `nt_shapes_${Date.now()}_${i}`,
      skill: 'shapes',
      question,
      correctAnswer,
      choices,
      difficulty: 'medium',
      explanation,
      imagePrompt
    });
  }

  return questions;
};

// ========= NT DATA PRESENTATION GENERATORS =========

export const generateNTDataPresentationQuestions = (count: number): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const questionTypes = ['read_table', 'read_pictograph', 'read_bar_chart', 'interpret_data'];

  for (let i = 0; i < count; i++) {
    const type = questionTypes[i % questionTypes.length];
    let question = '';
    let correctAnswer: string = '';
    let choices: string[] = [];
    let explanation = '';
    let imagePrompt = '';
    const points = i < 3 ? 3 : 4;

    switch (type) {
      case 'read_table': {
        const fruits = ['แอปเปิ้ล', 'ส้ม', 'กล้วย', 'มะม่วง'];
        const counts = fruits.map(() => randInt(10, 30));
        const total = counts.reduce((sum, c) => sum + c, 0);
        
        question = `ตารางแสดงจำนวนผลไม้ที่ขาย:\n\n`;
        fruits.forEach((fruit, idx) => {
          question += `${fruit}: ${counts[idx]} ผล\n`;
        });
        question += `\nขายผลไม้ทั้งหมดกี่ผล?`;
        
        correctAnswer = `${total} ผล`;
        choices = shuffleArray([
          `${total} ผล`,
          `${total + 5} ผล`,
          `${total - 5} ผล`,
          `${Math.max(...counts)} ผล`
        ]);
        
        explanation = `${counts.join(' + ')} = ${total} ผล`;
        imagePrompt = `📊 ตารางข้อมูลสีสันสดใส แสดงชนิดผลไม้และจำนวน มีรูปผลไม้ประกอบ สไตล์การ์ตูน`;
        break;
      }

      case 'read_pictograph': {
        const colors = ['แดง', 'น้ำเงิน', 'เขียว', 'เหลือง'];
        const cars = colors.map(() => randInt(3, 8));
        const maxIndex = cars.indexOf(Math.max(...cars));
        
        question = `แผนภูมิรูปภาพแสดงจำนวนรถของเล่น\n(1 🚗 = 1 คัน)\n\n`;
        colors.forEach((color, idx) => {
          question += `${color}: ${'🚗'.repeat(cars[idx])}\n`;
        });
        question += `\nสีใดมีมากที่สุด?`;
        
        correctAnswer = colors[maxIndex];
        choices = shuffleArray(colors);
        
        explanation = `รถสี${correctAnswer} มี ${cars[maxIndex]} คัน มากที่สุด`;
        imagePrompt = `📈 แผนภูมิรูปภาพรถยนต์สีสันสดใส แยกตามสี สไตล์การ์ตูนน่ารัก`;
        break;
      }

      case 'read_bar_chart': {
        const subjects = ['คณิต', 'ไทย', 'อังกฤษ', 'วิทย์'];
        const scores = subjects.map(() => randInt(60, 95));
        const highestIndex = scores.indexOf(Math.max(...scores));
        
        question = `แผนภูมิแท่งแสดงคะแนนสอบ:\n\n`;
        subjects.forEach((subject, idx) => {
          question += `${subject}: ${'█'.repeat(Math.floor(scores[idx] / 10))} ${scores[idx]} คะแนน\n`;
        });
        question += `\nวิชาใดได้คะแนนสูงสุด?`;
        
        correctAnswer = subjects[highestIndex];
        choices = shuffleArray(subjects);
        
        explanation = `วิชา${correctAnswer} ได้ ${scores[highestIndex]} คะแนน สูงสุด`;
        imagePrompt = `📊 แผนภูมิแท่งสีสันสดใส แสดงคะแนนสอบแต่ละวิชา สไตล์การศึกษา`;
        break;
      }

      case 'interpret_data': {
        const students = [
          { hobby: 'อ่านหนังสือ', count: randInt(8, 15) },
          { hobby: 'เล่นกีฬา', count: randInt(10, 18) },
          { hobby: 'วาดรูป', count: randInt(6, 12) }
        ];
        const total = students.reduce((sum, s) => sum + s.count, 0);
        const mostPopular = students.reduce((max, s) => s.count > max.count ? s : max);
        
        question = `ข้อมูลงานอดิเรกของนักเรียน:\n\n`;
        students.forEach(s => {
          question += `${s.hobby}: ${s.count} คน\n`;
        });
        question += `\nงานอดิเรกใดได้รับความนิยมมากที่สุด?`;
        
        correctAnswer = mostPopular.hobby;
        choices = shuffleArray(students.map(s => s.hobby));
        
        explanation = `${mostPopular.hobby} มี ${mostPopular.count} คน มากที่สุด`;
        imagePrompt = `📋 ข้อมูลสถิติงานอดิเรก มีไอคอนประกอบแต่ละกิจกรรม สไตล์การ์ตูนน่ารัก`;
        break;
      }
    }

    questions.push({
      id: `nt_data_${Date.now()}_${i}`,
      skill: 'dataPresentation',
      question,
      correctAnswer,
      choices,
      difficulty: 'medium',
      explanation,
      imagePrompt
    });
  }

  return questions;
};
