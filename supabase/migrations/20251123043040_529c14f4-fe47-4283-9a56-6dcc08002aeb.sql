-- Add 34 Grade 1 Semester 2 addition/subtraction word problems to system question bank
DO $$
DECLARE
  v_admin_id uuid;
BEGIN
  -- Get or create system admin
  SELECT id INTO v_admin_id FROM admins WHERE email = 'system@admin.com' LIMIT 1;
  
  IF v_admin_id IS NULL THEN
    INSERT INTO admins (email, name, password_hash)
    VALUES ('system@admin.com', 'System Admin', 'system_only')
    RETURNING id INTO v_admin_id;
  END IF;

  -- Problem 1: Adjusted numbers
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'ฝนเก็บออมเงินได้ 28 บาท แม่ให้อีก 15 บาท ฝนนำเงินที่มีอยู่ไปซื้อสมุดราคา 22 บาท ฝนเหลือเงินกี่บาท',
    '21',
    'easy',
    'การบวกและการลบ',
    'math',
    '["21 บาท", "19 บาท", "25 บาท", "43 บาท"]'::jsonb,
    'ฝนเก็บออมเงินได้ 28 บาท แม่ให้อีก 15 บาท แสดงว่า ฝนมีเงินเก็บ = 28+15 = 43 บาท นำเงินไปซื้อสมุดราคา 22 บาท ดังนั้น ฝนเหลือเงิน = 43−22 = 21 บาท | ประโยคสัญลักษณ์: (28+15)−22=□',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ', 'เงิน']
  );

  -- Problem 2
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'แม่ค้าซื้อมะม่วงมา 58 กิโลกรัม ขายไป 36 กิโลกรัม ซื้อเพิ่มอีก 31 กิโลกรัม แม่ค้ามีมะม่วงทั้งหมดกี่กิโลกรัม',
    '53',
    'easy',
    'การบวกและการลบ',
    'math',
    '["53 กิโลกรัม", "47 กิโลกรัม", "58 กิโลกรัม", "89 กิโลกรัม"]'::jsonb,
    'แม่ค้าซื้อมะม่วงมา 58 กิโลกรัม ขายไป 36 กิโลกรัม แสดงว่า แม่ค้าเหลือมะม่วง 58−36 = 22 กิโลกรัม ซื้อเพิ่มอีก 31 กิโลกรัม ดังนั้น แม่ค้ามีมะม่วงทั้งหมด 22+31 = 53 กิโลกรัม | ประโยคสัญลักษณ์: (58−36)+31=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ', 'น้ำหนัก']
  );

  -- Problem 3
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'พ่อมีเงินอยู่ 70 บาท จ่ายเป็นค่าหนังสือ 32 บาท ค่าปากกา 15 บาท พ่อเหลือเงินกี่บาท',
    '23',
    'easy',
    'การบวกและการลบ',
    'math',
    '["23 บาท", "28 บาท", "38 บาท", "47 บาท"]'::jsonb,
    'พ่อมีเงินอยู่ 70 บาท จ่ายเป็นค่าหนังสือ 32 บาท ค่าปากกา 15 บาท แสดงว่า รวมพ่อจ่ายค่าหนังสือและปากกา = 32+15 = 47 บาท ดังนั้น พ่อเหลือเงิน = 70−47 = 23 บาท | ประโยคสัญลักษณ์: 70−(32+15)=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ', 'เงิน']
  );

  -- Problem 4
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'สุนารีมีลูกอม 28 เม็ด แบ่งให้เพื่อน 16 เม็ด พี่ให้มาอีก 19 เม็ด สุนารีมีลูกอมทั้งหมดกี่เม็ด',
    '31',
    'easy',
    'การบวกและการลบ',
    'math',
    '["31 เม็ด", "25 เม็ด", "35 เม็ด", "47 เม็ด"]'::jsonb,
    'สุนารีมีลูกอม 28 เม็ด แบ่งให้เพื่อน 16 เม็ด แสดงว่า สุนารีเหลือลูกอม = 28−16 = 12 เม็ด พี่ให้มาอีก 19 เม็ด ดังนั้น สุนารีมีลูกอมทั้งหมด = 12+19 = 31 เม็ด | ประโยคสัญลักษณ์: (28−16)+19=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ']
  );

  -- Problem 5
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'แม่มีส้ม 15 ผล ซื้อเพิ่มอีก 18 ผล นำไปคั้นเป็นน้ำส้ม 27 ผล แม่เหลือส้มกี่ผล',
    '6',
    'easy',
    'การบวกและการลบ',
    'math',
    '["6 ผล", "3 ผล", "9 ผล", "12 ผล"]'::jsonb,
    'แม่มีส้ม 15 ผล ซื้อเพิ่มอีก 18 ผล แสดงว่า แม่มีส้ม = 15+18 = 33 ผล นำไปคั้นเป็นน้ำส้ม 27 ผล ดังนั้น แม่เหลือส้ม = 33−27 = 6 ผล | ประโยคสัญลักษณ์: (15+18)−27=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ', 'ผลไม้']
  );

  -- Problem 6
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'พ่อใส่ตะปูลงในกล่องแล้ว 48 ตัว ใส่เพิ่มอีก 16 ตัว ยังเหลือที่ใส่ตะปูได้อีก 14 ตัว กล่องใบนี้ใส่ตะปูได้กี่ตัว',
    '78',
    'medium',
    'การบวก',
    'math',
    '["78 ตัว", "64 ตัว", "72 ตัว", "84 ตัว"]'::jsonb,
    'พ่อใส่ตะปูลงในกล่องแล้ว 48 ตัว ใส่เพิ่มอีก 16 ตัว ยังเหลือที่ใส่ตะปูได้อีก 14 ตัว ดังนั้น กล่องใบนี้ใส่ตะปูได้ = 48+16+14 = 78 ตัว | ประโยคสัญลักษณ์: 48+16+14=?',
    ARRAY['โจทย์ปัญหา', 'การบวก']
  );

  -- Problem 7
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'ในขวดมีลูกกวาดสีแดง 27 เม็ด ลูกกวาดสีเหลือง 16 เม็ด ลูกอม 29 เม็ด มีลูกอมน้อยกว่าลูกกวาดทั้งหมดกี่เม็ด',
    '14',
    'medium',
    'การบวกและการลบ',
    'math',
    '["14 เม็ด", "10 เม็ด", "18 เม็ด", "22 เม็ด"]'::jsonb,
    'ในขวดมีลูกกวาดสีแดง 27 เม็ด ลูกกวาดสีเหลือง 16 เม็ด แสดงว่า ในขวดมีลูกกวาด = 27+16 = 43 เม็ด ลูกอม 29 เม็ด ดังนั้น มีลูกอมน้อยกว่าลูกกวาดทั้งหมด = 43−29 = 14 เม็ด | ประโยคสัญลักษณ์: (27+16)−29=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ']
  );

  -- Problem 8
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'พี่ใส่ลูกอมลงในขวดโหลแล้ว 45 เม็ด ใส่เพิ่มอีก 18 เม็ด ยังเหลือที่ใส่ลูกอมได้อีก 12 เม็ด ขวดโหลใบนี้ใส่ลูกอมได้กี่เม็ด',
    '75',
    'medium',
    'การบวก',
    'math',
    '["75 เม็ด", "63 เม็ด", "69 เม็ด", "81 เม็ด"]'::jsonb,
    'พี่ใส่ลูกอมลงในขวดโหลแล้ว 45 เม็ด ใส่เพิ่มอีก 18 เม็ด แสดงว่า ใส่ลูกอมลงในขวดโหล = 45+18 = 63 เม็ด ยังเหลือที่ใส่ลูกอมได้อีก 12 เม็ด ดังนั้น ขวดโหลใบนี้ใส่ลูกอมได้ = 63+12 = 75 เม็ด | ประโยคสัญลักษณ์: (45+18)+12=?',
    ARRAY['โจทย์ปัญหา', 'การบวก']
  );

  -- Problem 9
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'ชาวสวนซื้อถุงมาเพาะต้นไม้ 59 ใบ ซื้ออีก 32 ใบ ใช้ไป 43 ใบ ชาวสวนเหลือถุงกี่ใบ',
    '48',
    'medium',
    'การบวกและการลบ',
    'math',
    '["48 ใบ", "42 ใบ", "54 ใบ", "91 ใบ"]'::jsonb,
    'ชาวสวนซื้อถุงมาเพาะต้นไม้ 59 ใบ ซื้ออีก 32 ใบ แสดงว่า ชาวสวนมีถุงมาเพาะต้นไม้ = 59+32 = 91 ใบ ใช้ไป 43 ใบ ดังนั้น ชาวสวนเหลือถุง = 91−43 = 48 ใบ | ประโยคสัญลักษณ์: (59+32)−43=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ']
  );

  -- Problem 10
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'แม่จ่ายเงินให้แม่ค้า 60 บาท เป็นค่าผักบุ้ง 14 บาท ค่าผักกาดขาว 16 บาท แม่ได้รับเงินทอนกี่บาท',
    '30',
    'medium',
    'การบวกและการลบ',
    'math',
    '["30 บาท", "24 บาท", "34 บาท", "46 บาท"]'::jsonb,
    'แม่จ่ายเงินให้แม่ค้า 60 บาท เป็นค่าผักบุ้ง 14 บาท ค่าผักกาดขาว 16 บาท แสดงว่า เป็นค่าผัก = 14+16 = 30 บาท ดังนั้น แม่ได้รับเงินทอน = 60−30 = 30 บาท | ประโยคสัญลักษณ์: 60−(14+16)=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ', 'เงิน']
  );

  -- Problem 11
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'ฟาร์มสุนัขแห่งหนึ่ง เลี้ยงสุนัขพันธุ์บางแก้วไว้ 52 ตัว ครั้งแรกมีผู้ซื้อสุนัขไป 12 ตัว ต่อมามีผู้ซื้ออีก 15 ตัว เหลือสุนัขในฟาร์มกี่ตัว',
    '25',
    'medium',
    'การลบ',
    'math',
    '["25 ตัว", "19 ตัว", "31 ตัว", "40 ตัว"]'::jsonb,
    'เลี้ยงสุนัขพันธุ์บางแก้วไว้ 52 ตัว ครั้งแรกมีผู้ซื้อสุนัขไป 12 ตัว แสดงว่า ฟาร์มเหลือสุนัข = 52−12 = 40 ตัว ต่อมามีผู้ซื้ออีก 15 ตัว ดังนั้น เหลือสุนัขในฟาร์ม = 40−15 = 25 ตัว | ประโยคสัญลักษณ์: 52−12−15=?',
    ARRAY['โจทย์ปัญหา', 'การลบ', 'สัตว์']
  );

  -- Problem 12
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'รุจีมีเงิน 42 บาท พ่อให้อีก 48 บาท รุจีนำเงินไปซื้อเสื้อราคา 75 บาท รุจีเหลือเงินกี่บาท',
    '15',
    'medium',
    'การบวกและการลบ',
    'math',
    '["15 บาท", "10 บาท", "20 บาท", "90 บาท"]'::jsonb,
    'รุจีมีเงิน 42 บาท พ่อให้อีก 48 บาท แสดงว่า รุจีมีเงิน = 42+48 = 90 บาท รุจีนำเงินไปซื้อเสื้อราคา 75 บาท ดังนั้น รุจีเหลือเงิน = 90−75 = 15 บาท | ประโยคสัญลักษณ์: (42+48)−75=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ', 'เงิน']
  );

  -- Problem 13
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'วิชิตมีเงินได้ 57 บาท ออมเงินได้เพิ่มอีก 19 บาท ถ้าวิชิตต้องการซื้อของเล่นราคา 85 บาท วิชิตต้องออมเงินเพิ่มอีกกี่บาท',
    '9',
    'medium',
    'การบวกและการลบ',
    'math',
    '["9 บาท", "6 บาท", "13 บาท", "19 บาท"]'::jsonb,
    'ถ้าวิชิตต้องการซื้อของเล่นราคา 85 บาท วิชิตมีเงินได้ 57 บาท ออมเงินได้เพิ่มอีก 19 บาท แสดงว่า วิชิตมีเงิน = 57+19 = 76 บาท ดังนั้น วิชิตต้องออมเงินเพิ่มอีก = 85−76 = 9 บาท | ประโยคสัญลักษณ์: 85−(57+19)=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ', 'เงิน']
  );

  -- Problem 14
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'วิชัยช่วยพ่อทำสวน วันแรกปลูกต้นมะม่วง 9 ต้น วันที่สองปลูกต้นมังคุด 6 ต้น วันที่สามปลูกต้นทุเรียน 5 ต้น สามวันวิชัยปลูกต้นไม้ได้กี่ต้น',
    '20',
    'easy',
    'การบวก',
    'math',
    '["20 ต้น", "15 ต้น", "24 ต้น", "18 ต้น"]'::jsonb,
    'วันแรกปลูกต้นมะม่วง 9 ต้น วันที่สองปลูกต้นมังคุด 6 ต้น วันที่สามปลูกต้นทุเรียน 5 ต้น ดังนั้น สามวันวิชัยปลูกต้นไม้ได้ = 9+6+5 = 20 ต้น | ประโยคสัญลักษณ์: 9+6+5=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'พืชผล']
  );

  -- Problem 15
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'น้าทำกระทงขาย มีกระทงขนาดใหญ่ 17 ใบ ขนาดกลาง 19 ใบ ขนาดเล็ก 14 ใบ น้าทำกระทงขายทั้งหมดกี่ใบ',
    '50',
    'easy',
    'การบวก',
    'math',
    '["50 ใบ", "45 ใบ", "55 ใบ", "36 ใบ"]'::jsonb,
    'กระทงขนาดใหญ่ 17 ใบ ขนาดกลาง 19 ใบ แสดงว่า กระทงขนาดใหญ่และขนาดกลาง = 17+19 = 36 ใบ ขนาดเล็ก 14 ใบ ดังนั้น น้าทำกระทงขายทั้งหมด = 36+14 = 50 ใบ | ประโยคสัญลักษณ์: 17+19+14=?',
    ARRAY['โจทย์ปัญหา', 'การบวก']
  );

  -- Problem 16
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'นัดซื้อปลา 25 ตัว ซื้อปู 19 ตัว ซื้อหมึก 13 ตัว นัดซื้อปลา ปู และหมึกทั้งหมดกี่ตัว',
    '57',
    'easy',
    'การบวก',
    'math',
    '["57 ตัว", "51 ตัว", "63 ตัว", "44 ตัว"]'::jsonb,
    'นัดซื้อปลา 25 ตัว ซื้อปู 19 ตัว ซื้อหมึก 13 ตัว ดังนั้น นัดซื้อปลา ปู และหมึกทั้งหมด = 25+19+13 = 57 ตัว | ประโยคสัญลักษณ์: 25+19+13=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'สัตว์น้ำ']
  );

  -- Problem 17
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'แจงมีตุ๊กตาแมวน้ำ 8 ตัว แม่ซื้อให้อีก 5 ตัว แจงแบ่งตุ๊กตาแมวน้ำให้น้อง 6 ตัว แจงเหลือตุ๊กตาแมวน้ำกี่ตัว',
    '7',
    'easy',
    'การบวกและการลบ',
    'math',
    '["7 ตัว", "5 ตัว", "9 ตัว", "13 ตัว"]'::jsonb,
    'แจงมีตุ๊กตาแมวน้ำ 8 ตัว แม่ซื้อให้อีก 5 ตัว แสดงว่า แจงมีตุ๊กตาแมวน้ำ = 8+5 = 13 ตัว แจงแบ่งตุ๊กตาแมวน้ำให้น้อง 6 ตัว ดังนั้น แจงเหลือตุ๊กตาแมวน้ำ = 13−6 = 7 ตัว | ประโยคสัญลักษณ์: (8+5)−6=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ']
  );

  -- Problem 18
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'แก้วตาซื้อมะม่วง 10 ลูก ซื้อแตงโมอีก 5 ลูก ให้แตงโมน้องไป 4 ลูก แก้วตาเหลือผลไม้กี่ลูก',
    '11',
    'easy',
    'การบวกและการลบ',
    'math',
    '["11 ลูก", "9 ลูก", "13 ลูก", "15 ลูก"]'::jsonb,
    'แก้วตาซื้อมะม่วง 10 ลูก ซื้อแตงโมอีก 5 ลูก แสดงว่า แก้วตามีผลไม้ = 10+5 = 15 ลูก ให้แตงโมน้องไป 4 ลูก ดังนั้น แก้วตาเหลือผลไม้ = 15−4 = 11 ลูก | ประโยคสัญลักษณ์: (10+5)−4=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ', 'ผลไม้']
  );

  -- Problem 19
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'พ่อเก็บทุเรียนวันแรกได้ 10 ผล วันที่สองเก็บได้ 8 ผล แบ่งให้น้าไป 5 ผล พ่อเหลือทุเรียนกี่ผล',
    '13',
    'easy',
    'การบวกและการลบ',
    'math',
    '["13 ผล", "11 ผล", "15 ผล", "18 ผล"]'::jsonb,
    'พ่อเก็บทุเรียนวันแรกได้ 10 ผล วันที่สองเก็บได้ 8 ผล แสดงว่า พ่อเก็บทุเรียนสองวันได้ = 10+8 = 18 ผล แบ่งให้น้าไป 5 ผล ดังนั้น พ่อเหลือทุเรียน = 18−5 = 13 ผล | ประโยคสัญลักษณ์: (10+8)−5=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ', 'ผลไม้']
  );

  -- Problem 20
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'น้ำใสเก็บดอกกุหลาบได้ 23 ดอก แก้วตาเก็บได้ 19 ดอก แบ่งให้คุณยาย 10 ดอก น้ำใสและแก้วตาเหลือดอกกุหลาบกี่ดอก',
    '32',
    'easy',
    'การบวกและการลบ',
    'math',
    '["32 ดอก", "28 ดอก", "36 ดอก", "42 ดอก"]'::jsonb,
    'น้ำใสเก็บดอกกุหลาบได้ 23 ดอก แก้วตาเก็บได้ 19 ดอก แสดงว่า น้ำใสและแก้วตาเก็บดอกกุหลาบ = 23+19 = 42 ดอก แบ่งให้คุณยาย 10 ดอก ดังนั้น น้ำใสและแก้วตาเหลือดอกกุหลาบ = 42−10 = 32 ดอก | ประโยคสัญลักษณ์: (23+19)−10=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ', 'ดอกไม้']
  );

  -- Problem 21
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'แม่ค้ามีขนมถ้วย 68 กล่อง เอาไปทำบุญที่วัดไป 38 กล่อง ขายไป 22 กล่อง แม่ค้าเหลือขนมถ้วยกี่กล่อง',
    '8',
    'medium',
    'การลบ',
    'math',
    '["8 กล่อง", "6 กล่อง", "12 กล่อง", "30 กล่อง"]'::jsonb,
    'แม่ค้ามีขนมถ้วย 68 กล่อง เอาไปทำบุญที่วัดไป 38 กล่อง แสดงว่า แม่ค้ามีขนมถ้วย = 68−38 = 30 กล่อง ขายไป 22 กล่อง ดังนั้น แม่ค้าเหลือขนมถ้วย = 30−22 = 8 กล่อง | ประโยคสัญลักษณ์: (68−38)−22=?',
    ARRAY['โจทย์ปัญหา', 'การลบ', 'ขนม']
  );

  -- Problem 22
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'คุณตาเลี้ยงนกแก้ว 9 ตัว ซื้อมาเพิ่มอีก 12 ตัว แบ่งให้หลานไปเลี้ยง 7 ตัว คุณตาเหลือนกแก้วกี่ตัว',
    '14',
    'easy',
    'การบวกและการลบ',
    'math',
    '["14 ตัว", "12 ตัว", "16 ตัว", "21 ตัว"]'::jsonb,
    'คุณตาเลี้ยงนกแก้ว 9 ตัว ซื้อมาเพิ่มอีก 12 ตัว แสดงว่า คุณตาเลี้ยงนกแก้ว = 9+12 = 21 ตัว แบ่งให้หลานไปเลี้ยง 7 ตัว ดังนั้น คุณตาเหลือนกแก้ว = 21−7 = 14 ตัว | ประโยคสัญลักษณ์: (9+12)−7=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ', 'สัตว์']
  );

  -- Problem 23
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'หนูดีเก็บผักบุ้งได้ 21 กำ ยายเก็บผักบุ้งได้ 18 กำ ขายไป 19 กำ หนูดีและคุณยายเหลือผักบุ้งรวมกี่กำ',
    '20',
    'easy',
    'การบวกและการลบ',
    'math',
    '["20 กำ", "18 กำ", "24 กำ", "39 กำ"]'::jsonb,
    'หนูดีเก็บผักบุ้งได้ 21 กำ ยายเก็บผักบุ้งได้ 18 กำ แสดงว่า หนูดีและยายเก็บผักบุ้งได้ = 21+18 = 39 กำ ขายไป 19 กำ ดังนั้น หนูดีและคุณยายเหลือผักบุ้งรวม = 39−19 = 20 กำ | ประโยคสัญลักษณ์: (21+18)−19=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ', 'ผักผลไม้']
  );

  -- Problem 24
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'วิชัยกระโดดตบได้ 71 ครั้ง รอบที่สองได้ 39 ครั้ง ภูเขากระโดดตบได้น้อยกว่าวิชัยทั้งหมด 18 ครั้ง ภูเขากระโดดตบได้กี่ครั้ง',
    '92',
    'medium',
    'การบวกและการลบ',
    'math',
    '["92 ครั้ง", "86 ครั้ง", "98 ครั้ง", "110 ครั้ง"]'::jsonb,
    'วิชัยกระโดดตบได้ 71 ครั้ง รอบที่สองได้ 39 ครั้ง แสดงว่า วิชัยกระโดดตบได้ทั้งหมด = 71+39 = 110 ครั้ง ภูเขากระโดดตบได้น้อยกว่าวิชัยทั้งหมด 18 ครั้ง ดังนั้น ภูเขากระโดดตบได้ = 110−18 = 92 ครั้ง | ประโยคสัญลักษณ์: (71+39)−18=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ', 'กีฬา']
  );

  -- Problem 25
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'ชามหนึ่งกองมี 45 ใบ หนูนาล้างไปได้ 22 ใบ กอแก้วล้างได้ 12 ใบ เหลือชามที่ยังไม่ได้ล้างกี่ใบ',
    '11',
    'medium',
    'การบวกและการลบ',
    'math',
    '["11 ใบ", "9 ใบ", "15 ใบ", "34 ใบ"]'::jsonb,
    'หนูนาล้างไปได้ 22 ใบ กอแก้วล้างได้ 12 ใบ แสดงว่า หนูนาและกอแก้วล้างชาม = 22+12 = 34 ใบ ชามหนึ่งกองมี 45 ใบ ดังนั้น เหลือชามที่ยังไม่ได้ล้าง = 45−34 = 11 ใบ | ประโยคสัญลักษณ์: 45−(22+12)=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ']
  );

  -- Problem 26
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'ลุงสุกเก็บมะนาวได้ 84 ผล ขายไป 37 ผล ต่อมาขายไปอีก 25 ผล ลุงสุกเหลือมะนาวกี่ผล',
    '22',
    'medium',
    'การลบ',
    'math',
    '["22 ผล", "18 ผล", "28 ผล", "47 ผล"]'::jsonb,
    'ลุงสุกเก็บมะนาวได้ 84 ผล ขายไป 37 ผล แสดงว่า ลุงสุกเหลือมะนาว = 84−37 = 47 ผล ต่อมาขายไปอีก 25 ผล ดังนั้น ลุงสุกเหลือมะนาว = 47−25 = 22 ผล | ประโยคสัญลักษณ์: 84−37−25=?',
    ARRAY['โจทย์ปัญหา', 'การลบ', 'ผลไม้']
  );

  -- Problem 27
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'ป้าเลี้ยงนก 31 ตัว ให้หนูดีไปเลี้ยง 15 ตัว ลุงซื้อมาให้อีก 7 ตัว ป้ามีนกมีทั้งหมดกี่ตัว',
    '23',
    'easy',
    'การบวกและการลบ',
    'math',
    '["23 ตัว", "19 ตัว", "27 ตัว", "16 ตัว"]'::jsonb,
    'ป้าเลี้ยงนก 31 ตัว ให้หนูดีไปเลี้ยง 15 ตัว แสดงว่า ป้าเหลือนก = 31−15 = 16 ตัว ลุงซื้อมาให้อีก 7 ตัว ดังนั้น ป้ามีนกมีทั้งหมด = 16+7 = 23 ตัว | ประโยคสัญลักษณ์: (31−15)+7=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ', 'สัตว์']
  );

  -- Problem 28
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'มีลูกบอลในตะกร้า 11 ลูก อยู่นอกตะกร้า 4 ลูก นำไปซ้อมเตะ 6 ลูก เหลือฟุตบอลอยู่กี่ลูก',
    '9',
    'easy',
    'การบวกและการลบ',
    'math',
    '["9 ลูก", "7 ลูก", "11 ลูก", "15 ลูก"]'::jsonb,
    'มีลูกบอลในตะกร้า 11 ลูก อยู่นอกตะกร้า 4 ลูก แสดงว่า มีลูกบอล = 11+4 = 15 ลูก นำไปซ้อมเตะ 6 ลูก ดังนั้น เหลือฟุตบอลอยู่ = 15−6 = 9 ลูก | ประโยคสัญลักษณ์: (11+4)−6=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ', 'กีฬา']
  );

  -- Problem 29
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'หนังสือเรียนเล่มหนึ่งมี 42 หน้า วันแรกฉันอ่านได้ 17 หน้า วันที่สองฉันอ่านได้ 10 หน้า ฉันยังไม่ได้อ่านอีกกี่หน้า',
    '15',
    'medium',
    'การบวกและการลบ',
    'math',
    '["15 หน้า", "12 หน้า", "19 หน้า", "27 หน้า"]'::jsonb,
    'หนังสือเรียนเล่มหนึ่งมี 42 หน้า วันแรกฉันอ่านได้ 17 หน้า วันที่สองฉันอ่านได้ 10 หน้า แสดงว่า อ่านแล้วทั้งหมด = 17+10 = 27 หน้า ดังนั้น ฉันยังไม่ได้อ่านอีก = 42−27 = 15 หน้า | ประโยคสัญลักษณ์: 42−(17+10)=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ']
  );

  -- Problem 30
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'นักเรียนชั้นประถมศึกษาปีที่ 1 มี 39 คน เป็นเวรทำความสะอาด วันจันทร์ 9 คน วันอังคาร 12 คน เหลือนักเรียนทำความสะอาดวันอื่นๆ กี่คน',
    '18',
    'medium',
    'การบวกและการลบ',
    'math',
    '["18 คน", "15 คน", "22 คน", "30 คน"]'::jsonb,
    'นักเรียนชั้นประถมศึกษาปีที่ 1 มี 39 คน เป็นเวรทำความสะอาด วันจันทร์ 9 คน วันอังคาร 12 คน แสดงว่า เป็นเวรวันจันทร์และวันอังคาร = 9+12 = 21 คน ดังนั้น เหลือนักเรียนทำความสะอาดวันอื่นๆ = 39−21 = 18 คน | ประโยคสัญลักษณ์: 39−(9+12)=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ']
  );

  -- Problem 31
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'ลุงชาจับปลาได้ 16 ตัว นำไปขาย 7 ตัว หาปลาได้อีก 11 ตัว ลุงชามีปลาทั้งหมดกี่ตัว',
    '20',
    'easy',
    'การบวกและการลบ',
    'math',
    '["20 ตัว", "18 ตัว", "24 ตัว", "9 ตัว"]'::jsonb,
    'ลุงชาจับปลาได้ 16 ตัว นำไปขาย 7 ตัว แสดงว่า ลุงเหลือปลา = 16−7 = 9 ตัว หาปลาได้อีก 11 ตัว ดังนั้น ลุงชามีปลาทั้งหมด = 9+11 = 20 ตัว | ประโยคสัญลักษณ์: (16−7)+11=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ', 'สัตว์น้ำ']
  );

  -- Problem 32
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'ครูพานักเรียนไปเก็บดอกกุหลาบในสวนได้ 35 ดอก ให้นักเรียนนำไปกราบแม่ 24 ดอก เก็บมาเพิ่มอีก 16 ดอก เหลือดอกกุหลาบกี่ดอก',
    '27',
    'easy',
    'การบวกและการลบ',
    'math',
    '["27 ดอก", "23 ดอก", "31 ดอก", "11 ดอก"]'::jsonb,
    'ดอกกุหลาบในสวนได้ 35 ดอก ให้นักเรียนนำไปกราบแม่ 24 ดอก แสดงว่า เหลือดอกกุหลาบ = 35−24 = 11 ดอก เก็บมาเพิ่มอีก 16 ดอก ดังนั้น เหลือดอกกุหลาบ = 11+16 = 27 ดอก | ประโยคสัญลักษณ์: (35−24)+16=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ', 'ดอกไม้']
  );

  -- Problem 33
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'ฉันมีของเล่น 46 ชิ้น แบ่งให้น้อง 19 ชิ้น ซื้อของเล่นเพิ่มอีก 10 ชิ้น ฉันมีของเล่นทั้งหมดกี่ชิ้น',
    '37',
    'easy',
    'การบวกและการลบ',
    'math',
    '["37 ชิ้น", "33 ชิ้น", "41 ชิ้น", "27 ชิ้น"]'::jsonb,
    'ฉันมีของเล่น 46 ชิ้น แบ่งให้น้อง 19 ชิ้น แสดงว่า ฉันเหลือของเล่น = 46−19 = 27 ชิ้น ซื้อของเล่นเพิ่มอีก 10 ชิ้น ดังนั้น ฉันมีของเล่นทั้งหมด = 27+10 = 37 ชิ้น | ประโยคสัญลักษณ์: (46−19)+10=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ']
  );

  -- Problem 34
  INSERT INTO question_bank (
    admin_id, is_system_question, grade, semester, assessment_type,
    question_text, correct_answer, difficulty, skill_name, subject,
    choices, explanation, tags
  ) VALUES (
    v_admin_id, true, 1, 2, 'semester',
    'แม่มีส้ม 44 ผล มีส้มมากกว่ามีฝรั่ง 17 ผล แม่มีส้มและฝรั่งรวมทั้งหมดกี่ผล',
    '71',
    'medium',
    'การบวกและการลบ',
    'math',
    '["71 ผล", "65 ผล", "77 ผล", "27 ผล"]'::jsonb,
    'แม่มีส้ม 44 ผล มีส้มมากกว่ามีฝรั่ง 17 ผล แสดงว่า แม่มีฝรั่ง = 44−17 = 27 ผล ดังนั้น แม่มีส้มและฝรั่งรวมทั้งหมด = 44+27 = 71 ผล | ประโยคสัญลักษณ์: 44+(44−17)=?',
    ARRAY['โจทย์ปัญหา', 'การบวก', 'การลบ', 'ผลไม้']
  );

END $$;