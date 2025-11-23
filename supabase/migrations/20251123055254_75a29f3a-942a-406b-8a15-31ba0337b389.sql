-- Insert NT Grade 3 Year 2566 Exam Questions into question_bank
DO $$
DECLARE
  v_admin_id uuid;
BEGIN
  -- Get admin ID
  SELECT id INTO v_admin_id FROM admins LIMIT 1;

  -- Question 1: Comparing and ordering numbers
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'comparing_numbers',
    'การเปรียบเทียบและเรียงลำดับจำนวน', 'medium',
    'จำนวนประชากรในอำเภอแห่งหนึ่ง: สามัคคี 16,049 คน, เอื้อเฟื้อ 7,624 คน, รวมใจ 92,140 คน, ใจบุญ 21,881 คน, เสียสละ 13,795 คน เมื่อเรียงลำดับจำนวนประชากรจากมากไปน้อย ตำบลในข้อใดที่มีประชากรน้อยเป็น 2 ตำบลสุดท้าย?',
    '["เสียสละ และ เอื้อเฟื้อ", "รวมใจ และ ใจบุญ", "ใจบุญ และ เสียสละ", "สามัคคี และ เอื้อเฟื้อ"]'::jsonb,
    'เสียสละ และ เอื้อเฟื้อ',
    'เรียงลำดับจากมากไปน้อย: 92,140 (รวมใจ), 21,881 (ใจบุญ), 16,049 (สามัคคี), 13,795 (เสียสละ), 7,624 (เอื้อเฟื้อ) สองลำดับสุดท้าย (น้อยที่สุด) คือ เสียสละ และ เอื้อเฟื้อ',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 2: Comparing fractions
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'fractions',
    'การเปรียบเทียบเศษส่วน', 'medium',
    'น้ำผลไม้บรรจุกล่อง ขายได้ดังนี้: น้ำผลไม้รวม 1/2 ลัง, น้ำส้ม 1/6 ลัง, น้ำลิ้นจี่ 1/3 ลัง, น้ำองุ่น 1/4 ลัง ร้านค้าขายน้ำผลไม้ชนิดใดได้มากที่สุด?',
    '["น้ำส้ม", "น้ำองุ่น", "น้ำลิ้นจี่", "น้ำผลไม้รวม"]'::jsonb,
    'น้ำผลไม้รวม',
    'เศษส่วนที่มีตัวเศษเท่ากัน เศษส่วนที่มีตัวส่วนน้อยกว่า จะมีค่ามากกว่า: 1/2 > 1/3 > 1/4 > 1/6 ดังนั้น 1/2 (น้ำผลไม้รวม) มีค่ามากที่สุด',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 3: Finding unknown values
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'algebra_basic',
    'การหาค่าตัวไม่ทราบค่าในประโยคสัญลักษณ์', 'medium',
    'ครูเขียนประโยคสัญลักษณ์: ข้อ 1) 45,050 - □ = 22,150 ข้อ 2) □ + 12,200 = 35,250 นักเรียนตอบดังนี้: นิดตอบ 22,900, แก้มตอบ 27,450, หน่อยตอบ 23,900, แก้วตอบ 23,050 คำตอบของใครถูกต้องทั้งหมด?',
    '["นิด และ แก้ม", "นิด และ แก้ว", "หน่อย และ แก้ม", "หน่อย และ แก้ว"]'::jsonb,
    'นิด และ แก้ว',
    'ข้อ 1: 45,050 - 22,150 = 22,900 (นิดถูก) ข้อ 2: 35,250 - 12,200 = 23,050 (แก้วถูก)',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 4: Multiplication with unknown
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'multiplication',
    'การหาค่าตัวไม่ทราบค่าในประโยคสัญลักษณ์การคูณ', 'medium',
    'กุ้ง: 7 × □ = 630 (ตอบ 80), เจน: □ × 8 = 72 (ตอบ 9), บอส: 8 × □ = 560 (ตอบ 70), น้ำ: □ × 12 = 720 (ตอบ 6) ใครตอบถูกต้อง?',
    '["กุ้ง และ เจน", "เจน และ บอส", "บอส และ น้ำ", "น้ำ และ กุ้ง"]'::jsonb,
    'เจน และ บอส',
    'กุ้ง: 630 ÷ 7 = 90 (ผิด), เจน: 72 ÷ 8 = 9 (ถูก), บอส: 560 ÷ 8 = 70 (ถูก), น้ำ: 720 ÷ 12 = 60 (ผิด)',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 5: Word problem - symbolic expression
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'word_problems',
    'โจทย์ปัญหาการบวก ลบ คูณ หารระคน', 'medium',
    'หม้อหุงข้าว 1,250 บาท, โทรทัศน์ 9,870 บาท อารีย์ซื้ออย่างละ 1 ชิ้น แล้วเหลือเงิน 2,430 บาท เดิมอารีย์มีเงินกี่บาท? เขียนประโยคสัญลักษณ์ได้อย่างไร?',
    '["(9,870 + 1,250) + 2,430", "(9,870 + 1,250) - 2,430", "9,870 × (2,430 - 1,250)", "9,870 - (2,430 + 1,250)"]'::jsonb,
    '(9,870 + 1,250) + 2,430',
    'เงินเดิม = (ค่าของที่ซื้อไป) + (เงินเหลือ) = (9,870 + 1,250) + 2,430',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 6: Division word problem
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'word_problems',
    'โจทย์ปัญหาการบวก ลบ คูณ หารระคน', 'medium',
    'ร้านค้ามีลูกชิ้นไก่ 50 กก. มีลูกชิ้นปลามากกว่าลูกชิ้นไก่ 70 กก. แบ่งลูกชิ้นปลาใส่ถุง ถุงละ 5 กก. ได้กี่ถุง?',
    '["4", "10", "14", "24"]'::jsonb,
    '24',
    'ลูกชิ้นปลา: 50 + 70 = 120 กก. แบ่งใส่ถุง: 120 ÷ 5 = 24 ถุง',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 7: Multi-step word problem
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'word_problems',
    'โจทย์ปัญหาการบวก ลบ คูณ หารระคน', 'hard',
    'เชือกยาว 300 เมตร ตัดแบ่งเส้นละ 2 เมตร แล้วขายเส้นละ 10 บาท ได้เงินเท่าไร?',
    '["1,500", "2,980", "3,000", "6,000"]'::jsonb,
    '1,500',
    'จำนวนเส้น: 300 ÷ 2 = 150 เส้น จำนวนเงิน: 150 × 10 = 1,500 บาท',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 8: Fraction subtraction
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'fractions',
    'การบวกและลบเศษส่วน', 'medium',
    'ขนมชั้น 1 ถาด (8/8) แบ่งให้นิด 3/8 ถาด, ให้นัท 2/8 ถาด เหลือขนมเท่าใด?',
    '["1/8", "2/8", "3/8", "5/8"]'::jsonb,
    '3/8',
    'ส่วนที่ให้ไป: 3/8 + 2/8 = 5/8 ส่วนที่เหลือ: 8/8 - 5/8 = 3/8',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 9: Fraction subtraction
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'fractions',
    'การบวกและลบเศษส่วน', 'medium',
    'น้ำยาล้างจาน 1 ถัง (29/29) วันแรกขาย 13/29 ถัง, วันที่สองขาย 7/29 ถัง เหลือเท่าใด?',
    '["6/29", "9/29", "20/29", "22/29"]'::jsonb,
    '9/29',
    'ขายไปทั้งหมด: 13/29 + 7/29 = 20/29 เหลือ: 29/29 - 20/29 = 9/29',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 10: Number patterns
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'patterns',
    'แบบรูปของจำนวน', 'medium',
    'เงินออมของกระต่าย: แม่ให้ 405, วันที่ 1: 450, วันที่ 2: 495, วันที่ 3-5: ? เงินในวันที่ 3 และ วันที่ 5 รวมกันได้เท่าไร?',
    '["630", "1,080", "1,125", "1,170"]'::jsonb,
    '1,170',
    'แบบรูปเพิ่มทีละ 45: วันที่ 3 = 540, วันที่ 4 = 585, วันที่ 5 = 630 ผลรวม: 540 + 630 = 1,170',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 11: Number patterns
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'patterns',
    'แบบรูปของจำนวน', 'hard',
    'จำนวนการผลิตน้ำดื่ม: วันที่ 1: 5,350, วันที่ 3: 6,050, วันที่ 4: 6,400, วันที่ 5: 6,750 วันที่ 6 มากกว่า วันที่ 2 กี่ขวด?',
    '["350", "700", "1,400", "1,750"]'::jsonb,
    '1,400',
    'แบบรูปเพิ่มทีละ 350: วันที่ 2 = 5,700, วันที่ 6 = 7,100 ผลต่าง: 7,100 - 5,700 = 1,400',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 12: Money problem
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'money',
    'โจทย์ปัญหาเกี่ยวกับเงิน', 'medium',
    'วิชัยมีเงิน: 100 บาท 2 ใบ, 50 บาท 3 ใบ, 20 บาท 5 ใบ, 10 บาท 3 ใบ (รวม 480 บาท) ต้องการซื้อชุดกีฬา 550 บาท ต้องเก็บเพิ่มเท่าไร?',
    '["70", "100", "130", "180"]'::jsonb,
    '70',
    'รวมเงินที่มี: 200 + 150 + 100 + 30 = 480 บาท ต้องเก็บเพิ่ม: 550 - 480 = 70 บาท',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 13: Time problem
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'time',
    'โจทย์ปัญหาเกี่ยวกับเวลา', 'hard',
    'ตารางเวลารถไฟ มี 4 ช่วงเดินทาง จอดพิษณุโลก 10 นาที (13.12-13.22) นานกว่าสถานีอื่น (3 นาที) ข้อใดสรุปถูกต้อง?',
    '["รถไฟจอดที่พิษณุโลกนานที่สุด", "ช่วง 2 เดินทางนานที่สุด", "ช่วง 3 เดินทางน้อยที่สุด", "เดินทางทั้งหมด 10 ชม. 35 นาที"]'::jsonb,
    'รถไฟจอดที่พิษณุโลกนานที่สุด',
    'รถไฟจอดที่พิษณุโลก 10 นาที นานกว่าสถานีอื่น (3 นาที) จึงถูกต้อง',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 14: Time calculation
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'time',
    'โจทย์ปัญหาเกี่ยวกับเวลา', 'medium',
    'รถบรรทุกเริ่ม 09.30 น. ทำงาน 3 รอบ: รอบ 1 (1 ชม. 30 นาที), รอบ 2 (2 ชม. 5 นาที), รอบ 3 (1 ชม. 50 นาที) เสร็จเวลาใด?',
    '["13.55 น.", "14.15 น.", "14.55 น.", "15.40 น."]'::jsonb,
    '14.55 น.',
    'เริ่ม 09.30 + รอบ 1 (1.30) = 11.00 + รอบ 2 (2.05) = 13.05 + รอบ 3 (1.50) = 14.55',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 15: Time calculation
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'time',
    'โจทย์ปัญหาเกี่ยวกับเวลา', 'medium',
    'ออกจากบ้าน 6.00 น. ไปสนามบิน 50 นาที, รอขึ้นเครื่อง 40 นาที, บินไปหาดใหญ่ 1 ชม. 10 นาที ถึงหาดใหญ่กี่โมง?',
    '["6.50 น.", "7.10 น.", "7.30 น.", "8.40 น."]'::jsonb,
    '8.40 น.',
    '6.00 + 50 นาที = 6.50 (ถึงสนามบิน) + 40 นาที = 7.30 (ขึ้นเครื่อง) + 1 ชม. 10 นาที = 8.40',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 16: Length measurement
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'measurement',
    'โจทย์ปัญหาความยาว', 'medium',
    'ดินสอมะลิ ยาว 15 ซม. 5 มม. ดินสอกุหลาบ สั้นกว่ามะลิ 5 ซม. 7 มม. ดินสอกุหลาบยาวเท่าไร?',
    '["5 ซม. 7 มม.", "9 ซม. 8 มม.", "10 ซม. 2 มม.", "15 ซม. 5 มม."]'::jsonb,
    '9 ซม. 8 มม.',
    '(15 ซม. 5 มม.) - (5 ซม. 7 มม.) = (14 ซม. 15 มม.) - (5 ซม. 7 มม.) = 9 ซม. 8 มม.',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 17: Height measurement
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'measurement',
    'โจทย์ปัญหาความยาว', 'easy',
    'ส่วนสูงไม่เกิน 135 ซม. เข้าฟรี ปอ: 1 ม. 28 ซม., อ๊อฟ: 1 ม. 38 ซม., อ้วน: เตี้ยกว่าอ๊อฟ 5 ซม. ใครเข้าฟรี?',
    '["ปอ และ อ๊อฟ", "อ๊อฟ และ อ้วน", "อ้วน และ ปอ", "ปอ อ๊อฟ และ อ้วน"]'::jsonb,
    'อ้วน และ ปอ',
    'ปอ: 128 ซม. (ฟรี), อ๊อฟ: 138 ซม. (ไม่ฟรี), อ้วน: 133 ซม. (ฟรี)',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 18: Distance comparison
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'measurement',
    'โจทย์ปัญหาความยาว', 'medium',
    'เส้นทาง A: 3 กม. 500 ม., เส้นทาง B: สั้นกว่า A 1,200 ม., เส้นทาง C: 2 กม. 500 ม. ข้อใดถูก?',
    '["B ยาว 2,375 ม.", "C ยาวกว่า B 175 ม.", "A ยาวกว่า C 1,000 ม.", "B สั้นกว่า C 1,200 ม."]'::jsonb,
    'A ยาวกว่า C 1,000 ม.',
    'A = 3,500 ม., B = 2,300 ม., C = 2,500 ม. A - C = 3,500 - 2,500 = 1,000 ม.',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 19: Length addition
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'measurement',
    'โจทย์ปัญหาความยาว', 'medium',
    'ดินสอ: 18 ซม. 5 มม. ยางลบ: สั้นกว่าดินสอ 15 ซม. 3 มม. วางต่อกันยาวเท่าไร?',
    '["3 ซม. 2 มม.", "15 ซม. 3 มม.", "21 ซม. 7 มม.", "33 ซม. 8 มม."]'::jsonb,
    '21 ซม. 7 มม.',
    'ยางลบยาว: 18.5 - 15.3 = 3 ซม. 2 มม. วางต่อกัน: 18 ซม. 5 มม. + 3 ซม. 2 มม. = 21 ซม. 7 มม.',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 20: Weight addition
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'measurement',
    'โจทย์ปัญหาน้ำหนัก', 'medium',
    'ผักกาดขาว: 26 กก. 500 ก. กะหล่ำปลี: หนักกว่าผักกาดขาว 9 กก. 700 ก. รวมกันหนักเท่าไร?',
    '["16 กก. 800 ก.", "26 กก. 500 ก.", "36 กก. 200 ก.", "62 กก. 700 ก."]'::jsonb,
    '62 กก. 700 ก.',
    'กะหล่ำปลี: 26.5 + 9.7 = 36 กก. 200 ก. รวมกัน: 26 กก. 500 ก. + 36 กก. 200 ก. = 62 กก. 700 ก.',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 21: Weight calculation
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'measurement',
    'โจทย์ปัญหาน้ำหนัก', 'hard',
    'รวม 3 ครั้ง: 42 กก. ครั้ง 1: 15 กก. 600 ก., ครั้ง 3: น้อยกว่าครั้ง 1 อยู่ 2,700 ก. ครั้ง 2 ยกได้เท่าไร?',
    '["28 กก. 500 ก.", "26 กก. 400 ก.", "13 กก. 500 ก.", "12 กก. 900 ก."]'::jsonb,
    '13 กก. 500 ก.',
    'ครั้ง 3 = 12 กก. 900 ก. รวมครั้ง 1+3 = 28 กก. 500 ก. ครั้ง 2 = 42 - 28.5 = 13 กก. 500 ก.',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 22: Volume comparison
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'measurement',
    'โจทย์ปัญหาปริมาตร', 'medium',
    'น้ำส้ม: 3 ลิตร, น้ำกระเจี๊ยบ: 1 ลิตร 700 มล., น้ำลำไย: 600 มล. (กระเจี๊ยบ + ลำไย) เทียบกับ น้ำส้ม เป็นอย่างไร?',
    '["น้อยกว่า 2 ลิตร 300 มล.", "มากกว่า 2 ลิตร 300 มล.", "น้อยกว่า 700 มล.", "มากกว่า 700 มล."]'::jsonb,
    'น้อยกว่า 700 มล.',
    'รวม: 1,700 + 600 = 2,300 มล. เทียบกับ 3,000 มล.: น้อยกว่า 700 มล.',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 23: Symmetry
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'shapes',
    'แกนสมมาตร', 'medium',
    'ป้ายจราจร รูปใดมีแกนสมมาตร 1 แกน? (รูป ก: ป้ายทางแยก, รูป ข: ป้ายทางเบี่ยง, รูป ค: ป้ายสี่แยก, รูป ง: ป้ายวงเวียน)',
    '["รูป ก", "รูป ข", "รูป ก และ รูป ค", "รูป ง"]'::jsonb,
    'รูป ก และ รูป ค',
    'รูป ก (ป้ายทางแยก) และ รูป ค (ป้ายสี่แยก) มีแกนสมมาตร 1 แกน',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 24: Pictograph
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'data_presentation',
    'แผนภูมิรูปภาพ', 'medium',
    'แผนภูมิไข่เก็บได้ (1 รูป = 5 ฟอง) อังคาร: 3 รูป, พุธ: 7 รูป, พฤหัส: 8 รูป (อังคาร+พุธ) ต่างกับ พฤหัส กี่ฟอง?',
    '["5", "10", "15", "20"]'::jsonb,
    '10',
    'อังคาร+พุธ: 10 รูป, พฤหัส: 8 รูป ต่างกัน: 2 รูป = 2 × 5 = 10 ฟอง',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 25: Pictograph
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'data_presentation',
    'แผนภูมิรูปภาพ', 'medium',
    'แผนภูมิกีฬา (1 รูป = 10 คน) รวมได้ 130 คน ฟุตบอล: 4 รูป, ว่ายน้ำ: 7 รูป, เทนนิส: 6 รูป, วอลเลย์: 8 รูป คู่ใดรวมกันได้ 13 รูป?',
    '["ว่ายน้ำกับเทนนิส", "ฟุตบอลกับเทนนิส", "เทนนิสกับวอลเลย์", "ว่ายน้ำกับวอลเลย์"]'::jsonb,
    'ว่ายน้ำกับเทนนิส',
    '130 คน = 13 รูป ว่ายน้ำ (7) + เทนนิส (6) = 13 รูป',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 26: Table reading
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'data_presentation',
    'ตารางทางเดียว', 'easy',
    'ตารางคะแนนวิชา: คณิต 32, วิทย์ 26, อังกฤษ 54, ศิลปะ 31 ข้อใดถูก?',
    '["วิทย์ > ศิลปะ", "ศิลปะ > อังกฤษ", "ภาษา < วิทย์ อยู่ 1", "คณิต > วิทย์ อยู่ 6"]'::jsonb,
    'คณิต > วิทย์ อยู่ 6',
    'คณิต - วิทย์ = 32 - 26 = 6 คะแนน',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 27: Short answer - money
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'word_problems',
    'โจทย์ปัญหาการบวก ลบ คูณ หารระคน', 'medium',
    'ขายเครื่องดื่มแก้วละ 40 บาท ขายชานม 50 แก้ว, กาแฟ 42 แก้ว รวมได้เงินเท่าไร?',
    '[]'::jsonb,
    '3,680',
    'รวมแก้ว: 50 + 42 = 92 แก้ว รวมเงิน: 92 × 40 = 3,680 บาท',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 28: Short answer - money shortage
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'money',
    'โจทย์ปัญหาเกี่ยวกับเงิน', 'medium',
    'มีเงิน: 1,000 x 2, 500 x 3, 100 x 5, 20 x 5 (รวม 4,100 บาท) ซื้อโทรศัพท์ 5,900 บาท ขาดเงินเท่าไร?',
    '[]'::jsonb,
    '1,800',
    'รวมเงินที่มี: 2,000 + 1,500 + 500 + 100 = 4,100 บาท ขาดเงิน: 5,900 - 4,100 = 1,800 บาท',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 29: Short answer - weight
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'measurement',
    'โจทย์ปัญหาน้ำหนัก', 'medium',
    'ม้า 8 ตัว กินตัวละ 5,000 กรัม (5 กก.) ต่อวัน 3 วัน กินรวมเท่าไร?',
    '[]'::jsonb,
    '120',
    'กินวันละ: 8 × 5 = 40 กก. 3 วันกิน: 40 × 3 = 120 กก.',
    true, ARRAY['ข้อสอบ NT 2566']
  );

  -- Question 30: Show work - multi-step
  INSERT INTO question_bank (admin_id, grade, semester, assessment_type, subject, skill_name, topic, difficulty, question_text, choices, correct_answer, explanation, is_system_question, tags)
  VALUES (
    v_admin_id, 3, NULL, 'nt', 'math', 'word_problems',
    'โจทย์ปัญหาการบวก ลบ คูณ หารระคน', 'medium',
    'ขายฝรั่ง กก. ละ 40 บาท วันแรก: 29 กก. วันที่สอง: 33 กก. รวมได้เงินเท่าไร? (แสดงวิธีทำ)',
    '[]'::jsonb,
    '2,480',
    'วิธีทำ: ขายฝรั่งวันแรกได้ 29 กิโลกรัม, ขายฝรั่งวันที่สองได้ 33 กิโลกรัม, รวมสองวันขายได้ 29 + 33 = 62 กิโลกรัม, ราคาขายกิโลกรัมละ 40 บาท, รวมได้เงิน 62 × 40 = 2,480 บาท',
    true, ARRAY['ข้อสอบ NT 2566']
  );

END $$;