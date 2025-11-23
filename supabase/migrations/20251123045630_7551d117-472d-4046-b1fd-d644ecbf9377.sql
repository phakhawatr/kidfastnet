-- Insert 51 volume/capacity word problems for Grade 2 Semester 1 into question bank
-- Skill: การตวง (Volume and Capacity)

DO $$
DECLARE
  admin_uuid UUID;
BEGIN
  -- Get an admin_id from the admins table
  SELECT id INTO admin_uuid FROM admins LIMIT 1;

  -- Problem 1: Adding volumes (different units - convert first)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'ขวดน้ำของอารียา จุน้ำได้ 4 ลิตร ขวดของมานี จุน้ำได้ 3,000 มิลลิลิตร รวมกันจุได้กี่ลิตร',
    '7',
    '["5", "6", "7", "8"]'::jsonb,
    'โจทย์ถามหาผลรวม ต้องแปลงหน่วยให้เหมือนกันก่อน: 3,000 มล. = 3 ลิตร แล้วบวก 4 + 3 = 7 ลิตร',
    'easy', true
  );

  -- Problem 2: Adding volumes (convert ml to L)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'แม่ทำน้ำส้ม 18 ลิตร ทำเพิ่มอีก 15,000 มิลลิลิตร รวมทั้งหมดกี่ลิตร',
    '33',
    '["30", "31", "33", "35"]'::jsonb,
    '"ทำเพิ่ม" คือการบวก แปลง 15,000 มล. = 15 ลิตร จากนั้น 18 + 15 = 33 ลิตร',
    'easy', true
  );

  -- Problem 3: Finding less amount (subtraction)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'เมื่อวานขายได้ 28 ลิตร วันนี้ขายได้น้อยกว่าเมื่อวาน 8 ลิตร วันนี้ขายได้กี่ลิตร',
    '20',
    '["18", "20", "22", "24"]'::jsonb,
    'โจทย์บอกค่ามาก (28) และส่วนต่าง (น้อยกว่า 8) หาค่าน้อย ใช้วิธีลบ: 28 - 8 = 20 ลิตร',
    'medium', true
  );

  -- Problem 4: Finding initial amount
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'ถังจุ 50 ลิตร เติมน้ำไป 32 ลิตรเต็มพอดี เดิมมีน้ำเท่าไร',
    '18',
    '["15", "16", "18", "20"]'::jsonb,
    'ความจุถัง (50) = น้ำเดิม + น้ำที่เติม (32) ดังนั้น น้ำเดิม = 50 - 32 = 18 ลิตร',
    'medium', true
  );

  -- Problem 5: Finding original amount (used + remaining)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'ใช้น้ำไป 62 ลิตร เหลือ 48 ลิตร เดิมมีน้ำกี่ลิตร',
    '110',
    '["105", "108", "110", "112"]'::jsonb,
    'หาปริมาณเดิม ต้องนำส่วนที่ใช้ไป (62) รวมกับส่วนที่เหลือ (48) = 110 ลิตร',
    'medium', true
  );

  -- Problem 6: Multiplication (bags × capacity)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'ข้าวเปลือก 7 ถุง ถุงละ 15 ลิตร มีข้าวเปลือกทั้งหมดกี่ลิตร',
    '105',
    '["90", "100", "105", "110"]'::jsonb,
    'มีจำนวนกลุ่ม (7 ถุง) สมาชิกในกลุ่มเท่ากัน (15 ลิตร) หาจำนวนรวม ใช้การคูณ: 7 × 15 = 105 ลิตร',
    'medium', true
  );

  -- Problem 7: Multiplication (days × daily amount)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'เลี้ยงแมว 50 วัน วันละ 4 ลิตร ใช้อาหารทั้งหมดกี่ลิตร',
    '200',
    '["180", "190", "200", "210"]'::jsonb,
    'การเพิ่มขึ้นทีละเท่ากัน (วันละ 4) จำนวน 50 ครั้ง ใช้การคูณ: 50 × 4 = 200 ลิตร',
    'medium', true
  );

  -- Problem 8: Multiplication (bottles × capacity)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'น้ำมันถั่วเหลือง 12 ขวด ขวดละ 3 ลิตร รวมกี่ลิตร',
    '36',
    '["32", "34", "36", "38"]'::jsonb,
    'การนับเพิ่มครั้งละเท่ากัน (12 ครั้ง ครั้งละ 3) คือการคูณ: 12 × 3 = 36 ลิตร',
    'easy', true
  );

  -- Problem 9: Division (equal sharing)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'นมสด 45 ลิตร แบ่งใส่ 9 ห้องเท่าๆ กัน ได้ห้องละกี่ลิตร',
    '5',
    '["4", "5", "6", "7"]'::jsonb,
    '"แบ่งใส่...เท่าๆ กัน" คือการหาร นำจำนวนทั้งหมดหารด้วยจำนวนกลุ่ม: 45 ÷ 9 = 5 ลิตร',
    'medium', true
  );

  -- Problem 10: Division (finding unit rate)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'นมถั่วเหลืองเลี้ยงคน 80 คน ใช้ 8 ลิตร (เฉลี่ยเท่ากัน) นมถั่วเหลือง 1 ลิตรเลี้ยงได้กี่คน',
    '10',
    '["8", "9", "10", "12"]'::jsonb,
    'เทียบอัตราส่วน: 8 ลิตรเลี้ยง 80 คน ดังนั้น 1 ลิตร = 80 ÷ 8 = 10 คน',
    'hard', true
  );

  -- Problem 11: Division (grouping)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'น้ำส้ม 35 ลิตร แบ่งใส่หม้อ หม้อละ 7 ลิตร ได้กี่หม้อ',
    '5',
    '["4", "5", "6", "7"]'::jsonb,
    'แบ่งของทั้งหมด (35) เป็นกอง กองละเท่ากัน (7) หาจำนวนกอง ใช้การหาร: 35 ÷ 7 = 5 หม้อ',
    'medium', true
  );

  -- Problem 12: Adding with difference
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'ถังแรกจุ 18 ลิตร ถังสองจุมากกว่า 4 ลิตร ถังสองจุเท่าไร',
    '22',
    '["20", "21", "22", "24"]'::jsonb,
    'ถังสอง "มากกว่า" ถังแรก จึงต้องนำส่วนต่างมาบวกเพิ่ม: 18 + 4 = 22 ลิตร',
    'medium', true
  );

  -- Problem 13: Finding missing amount to fill
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'ปีบจุ 9 ลิตร มีน้ำมัน 3 ลิตร ต้องเติมอีกเท่าไรถึงเต็ม',
    '6',
    '["5", "6", "7", "8"]'::jsonb,
    'หาส่วนที่ขาด โดยเอาความจุทั้งหมด (9) ลบด้วยที่มีอยู่ (3): 9 - 3 = 6 ลิตร',
    'easy', true
  );

  -- Problem 14: Division (repeated subtraction)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'น้ำ 24 ลิตร ตักออกครั้งละ 4 ลิตร ตักกี่ครั้งจึงหมด',
    '6',
    '["5", "6", "7", "8"]'::jsonb,
    'การลดลงทีละเท่ากัน จนหมด คือความหมายของการหาร: 24 ÷ 4 = 6 ครั้ง',
    'medium', true
  );

  -- Problem 15: Adding different sized bottles
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'ขวด 3 ลิตร และ 4 ลิตร อย่างละ 1 ขวด เติมน้ำเต็มต้องใช้น้ำกี่ลิตร',
    '7',
    '["6", "7", "8", "9"]'::jsonb,
    'หาปริมาตรรวมของขวดทั้งสองใบ: 3 + 4 = 7 ลิตร',
    'easy', true
  );

  -- Problem 16: Multiplication (boxes × volume)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'น้ำผลไม้ 3 ลิตร จำนวน 9 กล่อง รวมกี่ลิตร',
    '27',
    '["24", "25", "27", "30"]'::jsonb,
    'ปริมาณเท่ากัน (3 ลิตร) จำนวน 9 ครั้ง ใช้การคูณ: 3 × 9 = 27 ลิตร',
    'medium', true
  );

  -- Problem 17: Division (grouping into jugs)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'น้ำ 26 ลิตร แบ่งใส่เหยือกละ 2 ลิตร ได้กี่เหยือก',
    '13',
    '["11", "12", "13", "14"]'::jsonb,
    'การจัดกลุ่ม กลุ่มละเท่ากัน (กลุ่มละ 2) หาจำนวนกลุ่ม ใช้การหาร: 26 ÷ 2 = 13 เหยือก',
    'medium', true
  );

  -- Problem 18: Multiplication (boxes × volume)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'นม 3 ลิตร 6 กล่อง รวมกี่ลิตร',
    '18',
    '["15", "16", "18", "20"]'::jsonb,
    'การคูณจำนวนกล่อง (6) กับปริมาณต่อกล่อง (3): 3 × 6 = 18 ลิตร',
    'easy', true
  );

  -- Problem 19: Adding tablespoons (ingredients)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'น้ำมะนาว 5 ช้อนโต๊ะ น้ำผึ้ง 4 ช้อนโต๊ะ รวมกี่ช้อนโต๊ะ',
    '9',
    '["7", "8", "9", "10"]'::jsonb,
    'หาผลรวมของส่วนผสมทั้งสองอย่าง: 5 + 4 = 9 ช้อนโต๊ะ',
    'easy', true
  );

  -- Problem 20: Subtraction (sharing/giving away)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'ข้าวสาร 50 ลิตร แบ่งให้น้า 25 ลิตร เหลือเท่าไร',
    '25',
    '["20", "22", "25", "28"]'::jsonb,
    '"แบ่งให้" คือการหักออก ใช้การลบ: 50 - 25 = 25 ลิตร',
    'easy', true
  );

  -- Problem 21: Multiplication (jars × capacity)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'โอ่ง 4 ใบ ใบละ 11 ลิตร รวมกี่ลิตร',
    '44',
    '["40", "42", "44", "48"]'::jsonb,
    'จำนวนกลุ่ม (4) คูณด้วยสมาชิกในกลุ่ม (11): 4 × 11 = 44 ลิตร',
    'medium', true
  );

  -- Problem 22: Two-step problem (subtraction + multiplication)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'ซื้อข้าว 70 ลิตร ขายไป 45 ลิตร ขายลิตรละ 6 บาท ได้เงินกี่บาท เหลือข้าวกี่ลิตร',
    'ได้เงิน 270 บาท เหลือข้าว 25 ลิตร',
    '["ได้เงิน 250 บาท เหลือข้าว 25 ลิตร", "ได้เงิน 270 บาท เหลือข้าว 20 ลิตร", "ได้เงิน 270 บาท เหลือข้าว 25 ลิตร", "ได้เงิน 300 บาท เหลือข้าว 25 ลิตร"]'::jsonb,
    'ข้าวที่เหลือ: 70 - 45 = 25 ลิตร / เงินที่ได้: 45 × 6 = 270 บาท',
    'hard', true
  );

  -- Problem 23: Multiplication (thermoses × capacity)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'กระติก 4 ลิตร 30 ใบ ใช้น้ำกี่ลิตร',
    '120',
    '["100", "110", "120", "130"]'::jsonb,
    'การคูณจำนวนใบ (30) กับความจุต่อใบ (4): 30 × 4 = 120 ลิตร',
    'medium', true
  );

  -- Problem 24: Multiplication (glasses × spoons per glass)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'น้ำมะนาว 1 แก้วใช้ 8 ช้อนโต๊ะ ทำ 15 แก้ว ใช้กี่ช้อนโต๊ะ',
    '120',
    '["100", "110", "120", "130"]'::jsonb,
    'เพิ่มขึ้นทีละเท่ากัน (8) จำนวน 15 ครั้ง ใช้การคูณ: 15 × 8 = 120 ช้อนโต๊ะ',
    'medium', true
  );

  -- Problem 25: Division (equal portions in jugs)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'น้ำ 40 ลิตร แบ่งใส่เหยือกละ 5 ลิตร ได้กี่เหยือก',
    '8',
    '["6", "7", "8", "9"]'::jsonb,
    'แบ่งของทั้งหมดเป็นกลุ่มย่อยเท่ากัน ใช้การหาร: 40 ÷ 5 = 8 เหยือก',
    'medium', true
  );

  -- Problem 26: Finding remaining capacity
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'โอ่งจุ 300 ลิตร มีน้ำอยู่ 55 ลิตร เติมได้อีกเท่าไร',
    '245',
    '["235", "240", "245", "250"]'::jsonb,
    'หาพื้นที่ว่างที่เหลือ: ความจุเต็ม - ที่มีอยู่ = 300 - 55 = 245 ลิตร',
    'medium', true
  );

  -- Problem 27: Subtraction (scooping out)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'ถังจุ 30 ขัน ตักออก 19 ขัน เหลือเท่าไร',
    '11',
    '["9", "10", "11", "12"]'::jsonb,
    'การนำออกไปคือการลบ: 30 - 19 = 11 ขัน',
    'easy', true
  );

  -- Problem 28: Subtraction (giving to friends)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'มี 22 ลิตร แจกเพื่อน 8 ลิตร เหลือเท่าไร',
    '14',
    '["12", "13", "14", "15"]'::jsonb,
    'แจกให้ไป ของลดลง ใช้การลบ: 22 - 8 = 14 ลิตร',
    'easy', true
  );

  -- Problem 29: Adding water used for different purposes
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'อาบน้ำหมา 35 ลิตร ซักผ้า 60 ลิตร น้ำหมดถังพอดี ถังจุเท่าไร',
    '95',
    '["85", "90", "95", "100"]'::jsonb,
    'ปริมาณที่ใช้ไปทั้งหมด เท่ากับน้ำที่มีอยู่เต็มถังตอนแรก: 35 + 60 = 95 ลิตร',
    'medium', true
  );

  -- Problem 30: Finding original amount (used + remaining)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'ใช้ไป 5 ลิตร เหลือ 21 ลิตร เดิมมีเท่าไร',
    '26',
    '["24", "25", "26", "27"]'::jsonb,
    'หาของเดิมก่อนใช้ ต้องนำส่วนที่ใช้ไปรวมกับส่วนที่เหลือ: 5 + 21 = 26 ลิตร',
    'medium', true
  );

  -- Problem 31: Finding difference
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'มด 40 ลิตร แดง 19 ลิตร แดงน้อยกว่ามดเท่าไร',
    '21',
    '["19", "20", "21", "22"]'::jsonb,
    'การเปรียบเทียบหาความต่าง ("น้อยกว่าอยู่เท่าไร") ใช้การลบ: 40 - 19 = 21 ลิตร',
    'medium', true
  );

  -- Problem 32: Finding additional amount needed
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'มี 32 ลิตร ต้องการ 60 ลิตร หาเพิ่มเท่าไร',
    '28',
    '["25", "26", "28", "30"]'::jsonb,
    'หาความต่างระหว่างสิ่งที่ต้องการกับสิ่งที่มีอยู่: 60 - 32 = 28 ลิตร',
    'medium', true
  );

  -- Problem 33: Finding amount to add to fill
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'ถังจุ 150 ลิตร มีอยู่ 85 ลิตร เติมอีกเท่าไร',
    '65',
    '["60", "62", "65", "68"]'::jsonb,
    'นำความจุเต็ม ลบด้วยปริมาณที่มีอยู่: 150 - 85 = 65 ลิตร',
    'medium', true
  );

  -- Problem 34: Mixing liquids (addition)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'น้ำแดง 18 ลิตร โซดา 10 ลิตร ผสมกันได้กี่ลิตร',
    '28',
    '["25", "26", "28", "30"]'::jsonb,
    'การนำมารวมกันคือการบวก: 18 + 10 = 28 ลิตร',
    'easy', true
  );

  -- Problem 35: Pouring into another container
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'ปีบมี 16 ลิตร เทใส่ขวด 7 ลิตร เหลือในปีบเท่าไร',
    '9',
    '["7", "8", "9", "10"]'::jsonb,
    'แบ่งออกไปใส่ที่อื่น ปริมาณเดิมจะลดลง ใช้การลบ: 16 - 7 = 9 ลิตร',
    'easy', true
  );

  -- Problem 36: Adding ingredients (spoons)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'กระเทียม 35 ช้อน รากผักชี 35 ช้อน รวมเป็นส่วนผสมกี่ช้อน',
    '70',
    '["65", "68", "70", "72"]'::jsonb,
    'หาผลรวมของส่วนผสม: 35 + 35 = 70 ช้อนโต๊ะ',
    'easy', true
  );

  -- Problem 37: Subtraction (using water)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'มี 25 ลิตร ใช้ไป 9 ลิตร เหลือเท่าไร',
    '16',
    '["14", "15", "16", "17"]'::jsonb,
    'การใช้ไปทำให้ลดลง ใช้การลบ: 25 - 9 = 16 ลิตร',
    'easy', true
  );

  -- Problem 38: Finding smaller amount (less than)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'ถังใหญ่ 22 ลิตร ถังเล็กน้อยกว่าถังใหญ่ 7 ลิตร ถังเล็กมีกี่ลิตร',
    '15',
    '["13", "14", "15", "16"]'::jsonb,
    'ถังเล็กมีค่าน้อยกว่า จึงเอาค่าถังใหญ่ลบด้วยส่วนต่าง: 22 - 7 = 15 ลิตร',
    'medium', true
  );

  -- Problem 39: Finding larger amount (more than)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'มันเชื่อม 14 ถ้วย ฟักทองเชื่อมใช้มากกว่า 8 ถ้วย ฟักทองใช้กี่ถ้วย',
    '22',
    '["20", "21", "22", "24"]'::jsonb,
    'ฟักทองมีค่ามากกว่า จึงเอาค่าของมันเชื่อมบวกด้วยส่วนต่าง: 14 + 8 = 22 ถ้วยตวง',
    'medium', true
  );

  -- Problem 40: Finding smaller amount (more than reversed)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'ดีเซล 30 ลิตร ดีเซลมากกว่าเบนซิน 10 ลิตร เบนซินกี่ลิตร',
    '20',
    '["18", "19", "20", "22"]'::jsonb,
    'โจทย์บอก ดีเซล(30) มากกว่า เบนซิน แสดงว่า เบนซินน้อยกว่า จึงลบ: 30 - 10 = 20 ลิตร',
    'medium', true
  );

  -- Problem 41: Addition (adding more)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'มี 19 ลิตร เติมอีก 10 ลิตร รวมเท่าไร',
    '29',
    '["27", "28", "29", "30"]'::jsonb,
    'เติมเข้ามารวมกัน คือการบวก: 19 + 10 = 29 ลิตร',
    'easy', true
  );

  -- Problem 42: Finding smaller amount (less than)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'กล้วยบวชชี 16 ถ้วย สาคูน้อยกว่า 9 ถ้วย สาคูใช้กี่ถ้วย',
    '7',
    '["5", "6", "7", "8"]'::jsonb,
    'สาคูมีปริมาณน้อยกว่ากล้วยบวชชี จึงนำมาลบออก: 16 - 9 = 7 ถ้วยตวง',
    'medium', true
  );

  -- Problem 43: Finding amount to add to reach capacity
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'มี 35 ลิตร ถังจุ 60 ลิตร ต้องเติมอีกเท่าไร',
    '25',
    '["22", "23", "25", "27"]'::jsonb,
    'หาปริมาณที่ขาด โดยเอาความจุลบด้วยที่มีอยู่: 60 - 35 = 25 ลิตร',
    'medium', true
  );

  -- Problem 44: Finding additional amount needed
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'มีแป้ง 18 ลิตร ต้องการ 30 ลิตร ต้องโม่เพิ่มเท่าไร',
    '12',
    '["10", "11", "12", "13"]'::jsonb,
    'หาผลต่างระหว่างสิ่งที่ต้องการกับสิ่งที่มี: 30 - 18 = 12 ลิตร',
    'medium', true
  );

  -- Problem 45: Finding amount used
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'มี 220 ลิตร ใช้แล้วเหลือ 60 ลิตร ใช้ไปเท่าไร',
    '160',
    '["150", "155", "160", "165"]'::jsonb,
    'อยากรู้ส่วนที่หายไป (ใช้ไป) ให้นำของเดิม ลบด้วยของที่เหลือ: 220 - 60 = 160 ลิตร',
    'medium', true
  );

  -- Problem 46: Finding amount to scoop out
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'มี 24 ลิตร ตักออกเท่าไรจึงเหลือ 19 ลิตร',
    '5',
    '["4", "5", "6", "7"]'::jsonb,
    'หาผลต่างระหว่างของเดิมกับของที่ต้องการให้เหลือ: 24 - 19 = 5 ลิตร',
    'medium', true
  );

  -- Problem 47: Finding original amount before adding
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'เติม 30 ลิตร แล้วเต็ม 78 ลิตร เดิมมีเท่าไร',
    '48',
    '["45", "46", "48", "50"]'::jsonb,
    'อยากรู้ของเดิมก่อนเติม ให้เอาปริมาณรวมสุดท้าย ลบด้วยที่เติมเพิ่ม: 78 - 30 = 48 ลิตร',
    'medium', true
  );

  -- Problem 48: Finding amount to add
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'มี 85 ลิตร ต้องการ 110 ลิตร เติมอีกเท่าไร',
    '25',
    '["22", "23", "25", "27"]'::jsonb,
    'หาผลต่างเพื่อหาส่วนที่ขาด: 110 - 85 = 25 ลิตร',
    'medium', true
  );

  -- Problem 49: Finding amount used
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'มี 26 ลิตร เหลือ 14 ลิตร ใช้ไปเท่าไร',
    '12',
    '["10", "11", "12", "13"]'::jsonb,
    'ของเดิม ลบด้วย ของที่เหลือ เท่ากับ ส่วนที่ใช้ไป: 26 - 14 = 12 ลิตร',
    'easy', true
  );

  -- Problem 50: Subtraction with multiplication (two-step)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'มี 35 ลิตร แบ่งใส่กา 1 ลิตร 15 ใบ (ใช้ไป 15 ลิตร) เหลือเท่าไร',
    '20',
    '["18", "19", "20", "21"]'::jsonb,
    'คำนวณส่วนที่ใช้ไป: 1 × 15 = 15 ลิตร แล้วนำไปลบออกจากของเดิม: 35 - 15 = 20 ลิตร',
    'hard', true
  );

  -- Problem 51: Finding larger amount (more than)
  INSERT INTO question_bank (
    admin_id, grade, semester, skill_name, subject, question_text, 
    correct_answer, choices, explanation, difficulty, is_system_question
  ) VALUES (
    admin_uuid, 2, 1, 'การตวง', 'math',
    'ใบบัว 24 ลิตร แก้วตามากกว่าใบบัว 9 ลิตร แก้วตาได้เท่าไร',
    '33',
    '["30", "31", "33", "35"]'::jsonb,
    'แก้วตามีค่า "มากกว่า" จึงต้องนำมาบวกเพิ่ม: 24 + 9 = 33 ลิตร',
    'medium', true
  );

END $$;