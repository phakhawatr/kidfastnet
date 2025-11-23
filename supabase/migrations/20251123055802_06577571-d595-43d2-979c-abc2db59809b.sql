-- Insert NT Grade 3 2567 exam questions into system question bank
DO $$
DECLARE
  v_admin_id uuid;
BEGIN
  -- Get admin_id (first admin in system)
  SELECT id INTO v_admin_id FROM admins LIMIT 1;

  -- Question 1: Number comparison
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'number_comparison', 'math', 'การเปรียบเทียบและเรียงลำดับจำนวน', 
    'จำนวนประชากรใน 5 ตำบล: สามัคคี 16,049 คน, เอื้อเฟื้อ 7,624 คน, รวมใจ 92,140 คน, ใจบุญ 21,881 คน, เสียสละ 13,795 คน เมื่อเรียงลำดับจำนวนประชากรจากมากไปน้อย ตำบลใดมีประชากรน้อยเป็น 2 ตำบลสุดท้าย?',
    '["เสียสละ และ เอื้อเฟื้อ", "รวมใจ และ ใจบุญ", "ใจบุญ และ เสียสละ", "สามัคคี และ เอื้อเฟื้อ"]'::jsonb,
    'เสียสละ และ เอื้อเฟื้อ',
    'เรียงลำดับจากมากไปน้อย: รวมใจ (92,140) > ใจบุญ (21,881) > สามัคคี (16,049) > เสียสละ (13,795) > เอื้อเฟื้อ (7,624) ดังนั้น 2 ตำบลสุดท้าย (น้อยที่สุด) คือ เสียสละและเอื้อเฟื้อ',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 2: Fraction comparison
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'fractions', 'math', 'การเปรียบเทียบเศษส่วน',
    'ยอดขายน้ำผลไม้: น้ำผลไม้รวม 1/2 ลัง, น้ำส้ม 1/6 ลัง, น้ำลิ้นจี่ 1/3 ลัง, น้ำองุ่น 1/4 ลัง ขายชนิดใดได้มากที่สุด?',
    '["น้ำส้ม", "น้ำองุ่น", "น้ำลิ้นจี่", "น้ำผลไม้รวม"]'::jsonb,
    'น้ำผลไม้รวม',
    'เศษส่วนที่มีตัวเศษเท่ากัน (1): ตัวส่วนน้อยจะมีค่ามาก ดังนั้น 1/2 > 1/3 > 1/4 > 1/6 จึงขายน้ำผลไม้รวม (1/2) ได้มากที่สุด',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 3: Unknown values in equations
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'equations', 'math', 'การหาค่าตัวไม่ทราบค่าในประโยคสัญลักษณ์',
    'ประโยคสัญลักษณ์: ข้อ 1: 45,050 - □ = 22,150 และ ข้อ 2: □ + 12,200 = 35,250 คำตอบของนักเรียน - นิด: 22,900, แก้ม: 27,450, หน่อย: 23,900, แก้ว: 23,050 คำตอบของใครถูกต้องทั้งหมด?',
    '["นิด และ แก้ม", "นิด และ แก้ว", "หน่อย และ แก้ม", "หน่อย และ แก้ว"]'::jsonb,
    'นิด และ แก้ว',
    'ข้อ 1: หาตัวลบ 45,050 - 22,150 = 22,900 (นิดถูก) ข้อ 2: หาตัวตั้ง 35,250 - 12,200 = 23,050 (แก้วถูก)',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 4: Multiplication with unknowns
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'multiplication', 'math', 'การหาค่าตัวไม่ทราบค่าในประโยคสัญลักษณ์การคูณ',
    'นักเรียนตอบ: กุ้ง: 7 × □ = 630 (ตอบ 80), เจน: □ × 8 = 72 (ตอบ 9), บอส: 8 × □ = 560 (ตอบ 70), น้ำ: □ × 12 = 720 (ตอบ 6) ใครตอบถูกต้องทั้งหมด?',
    '["กุ้ง และ เจน", "เจน และ บอส", "บอส และ น้ำ", "น้ำ และ กุ้ง"]'::jsonb,
    'เจน และ บอส',
    'กุ้ง: 630÷7=90 (ผิด), เจน: 72÷8=9 (ถูก), บอส: 560÷8=70 (ถูก), น้ำ: 720÷12=60 (ผิด)',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 5: Multi-step word problem
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'word_problems', 'math', 'โจทย์ปัญหาการบวก ลบ คูณ หาร',
    'โทรทัศน์ราคา 9,870 บาท, หม้อหุงข้าราคา 1,250 บาท ซื้ออย่างละ 1 ชิ้นแล้วเหลือเงิน 2,430 บาท เดิมมีเงินกี่บาท? ข้อใดแสดงวิธีหาคำตอบถูกต้อง?',
    '["(9,870 + 1,250) + 2,430", "(9,870 + 1,250) - 2,430", "9,870 × (2,430 - 1,250)", "9,870 - (2,430 + 1,250)"]'::jsonb,
    '(9,870 + 1,250) + 2,430',
    'เงินเดิม = เงินที่จ่ายไป + เงินที่เหลือ = (ค่าโทรทัศน์ + ค่าหม้อหุงข้าว) + เงินทอน',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 6: Division word problem
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'word_problems', 'math', 'โจทย์ปัญหาการบวกและการหาร',
    'ร้านค้ามีลูกชิ้นไก่ 50 กิโลกรัม มีลูกชิ้นปลามากกว่าลูกชิ้นไก่ 70 กิโลกรัม แบ่งลูกชิ้นปลาใส่ถุงถุงละ 5 กิโลกรัม จะได้กี่ถุง?',
    '["4", "10", "14", "24"]'::jsonb,
    '24',
    'ปริมาณลูกชิ้นปลา: 50 + 70 = 120 กก. จำนวนถุง: 120 ÷ 5 = 24 ถุง',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 7: Multi-step calculation
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'word_problems', 'math', 'โจทย์ปัญหาการหารและการคูณ',
    'เชือกยาว 300 เมตร ตัดแบ่งเส้นละ 2 เมตร ขายเส้นละ 10 บาท ขายหมดจะได้เงินเท่าไร?',
    '["1,500", "2,980", "3,000", "6,000"]'::jsonb,
    '1,500',
    'จำนวนเส้น: 300 ÷ 2 = 150 เส้น เงินที่ได้: 150 × 10 = 1,500 บาท',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 8: Fraction subtraction
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'easy', 'fractions', 'math', 'การบวกและลบเศษส่วน',
    'ขนมชั้น 1 ถาด แบ่งให้นิด 3/8 ถาด ให้นัท 2/8 ถาด เหลือขนมเท่าใด?',
    '["1/8", "5/8", "3/8", "8/8"]'::jsonb,
    '3/8',
    'ให้ไปทั้งหมด: 3/8 + 2/8 = 5/8 เหลือ: 8/8 - 5/8 = 3/8',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 9: Fraction operations
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'easy', 'fractions', 'math', 'การบวกและลบเศษส่วน',
    'น้ำยาล้างจาน 1 ถัง วันแรกขาย 13/29 ถัง วันที่สองขาย 7/29 ถัง เหลือเท่าใด?',
    '["6/29", "9/29", "20/29", "22/29"]'::jsonb,
    '9/29',
    'ขายไปทั้งหมด: 13/29 + 7/29 = 20/29 เหลือ: 29/29 - 20/29 = 9/29',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 10: Number patterns
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'patterns', 'math', 'แบบรูปของจำนวน',
    'เงินออมของกระต่าย: เริ่มต้น 405, วันที่ 1: 450, วันที่ 2: 495 เงินวันที่ 3 และวันที่ 5 รวมกันได้เท่าไร?',
    '["630", "1,080", "1,125", "1,170"]'::jsonb,
    '1,170',
    'เพิ่มทีละ 45: วันที่ 3 = 540, วันที่ 4 = 585, วันที่ 5 = 630 รวม: 540 + 630 = 1,170',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 11: Number patterns with gaps
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'hard', 'patterns', 'math', 'แบบรูปของจำนวน',
    'จำนวนการผลิตน้ำดื่ม: วันที่ 1: 5,350, วันที่ 3: 6,050, วันที่ 4: 6,400, วันที่ 5: 6,750 วันที่ 6 มากกว่าวันที่ 2 กี่ขวด?',
    '["350", "700", "1,400", "1,750"]'::jsonb,
    '1,400',
    'เพิ่มทีละ 350: วันที่ 2 = 5,700, วันที่ 6 = 7,100 ผลต่าง: 7,100 - 5,700 = 1,400',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 12: Money problem
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'easy', 'money', 'math', 'โจทย์ปัญหาเกี่ยวกับเงิน',
    'วิชัยมีเงิน: 100 บาท 2 ฉบับ, 50 บาท 3 ฉบับ, 20 บาท 5 ฉบับ, 10 บาท 3 เหรียญ (รวม 480 บาท) ต้องการซื้อชุดกีฬา 550 บาท ต้องเก็บเงินเพิ่มเท่าไร?',
    '["70", "100", "130", "180"]'::jsonb,
    '70',
    'ต้องเก็บเพิ่ม: 550 - 480 = 70 บาท',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 13: Time table reading
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'hard', 'time', 'math', 'โจทย์ปัญหาเกี่ยวกับเวลา',
    'ตารางรถไฟ: ช่วง 1 (09.05-11.37), ช่วง 2 (11.40-13.12), ช่วง 3 (13.22-17.30), ช่วง 4 (17.33-19.30) เวลาจอดพัก: นครสวรรค์ 3 นาที, พิษณุโลก 10 นาที, ลำปาง 3 นาที ข้อใดสรุปถูกต้อง?',
    '["รถไฟจอดที่สถานีพิษณุโลกใช้เวลามากที่สุด", "ช่วง 2 ใช้เวลาเดินทางมากที่สุด", "ช่วง 3 ใช้เวลาเดินทางน้อยที่สุด", "เดินทางจากต้นทางถึงปลายทางใช้เวลา 10 ชม. 35 นาที"]'::jsonb,
    'รถไฟจอดที่สถานีพิษณุโลกใช้เวลามากที่สุด',
    'รถไฟจอดที่พิษณุโลก 10 นาที นานกว่าสถานีอื่น (3 นาที)',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 14: Time calculation
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'time', 'math', 'โจทย์ปัญหาเกี่ยวกับเวลา',
    'รถบรรทุกเริ่มงาน 09.30 น. ทำรอบ 1: 1 ชม. 30 น., รอบ 2: 2 ชม. 5 น., รอบ 3: 1 ชม. 50 น. เสร็จงานเวลาใด?',
    '["13.55 น.", "14.15 น.", "14.55 น.", "15.40 น."]'::jsonb,
    '14.55 น.',
    'รวมเวลา: 5 ชม. 25 น. เริ่ม 09.30 + 5:25 = 14.55 น.',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 15: Time addition
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'easy', 'time', 'math', 'โจทย์ปัญหาเกี่ยวกับเวลา',
    'เริ่มทำการบ้าน 19.10 น. ทำการบ้าน 40 นาที ดูโทรทัศน์ 30 นาที เข้านอนเวลาใด?',
    '["19.10 น.", "19.40 น.", "20.20 น.", "20.30 น."]'::jsonb,
    '20.20 น.',
    'เสร็จการบ้าน: 19.50 น. ดูทีวีจบ: 19.50 + 30 น. = 20.20 น.',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 16: Length addition
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'measurement', 'math', 'โจทย์ปัญหาความยาว',
    'เทคอนกรีต วันแรก: 145 ม. 75 ซม., วันที่สอง: 315 ม. 50 ซม. รวม 2 วันได้ระยะทางเท่าไร?',
    '["169 ม. 75 ซม.", "170 ม. 75 ซม.", "460 ม. 25 ซม.", "461 ม. 25 ซม."]'::jsonb,
    '461 ม. 25 ซม.',
    'ซม.: 75 + 50 = 125 ซม. = 1 ม. 25 ซม. ม.: 145 + 315 = 460 รวม: 461 ม. 25 ซม.',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 17: Length comparison
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'measurement', 'math', 'การเปรียบเทียบความยาว',
    'ระยะทางปั่นจักรยาน: สมศักดิ์ 24,700 ม., สมชาย 25 กม. 200 ม., สมภพ 24 กม. 100 ม., สมภูมิ 25,700 ม. ระยะทางมากที่สุดและน้อยที่สุดต่างกันกี่เมตร?',
    '["1,600", "1,000", "600", "500"]'::jsonb,
    '1,600',
    'มากสุด: 25,700 ม. น้อยสุด: 24,100 ม. ผลต่าง: 25,700 - 24,100 = 1,600 ม.',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 18: Division with units
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'hard', 'measurement', 'math', 'โจทย์ปัญหาความยาว',
    'โซน A: ยาว 800 ม. ร้านละ 500 ซม. (5 ม.) โซน B: ยาว 600 ม. ร้านละ 4 ม. ข้อใดถูกต้อง?',
    '["โซน A น้อยกว่าโซน B 10 ร้าน", "โซน A มากกว่าโซน B 10 ร้าน", "โซน A น้อยกว่าโซน B 80 ร้าน", "โซน A มากกว่าโซน B 80 ร้าน"]'::jsonb,
    'โซน A มากกว่าโซน B 10 ร้าน',
    'โซน A: 800÷5 = 160 ร้าน โซน B: 600÷4 = 150 ร้าน ผลต่าง: 10 ร้าน',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 19: Weight subtraction
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'measurement', 'math', 'โจทย์ปัญหาน้ำหนัก',
    'ส้ม: 4 กก. 300 ก., มังคุด: 4 กก. ครึ่ง, รวมหนัก 14 กก. มะม่วงหนักเท่าไร?',
    '["5 กก. 700 ก.", "5 กก. 200 ก.", "6 กก. 800 ก.", "6 กก. 300 ก."]'::jsonb,
    '5 กก. 200 ก.',
    'ส้ม + มังคุด: 4.300 + 4.500 = 8 กก. 800 ก. มะม่วง: 14.000 - 8.800 = 5 กก. 200 ก.',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 20: Weight addition
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'measurement', 'math', 'โจทย์ปัญหาน้ำหนัก',
    'วันที่ 1: 15 ตัน 600 กก., วันที่ 2: น้อยกว่าวันที่ 1 อยู่ 2 ตัน 300 กก. รวม 2 วันได้เท่าไร?',
    '["13 ตัน 300 กก.", "17 ตัน 900 กก.", "28 ตัน 900 กก.", "33 ตัน 500 กก."]'::jsonb,
    '28 ตัน 900 กก.',
    'วันที่ 2: 13 ตัน 300 กก. รวม: 15.600 + 13.300 = 28 ตัน 900 กก.',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 21: Volume addition
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'measurement', 'math', 'โจทย์ปัญหาปริมาตร',
    'แก้วจุ 250 มล. เทใส่แก้ว 2 ใบ เหลือในเหยือก 600 มล. เดิมมีน้ำตาลสดเท่าไร?',
    '["850 มล.", "1,000 มล.", "1,100 มล.", "1,350 มล."]'::jsonb,
    '1,100 มล.',
    'เทไป: 250 × 2 = 500 มล. เดิมมี: 500 + 600 = 1,100 มล.',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 22: Volume multiplication
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'easy', 'measurement', 'math', 'โจทย์ปัญหาปริมาตร',
    'กะทิ A: 250 มล. (4 กล่อง), กะทิ B: 500 มล. (4 กล่อง) รวมปริมาตรทั้งหมดเท่าไร?',
    '["1 ลิตร 500 มล.", "2 ลิตร", "2 ลิตร 250 มล.", "3 ลิตร"]'::jsonb,
    '3 ลิตร',
    'กะทิ A: 250×4 = 1,000 มล. กะทิ B: 500×4 = 2,000 มล. รวม: 3,000 มล. = 3 ลิตร',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 23: Symmetry
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'shapes', 'math', 'แกนสมมาตร',
    'รูปใดมีแกนสมมาตรมากที่สุด? มิว (สามเหลี่ยม): 1 แกน, แก้ม (สี่เหลี่ยมจัตุรัสมีรูป): 4 แกน, โอปอ (สี่เหลี่ยมมีวงรี): 2 แกน, ใบเตย (สี่เหลี่ยมผืนผ้า): 2 แกน',
    '["มิว", "แก้ม", "โอปอ", "ใบเตย"]'::jsonb,
    'แก้ม',
    'รูปของแก้มมีแกนสมมาตร 4 แกน มากกว่ารูปอื่น',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 24: Pictograph interpretation
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'data', 'math', 'แผนภูมิรูปภาพ',
    '1 รูป = 5 ดอก มีทั้งหมด 90 ดอก แปลง 1: 6 รูป, แปลง 3: 4 รูป, แปลง 4: 5 รูป แปลงที่ 2 มีกี่รูป?',
    '["3", "5", "15", "18"]'::jsonb,
    '3',
    'แปลง 1+3+4: 30+20+25 = 75 ดอก แปลง 2: 90-75 = 15 ดอก = 15÷5 = 3 รูป',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 25: Pictograph comparison
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'data', 'math', 'แผนภูมิรูปภาพ',
    '1 รูป = 10 ผล แก้วขมิ้น: 5 รูป, อกร่อง: 4 รูป, น้ำดอกไม้: 3 รูป, เขียวเสวย: 6 รูป (อกร่อง + เขียวเสวย) เทียบกับ (แก้วขมิ้น + น้ำดอกไม้) ต่างกันอย่างไร?',
    '["น้อยกว่า 30 ผล", "น้อยกว่า 10 ผล", "มากกว่า 20 ผล", "มากกว่า 40 ผล"]'::jsonb,
    'มากกว่า 20 ผล',
    'กลุ่มแรก: 40+60 = 100 ผล กลุ่มสอง: 50+30 = 80 ผล ผลต่าง: 100-80 = 20 ผล (มากกว่า)',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 26: Table reading
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'data', 'math', 'ตารางทางเดียว',
    'เงินออม 5 คน: สายฟ้า 415, พายุ 328, ลมหนาว 395, เนตรดาว 429, รวม 2,000 บาท น้ำฝนออมได้เท่าไร?',
    '["467", "447", "433", "419"]'::jsonb,
    '433',
    'รวม 4 คน: 415+328+395+429 = 1,567 น้ำฝน: 2,000-1,567 = 433 บาท',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 27: Short answer - profit calculation
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'medium', 'word_problems', 'math', 'โจทย์ปัญหาการคูณ ลบ',
    'ซื้อมา 400 บาท แบ่งใส่ถุงได้ 25 ถุง ขายถุงละ 20 บาท ได้กำไรเท่าไร?',
    '["100"]'::jsonb,
    '100',
    'เงินที่ขายได้: 25 × 20 = 500 บาท กำไร: 500 - 400 = 100 บาท',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 28: Short answer - money subtraction
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'easy', 'money', 'math', 'โจทย์ปัญหาเกี่ยวกับเงิน',
    'เงินในกระเป๋า: 1,000×2, 500×1, 100×2, 20×3, 10×1, 5×1 (รวม 2,775 บาท) ให้รางวัล 150 บาท เหลือเท่าไร?',
    '["2625"]'::jsonb,
    '2625',
    '2,775 - 150 = 2,625 บาท',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 29: Short answer - weight addition
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'easy', 'measurement', 'math', 'โจทย์ปัญหาน้ำหนัก',
    'ตะกร้า+ผลไม้: 2 กก. 500 ก. ใส่เพิ่ม: เขียวเสวย 350 ก., แก้วขมิ้น 300 ก. น้ำหนักรวมใหม่เท่าไร?',
    '["3150"]'::jsonb,
    '3150',
    '2,500 + 350 + 300 = 3,150 กรัม (หรือ 3 กก. 150 ก.)',
    ARRAY['ข้อสอบ NT 2567']);

  -- Question 30: Show work - multi-step money problem
  INSERT INTO question_bank (admin_id, is_system_question, grade, assessment_type, difficulty, skill_name, subject, topic, question_text, choices, correct_answer, explanation, tags)
  VALUES (v_admin_id, true, 3, 'nt', 'hard', 'money', 'math', 'โจทย์ปัญหาเกี่ยวกับเงิน',
    'สุชาติ: 275.25 บาท, นารี: มากกว่าสุชาติ 146.25 บาท, สุดา: น้อยกว่านารี 79.75 บาท สุดามีเงินเท่าไร?',
    '["341.75"]'::jsonb,
    '341.75',
    'หานารี: 275.25 + 146.25 = 421.50 บาท หาสุดา: 421.50 - 79.75 = 341.75 บาท',
    ARRAY['ข้อสอบ NT 2567']);

END $$;