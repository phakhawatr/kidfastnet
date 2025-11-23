-- Insert weight measurement word problems for Grade 2, Semester 1 (63 questions with adjusted numbers)
-- Get admin_id for system questions
DO $$
DECLARE
  v_admin_id uuid;
BEGIN
  -- Get the first admin ID
  SELECT id INTO v_admin_id FROM admins LIMIT 1;
  
  -- Question 1: ส้มโอ + มะม่วง
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'ส้มโอหนัก 3 กก. 2 ขีด มะม่วงหนัก 2 กก. 4 ขีด รวมน้ำหนักทั้งหมดเท่าไร',
    '["5 กก. 3 ขีด", "5 กก. 6 ขีด", "6 กก. 2 ขีด", "4 กก. 6 ขีด"]'::jsonb,
    '5 กก. 6 ขีด',
    'วิธีทำ: 3 กก. 2 ขีด + 2 กก. 4 ขีด = 5 กก. 6 ขีด (นำน้ำหนักทั้งสองอย่างมารวมกัน)',
    true, 'semester'
  );

  -- Question 2: มันม่วง + มันแกว
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'มันม่วงหนัก 75 กก. 600 ก. มันแกวหนัก 52 กก. 900 ก. รวมน้ำหนักเท่าไร',
    '["128 กก. 500 ก.", "127 กก. 500 ก.", "128 กก. 400 ก.", "129 กก. 500 ก."]'::jsonb,
    '128 กก. 500 ก.',
    'วิธีทำ: 600+900 = 1,500 ก. (1 กก. 500 ก.), 75+52 = 127 กก., รวมเป็น 128 กก. 500 ก.',
    true, 'semester'
  );

  -- Question 3: สั่ง 6 กก. ได้มา 3 กก. 1 ขีด
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'สั่งเนื้อ 7 กก. แต่ได้มาเพียง 4 กก. 2 ขีด ยังขาดอีกเท่าไร',
    '["3 กก. 8 ขีด", "2 กก. 8 ขีด", "2 กก. 2 ขีด", "3 กก. 2 ขีด"]'::jsonb,
    '2 กก. 8 ขีด',
    'วิธีทำ: 7.0 - 4.2 = 6 กก. 10 ขีด - 4 กก. 2 ขีด = 2 กก. 8 ขีด (หาส่วนที่ขาดอยู่)',
    true, 'semester'
  );

  -- Question 4: แป้งหนักกว่าน้ำตาล
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'แป้งหนัก 8 ขีด หนักกว่าน้ำตาล 2 ขีด น้ำตาลหนักเท่าไร',
    '["6 ขีด", "10 ขีด", "5 ขีด", "7 ขีด"]'::jsonb,
    '6 ขีด',
    'วิธีทำ: 8 - 2 = 6 ขีด (น้ำตาลเบากว่าแป้ง จึงนำน้ำหนักแป้งลบส่วนต่าง)',
    true, 'semester'
  );

  -- Question 5: อ้อยหนักกว่าหวาน
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'อ้อยหนัก 28 กก. 500 ก. หนักกว่าหวาน 1 กก. 3 ขีด (300 ก.) หวานหนักเท่าไร',
    '["27 กก. 200 ก.", "26 กก. 800 ก.", "27 กก. 800 ก.", "26 กก. 200 ก."]'::jsonb,
    '27 กก. 200 ก.',
    'วิธีทำ: 28.500 - 1.300 = 27.200 (หวานหนักน้อยกว่าอ้อย จึงใช้วิธีลบ)',
    true, 'semester'
  );

  -- Question 6: ขายเนื้อ
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ขายเนื้อไป 115 กก. เหลือ 45 กก. 8 ขีด เดิมมีเนื้อเท่าไร',
    '["160 กก. 8 ขีด", "159 กก. 8 ขีด", "161 กก. 8 ขีด", "160 กก. 2 ขีด"]'::jsonb,
    '160 กก. 8 ขีด',
    'วิธีทำ: 115 + 45.8 = 160.8 (หาของเดิมทั้งหมด โดยนำส่วนที่ขายรวมกับส่วนที่เหลือ)',
    true, 'semester'
  );

  -- Question 7: ส้ม มะละกอ
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ส้มหนัก 23 ขีด (2 กก. 3 ขีด) มะละกอหนัก 5 กก. 2 ขีด น้ำหนักต่างกันเท่าไร',
    '["2 กก. 9 ขีด", "3 กก. 1 ขีด", "2 กก. 1 ขีด", "3 กก. 9 ขีด"]'::jsonb,
    '2 กก. 9 ขีด',
    'วิธีทำ: 5.2 - 2.3 = 4 กก. 12 ขีด - 2 กก. 3 ขีด = 2 กก. 9 ขีด (เปรียบเทียบน้ำหนัก)',
    true, 'semester'
  );

  -- Question 8: มีข้าว ทำบุญ
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'มีข้าว 18 กก. นำไปทำบุญ 5 กก. 600 ก. เหลือข้าวเท่าไร',
    '["12 กก. 400 ก.", "13 กก. 400 ก.", "12 กก. 600 ก.", "11 กก. 400 ก."]'::jsonb,
    '12 กก. 400 ก.',
    'วิธีทำ: 18.000 - 5.600 = 12.400 (แบ่งไปทำบุญ น้ำหนักลดลง ใช้วิธีลบ)',
    true, 'semester'
  );

  -- Question 9: ส้มโอ มะม่วง
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'ส้มโอหนัก 6 กก. 300 ก. มะม่วงหนัก 2 กก. 500 ก. รวมหนักเท่าไร',
    '["8 กก. 800 ก.", "9 กก. 200 ก.", "8 กก. 200 ก.", "9 กก. 800 ก."]'::jsonb,
    '8 กก. 800 ก.',
    'วิธีทำ: 6.300 + 2.500 = 8.800 (หาน้ำหนักรวมของผลไม้)',
    true, 'semester'
  );

  -- Question 10: ทุเรียน มังคุด
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ทุเรียนหนัก 8 กก. 600 ก. มังคุดหนัก 4 กก. 800 ก. รวมหนักเท่าไร',
    '["13 กก. 400 ก.", "12 กก. 400 ก.", "13 กก. 200 ก.", "12 กก. 600 ก."]'::jsonb,
    '13 กก. 400 ก.',
    'วิธีทำ: 600+800 = 1,400 ก. (1 กก. 400 ก.), 8+4 = 12 กก., รวมเป็น 13 กก. 400 ก.',
    true, 'semester'
  );

  -- Question 11: ป้า แม่ ซื้อผัก
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'ป้าซื้อผัก 3 กก. 2 ขีด แม่ซื้อ 2 กก. 6 ขีด แม่ซื้อน้อยกว่าเท่าไร',
    '["6 ขีด", "4 ขีด", "8 ขีด", "5 ขีด"]'::jsonb,
    '6 ขีด',
    'วิธีทำ: 3.2 - 2.6 = 2 กก. 12 ขีด - 2 กก. 6 ขีด = 6 ขีด (เปรียบเทียบหาส่วนต่าง)',
    true, 'semester'
  );

  -- Question 12: ไก่ หมู
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ไก่หนัก 7 กก. 3 ขีด (7,300 ก.) หมูหนัก 500 ก. ไก่หนักกว่าเท่าไร',
    '["6 กก. 800 ก.", "7 กก. 200 ก.", "6 กก. 200 ก.", "7 กก. 800 ก."]'::jsonb,
    '6 กก. 800 ก.',
    'วิธีทำ: 7,300 - 500 = 6,800 ก. = 6 กก. 800 ก. (เปรียบเทียบน้ำหนัก)',
    true, 'semester'
  );

  -- Question 13: มีข้าว ซื้อเพิ่ม
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'มีข้าว 3,100 กรัม ซื้อเพิ่มอีก 1 กก. (1,000 ก.) รวมเท่าไร',
    '["4 กก. 100 ก.", "4 กก. 200 ก.", "3 กก. 100 ก.", "5 กก. 100 ก."]'::jsonb,
    '4 กก. 100 ก.',
    'วิธีทำ: 3,100 + 1,000 = 4,100 ก. = 4 กก. 100 ก. (นำมารวมกัน)',
    true, 'semester'
  );

  -- Question 14: หนังสือ สมุด
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'หนังสือหนัก 700 กรัม สมุดเบากว่า 3 ขีด (300 ก.) สมุดหนักเท่าไร',
    '["400 กรัม", "300 กรัม", "500 กรัม", "350 กรัม"]'::jsonb,
    '400 กรัม',
    'วิธีทำ: 700 - 300 = 400 ก. (สมุดเบากว่า จึงนำมาลบ)',
    true, 'semester'
  );

  -- Question 15: ลำไย ส้ม
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'ลำไยหนัก 15 ขีด ส้มหนัก 3 กก. (30 ขีด) รวมหนักเท่าไร',
    '["4 กก. 5 ขีด", "3 กก. 5 ขีด", "5 กก.", "4 กก."]'::jsonb,
    '4 กก. 5 ขีด',
    'วิธีทำ: 15 + 30 = 45 ขีด = 4 กก. 5 ขีด (บวกน้ำหนัก)',
    true, 'semester'
  );

  -- Question 16: รวมองุ่น มังคุด
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'รวมผลไม้ 80 กก. เป็นองุ่น 38 กก. ที่เหลือเป็นมังคุดเท่าไร',
    '["42 กก.", "40 กก.", "38 กก.", "44 กก."]'::jsonb,
    '42 กก.',
    'วิธีทำ: 80 - 38 = 42 กก. (น้ำหนักรวม ลบ น้ำหนักองุ่น)',
    true, 'semester'
  );

  -- Question 17: แมว สุนัข
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'แมวหนัก 6 กก. สุนัขหนักกว่า 2,500 ก. (2 กก. 5 ขีด) สุนัขหนักเท่าไร',
    '["8 กก. 5 ขีด", "9 กก.", "8 กก.", "7 กก. 5 ขีด"]'::jsonb,
    '8 กก. 5 ขีด',
    'วิธีทำ: 6 + 2.5 = 8.5 = 8 กก. 5 ขีด (สุนัขหนักกว่า จึงบวกเพิ่ม)',
    true, 'semester'
  );

  -- Question 18: มะเขือ
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'มะเขือหนัก 6 กก. 4 ขีด เก็บเพิ่มได้ 2 กก. 3 ขีด รวมหนักเท่าไร',
    '["8 กก. 7 ขีด", "7 กก. 7 ขีด", "9 กก. 7 ขีด", "8 กก. 1 ขีด"]'::jsonb,
    '8 กก. 7 ขีด',
    'วิธีทำ: 6.4 + 2.3 = 8.7 (เก็บเพิ่มคือการนำมารวมกัน)',
    true, 'semester'
  );

  -- Question 19: ส้ม
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ส้มหนัก 3 กก. 5 ขีด ซื้อเพิ่มอีก 7 ขีด รวมหนักเท่าไร',
    '["4 กก. 2 ขีด", "3 กก. 12 ขีด", "4 กก. 3 ขีด", "5 กก. 2 ขีด"]'::jsonb,
    '4 กก. 2 ขีด',
    'วิธีทำ: 3.5 + 0.7 = 3 กก. 12 ขีด = 4 กก. 2 ขีด (รวมน้ำหนัก)',
    true, 'semester'
  );

  -- Question 20: ผักกาด
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ผักกาดหนัก 16 กก. 5 ขีด ขายไป 7 กก. 8 ขีด เหลือเท่าไร',
    '["8 กก. 7 ขีด", "9 กก. 3 ขีด", "8 กก. 3 ขีด", "7 กก. 7 ขีด"]'::jsonb,
    '8 กก. 7 ขีด',
    'วิธีทำ: 16.5 - 7.8 = 15 กก. 15 ขีด - 7 กก. 8 ขีด = 8 กก. 7 ขีด (ขายไปคือการหักออก)',
    true, 'semester'
  );

  -- Question 21: ปลา กุ้ง
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'ปลาหนัก 4 กก. 3 ขีด กุ้งหนัก 3 กก. 6 ขีด น้ำหนักต่างกันเท่าไร',
    '["7 ขีด", "9 ขีด", "6 ขีด", "8 ขีด"]'::jsonb,
    '7 ขีด',
    'วิธีทำ: 4.3 - 3.6 = 3 กก. 13 ขีด - 3 กก. 6 ขีด = 7 ขีด (หาผลต่างน้ำหนัก)',
    true, 'semester'
  );

  -- Question 22: ผลไม้รวม
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'ผลไม้รวม 4 กก. 7 ขีด ผลเล็ก 2 กก. 2 ขีด ผลใหญ่หนักเท่าไร',
    '["2 กก. 5 ขีด", "3 กก. 5 ขีด", "2 กก.", "3 กก."]'::jsonb,
    '2 กก. 5 ขีด',
    'วิธีทำ: 4.7 - 2.2 = 2.5 (น้ำหนักรวม ลบ ผลเล็ก)',
    true, 'semester'
  );

  -- Question 23: แบ่งปู่
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'มีข้าว 15 กก. 6 ขีด เหลือ 6 กก. 3 ขีด แบ่งให้ปู่เท่าไร',
    '["9 กก. 3 ขีด", "8 กก. 3 ขีด", "9 กก.", "10 กก. 3 ขีด"]'::jsonb,
    '9 กก. 3 ขีด',
    'วิธีทำ: 15.6 - 6.3 = 9.3 (ของเดิม ลบ ของเหลือ)',
    true, 'semester'
  );

  -- Question 24: ส้ม ชมพู่
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ส้มหนัก 2 กก. 7 ขีด ชมพู่หนัก 2 กก. 5 ขีด รวมหนักเท่าไร',
    '["5 กก. 2 ขีด", "4 กก. 12 ขีด", "5 กก.", "4 กก. 2 ขีด"]'::jsonb,
    '5 กก. 2 ขีด',
    'วิธีทำ: 2.7 + 2.5 = 4 กก. 12 ขีด = 5 กก. 2 ขีด (รวมน้ำหนัก)',
    true, 'semester'
  );

  -- Question 25: ปลา ขายไป
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ปลาหนัก 26 กก. 3 ขีด เหลือ 19 กก. 5 ขีด ขายไปเท่าไร',
    '["6 กก. 8 ขีด", "7 กก. 2 ขีด", "6 กก. 2 ขีด", "7 กก. 8 ขีด"]'::jsonb,
    '6 กก. 8 ขีด',
    'วิธีทำ: 26.3 - 19.5 = 25 กก. 13 ขีด - 19 กก. 5 ขีด = 6 กก. 8 ขีด (ของเดิม ลบ ของเหลือ)',
    true, 'semester'
  );

  -- Question 26: ถั่วแดง ถั่วเขียว
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'ถั่วแดงหนัก 2 กก. 700 ก. ถั่วเขียวหนัก 3 กก. น้ำหนักต่างกันเท่าไร',
    '["300 ก.", "200 ก.", "400 ก.", "250 ก."]'::jsonb,
    '300 ก.',
    'วิธีทำ: 3.000 - 2.700 = 300 ก. (หาผลต่างน้ำหนัก)',
    true, 'semester'
  );

  -- Question 27: มันฝรั่ง หอมใหญ่
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'มันฝรั่งหนัก 2 กก. 350 ก. หอมใหญ่หนัก 650 ก. รวมหนักเท่าไร',
    '["3 กก.", "2 กก. 500 ก.", "3 กก. 500 ก.", "2 กก."]'::jsonb,
    '3 กก.',
    'วิธีทำ: 2.350 + 0.650 = 2 กก. 1,000 ก. = 3 กก. (รวมน้ำหนัก)',
    true, 'semester'
  );

  -- Question 28: น้ำตาล ใช้ไป
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'น้ำตาล 3 กก. (3,000 ก.) ใช้ไป 550 ก. เหลือเท่าไร',
    '["2 กก. 450 ก.", "2 กก. 550 ก.", "2 กก. 350 ก.", "3 กก. 450 ก."]'::jsonb,
    '2 กก. 450 ก.',
    'วิธีทำ: 3,000 - 550 = 2,450 ก. = 2 กก. 450 ก. (หักส่วนที่ใช้ไป)',
    true, 'semester'
  );

  -- Question 29: ส้ม คั้นน้ำ
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'ส้มหนัก 6 กก. คั้นน้ำ 4 กก. 3 ขีด เหลือส้มเท่าไร',
    '["1 กก. 7 ขีด", "2 กก. 3 ขีด", "1 กก. 3 ขีด", "2 กก. 7 ขีด"]'::jsonb,
    '1 กก. 7 ขีด',
    'วิธีทำ: 6.0 - 4.3 = 5 กก. 10 ขีด - 4 กก. 3 ขีด = 1 กก. 7 ขีด (ของที่มี ลบ ส่วนที่ใช้)',
    true, 'semester'
  );

  -- Question 30: พริก กระเทียม
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'พริกหนัก 4 กก. 400 ก. กระเทียมหนักกว่า 500 ก. กระเทียมหนักเท่าไร',
    '["4 กก. 900 ก.", "5 กก. 100 ก.", "4 กก. 700 ก.", "5 กก. 400 ก."]'::jsonb,
    '4 กก. 900 ก.',
    'วิธีทำ: 4.400 + 0.500 = 4.900 (กระเทียมหนักกว่า จึงบวกเพิ่ม)',
    true, 'semester'
  );

  -- Question 31: แป้ง ซื้อเพิ่ม
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'แป้งหนัก 850 ก. ต้องซื้อเพิ่มเท่าไรให้ครบ 3 กก. (3,000 ก.)',
    '["2 กก. 150 ก.", "2 กก. 250 ก.", "1 กก. 150 ก.", "1 กก. 250 ก."]'::jsonb,
    '2 กก. 150 ก.',
    'วิธีทำ: 3,000 - 850 = 2,150 ก. = 2 กก. 150 ก. (หาปริมาณที่ขาดอยู่)',
    true, 'semester'
  );

  -- Question 32: ขายผัก
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ขายผัก 16 กก. 500 ก. เหลือ 6 กก. 700 ก. เดิมมีเท่าไร',
    '["23 กก. 200 ก.", "22 กก. 200 ก.", "23 กก.", "24 กก. 200 ก."]'::jsonb,
    '23 กก. 200 ก.',
    'วิธีทำ: 16.500 + 6.700 = 22 กก. 1,200 ก. = 23 กก. 200 ก. (ส่วนที่ขาย + ส่วนที่เหลือ)',
    true, 'semester'
  );

  -- Question 33: ทุเรียน 2 ผล
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ทุเรียนผลแรกหนัก 4 กก. 150 ก. ผลสองหนัก 3 กก. 900 ก. รวมหนักเท่าไร',
    '["8 กก. 50 ก.", "7 กก. 50 ก.", "8 กก. 150 ก.", "7 กก. 150 ก."]'::jsonb,
    '8 กก. 50 ก.',
    'วิธีทำ: 4.150 + 3.900 = 7 กก. 1,050 ก. = 8 กก. 50 ก. (รวมน้ำหนักทุเรียน 2 ผล)',
    true, 'semester'
  );

  -- Question 34: ข้าว ต้องการ
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'มีข้าว 600 ก. ต้องการ 6 กก. (6,000 ก.) ยังขาดเท่าไร',
    '["5 กก. 400 ก.", "5 กก. 600 ก.", "4 กก. 400 ก.", "6 กก. 400 ก."]'::jsonb,
    '5 กก. 400 ก.',
    'วิธีทำ: 6,000 - 600 = 5,400 ก. = 5 กก. 400 ก. (หาปริมาณที่ต้องซื้อเพิ่ม)',
    true, 'semester'
  );

  -- Question 35: ขายมะเขือ
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'ขายมะเขือ 2 กก. 7 ขีด เหลือ 4 กก. 2 ขีด เดิมมีเท่าไร',
    '["6 กก. 9 ขีด", "7 กก. 9 ขีด", "6 กก.", "5 กก. 9 ขีด"]'::jsonb,
    '6 กก. 9 ขีด',
    'วิธีทำ: 2.7 + 4.2 = 6.9 (นำส่วนที่ขายรวมกับส่วนที่เหลือ)',
    true, 'semester'
  );

  -- Question 36: ขายปลา
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ขายปลา 5 กก. 700 ก. เหลือ 3 กก. 300 ก. เดิมมีเท่าไร',
    '["9 กก.", "8 กก.", "8 กก. 500 ก.", "10 กก."]'::jsonb,
    '9 กก.',
    'วิธีทำ: 5.700 + 3.300 = 8 กก. 1,000 ก. = 9 กก. (หาของเดิมทั้งหมด)',
    true, 'semester'
  );

  -- Question 37: ข้าว บริจาค
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'ข้าวหนัก 6 กก. บริจาค 3 กก. 600 ก. เหลือเท่าไร',
    '["2 กก. 400 ก.", "3 กก. 400 ก.", "2 กก. 600 ก.", "3 กก."]'::jsonb,
    '2 กก. 400 ก.',
    'วิธีทำ: 6.000 - 3.600 = 2.400 (บริจาคไปคือการลบออก)',
    true, 'semester'
  );

  -- Question 38: มะม่วง
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'มะม่วงหนัก 6 กก. 4 ขีด เพิ่มอีก 3 กก. 4 ขีด รวมหนักเท่าไร',
    '["9 กก. 8 ขีด", "8 กก. 8 ขีด", "10 กก. 8 ขีด", "9 กก."]'::jsonb,
    '9 กก. 8 ขีด',
    'วิธีทำ: 6.4 + 3.4 = 9.8 (รวมน้ำหนักมะม่วงทั้งหมด)',
    true, 'semester'
  );

  -- Question 39: แตงโม องุ่น
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'แตงโมหนัก 2 กก. 3 ขีด องุ่นหนัก 5 กก. 2 ขีด น้ำหนักต่างกันเท่าไร',
    '["2 กก. 9 ขีด", "3 กก. 1 ขีด", "3 กก. 9 ขีด", "2 กก. 1 ขีด"]'::jsonb,
    '2 กก. 9 ขีด',
    'วิธีทำ: 5.2 - 2.3 = 4 กก. 12 ขีด - 2 กก. 3 ขีด = 2 กก. 9 ขีด (หาผลต่างน้ำหนัก)',
    true, 'semester'
  );

  -- Question 40: น้ำตาล
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'น้ำตาลหนัก 42 ขีด เพิ่มอีก 52 ขีด รวมหนักเท่าไร',
    '["9 กก. 4 ขีด", "8 กก. 4 ขีด", "10 กก. 4 ขีด", "9 กก."]'::jsonb,
    '9 กก. 4 ขีด',
    'วิธีทำ: 42 + 52 = 94 ขีด = 9 กก. 4 ขีด (บวกจำนวนขีด แล้วแปลงเป็นกิโลกรัม)',
    true, 'semester'
  );

  -- Question 41: ฝรั่ง แบ่งเพื่อน
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ฝรั่งหนัก 7 กก. 200 ก. แบ่งให้เพื่อน 800 ก. เหลือเท่าไร',
    '["6 กก. 400 ก.", "6 กก. 600 ก.", "7 กก. 400 ก.", "5 กก. 400 ก."]'::jsonb,
    '6 กก. 400 ก.',
    'วิธีทำ: 7.200 - 0.800 = 6 กก. 1,200 ก. - 800 ก. = 6 กก. 400 ก. (แบ่งให้เพื่อนคือการลบ)',
    true, 'semester'
  );

  -- Question 42: ถั่วเขียว
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ถั่วเขียวหนัก 5 กก. 3 ขีด แบ่งให้เพื่อน 3 กก. 6 ขีด เหลือเท่าไร',
    '["1 กก. 7 ขีด", "2 กก. 3 ขีด", "1 กก. 3 ขีด", "2 กก. 7 ขีด"]'::jsonb,
    '1 กก. 7 ขีด',
    'วิธีทำ: 5.3 - 3.6 = 4 กก. 13 ขีด - 3 กก. 6 ขีด = 1 กก. 7 ขีด (หาถั่วเขียวที่เหลือ)',
    true, 'semester'
  );

  -- Question 43: มังคุด
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'มังคุดหนัก 8 กก. 2 ขีด เพิ่มอีก 8 ขีด รวมหนักเท่าไร',
    '["9 กก.", "8 กก. 10 ขีด", "10 กก.", "9 กก. 2 ขีด"]'::jsonb,
    '9 กก.',
    'วิธีทำ: 8.2 + 0.8 = 8 กก. 10 ขีด = 9 กก. (รวมน้ำหนักมังคุด)',
    true, 'semester'
  );

  -- Question 44: เงาะ ลำไย
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'เงาะหนัก 3 กก. 300 ก. ลำไยหนัก 2 กก. 600 ก. รวมหนักเท่าไร',
    '["5 กก. 900 ก.", "6 กก. 100 ก.", "5 กก. 800 ก.", "6 กก."]'::jsonb,
    '5 กก. 900 ก.',
    'วิธีทำ: 3.300 + 2.600 = 5.900 (รวมน้ำหนักผลไม้)',
    true, 'semester'
  );

  -- Question 45: ส้มพ่อ ส้มขุน
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ส้มพ่อหนัก 4 กก. 700 ก. ส้มขุนหนัก 4 กก. 300 ก. รวมหนักเท่าไร',
    '["9 กก.", "8 กก.", "8 กก. 500 ก.", "10 กก."]'::jsonb,
    '9 กก.',
    'วิธีทำ: 4.700 + 4.300 = 8 กก. 1,000 ก. = 9 กก. (รวมน้ำหนักส้ม)',
    true, 'semester'
  );

  -- Question 46: ทุเรียน ขนุน
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ทุเรียนหนัก 5 กก. 500 ก. ขนุนหนัก 8 กก. 200 ก. น้ำหนักต่างกันเท่าไร',
    '["2 กก. 700 ก.", "3 กก. 200 ก.", "2 กก. 200 ก.", "3 กก. 700 ก."]'::jsonb,
    '2 กก. 700 ก.',
    'วิธีทำ: 8.200 - 5.500 = 7 กก. 1,200 ก. - 5 กก. 500 ก. = 2 กก. 700 ก. (หาผลต่างน้ำหนัก)',
    true, 'semester'
  );

  -- Question 47: ขายปลา (skipped in original, using Q48 pattern)
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ขายปลา 7 กก. 900 ก. เหลือ 4 กก. 100 ก. เดิมมีเท่าไร',
    '["12 กก.", "11 กก.", "13 กก.", "10 กก."]'::jsonb,
    '12 กก.',
    'วิธีทำ: 7.900 + 4.100 = 11 กก. 1,000 ก. = 12 กก. (นำที่ขายไปบวกกับที่เหลือ)',
    true, 'semester'
  );

  -- Question 48: มะม่วง แบ่งเพื่อน
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'hard',
    'มะม่วงหนัก 6 กก. แบ่งให้เพื่อน (3 กก. 150 ก. + 2 กก. 500 ก.) เหลือเท่าไร',
    '["350 ก.", "450 ก.", "250 ก.", "550 ก."]'::jsonb,
    '350 ก.',
    'วิธีทำ: 3.150 + 2.500 = 5.650, แล้วนำ 6.000 - 5.650 = 350 ก. (หาจำนวนรวมที่แบ่งก่อน)',
    true, 'semester'
  );

  -- Question 49: กุ้ง
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'กุ้งหนัก 8 กก. 7 ขีด เพิ่มอีก 6 ขีด รวมหนักเท่าไร',
    '["9 กก. 3 ขีด", "8 กก. 13 ขีด", "10 กก. 3 ขีด", "9 กก."]'::jsonb,
    '9 กก. 3 ขีด',
    'วิธีทำ: 8.7 + 0.6 = 8 กก. 13 ขีด = 9 กก. 3 ขีด (รวมน้ำหนักกุ้ง)',
    true, 'semester'
  );

  -- Question 50: ต้องการข้าว
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ต้องการข้าว 80 กก. มีแค่ 72 กก. 2 ขีด ยังขาดเท่าไร',
    '["7 กก. 8 ขีด", "8 กก. 2 ขีด", "6 กก. 8 ขีด", "9 กก. 2 ขีด"]'::jsonb,
    '7 กก. 8 ขีด',
    'วิธีทำ: 80.0 - 72.2 = 79 กก. 10 ขีด - 72 กก. 2 ขีด = 7 กก. 8 ขีด (หาปริมาณที่ยังขาด)',
    true, 'semester'
  );

  -- Question 51: พ่อ ลูก ซื้อผัก
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'พ่อซื้อผัก 4 กก. ลูกซื้อ 12 ขีด (1 กก. 2 ขีด) รวมหนักเท่าไร',
    '["5 กก. 2 ขีด", "4 กก. 12 ขีด", "6 กก. 2 ขีด", "5 กก."]'::jsonb,
    '5 กก. 2 ขีด',
    'วิธีทำ: 4 + 1.2 = 5.2 (แปลงหน่วยให้เหมือนกันแล้วบวก)',
    true, 'semester'
  );

  -- Question 52: กล่อง 2 กล่อง
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'กล่องแรกหนัก 19 กก. กล่องสองหนัก 28 กก. รวมหนักเท่าไร',
    '["47 กก.", "46 กก.", "48 กก.", "45 กก."]'::jsonb,
    '47 กก.',
    'วิธีทำ: 19 + 28 = 47 กก. (รวมน้ำหนักพัสดุ)',
    true, 'semester'
  );

  -- Question 53: ปลา ไก่
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ปลาหนัก 2 กก. 7 ขีด ไก่หนัก 4 กก. 5 ขีด รวมหนักเท่าไร',
    '["7 กก. 2 ขีด", "6 กก. 12 ขีด", "6 กก. 2 ขีด", "8 กก. 2 ขีด"]'::jsonb,
    '7 กก. 2 ขีด',
    'วิธีทำ: 2.7 + 4.5 = 6 กก. 12 ขีด = 7 กก. 2 ขีด (รวมน้ำหนักอาหารสด)',
    true, 'semester'
  );

  -- Question 54: ใส่น้ำตาล
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'ต้องการน้ำตาล 2 กก. 6 ขีด ใส่ไปแล้ว 9 ขีด ยังขาดเท่าไร',
    '["1 กก. 7 ขีด", "2 กก. 3 ขีด", "1 กก. 3 ขีด", "2 กก. 7 ขีด"]'::jsonb,
    '1 กก. 7 ขีด',
    'วิธีทำ: 2.6 - 0.9 = 1 กก. 16 ขีด - 9 ขีด = 1 กก. 7 ขีด (หาปริมาณที่ต้องใส่เพิ่ม)',
    true, 'semester'
  );

  -- Question 55: ถุงใส ถุงร้อน
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'ถุงใสหนัก 28 ขีด ถุงร้อนหนัก 19 ขีด น้ำหนักต่างกันเท่าไร',
    '["9 ขีด", "7 ขีด", "10 ขีด", "8 ขีด"]'::jsonb,
    '9 ขีด',
    'วิธีทำ: 28 - 19 = 9 ขีด (หาผลต่างน้ำหนักถุง)',
    true, 'semester'
  );

  -- Question 56: ชิ้นไม้ 2 ชิ้น
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'รวมน้ำหนักไม้ 14 กก. 6 ขีด ชิ้นหนึ่งหนัก 7 กก. 8 ขีด อีกชิ้นหนักเท่าไร',
    '["6 กก. 8 ขีด", "7 กก. 2 ขีด", "5 กก. 8 ขีด", "6 กก. 2 ขีด"]'::jsonb,
    '6 กก. 8 ขีด',
    'วิธีทำ: 14.6 - 7.8 = 13 กก. 16 ขีด - 7 กก. 8 ขีด = 6 กก. 8 ขีด (น้ำหนักรวม ลบ ชิ้นแรก)',
    true, 'semester'
  );

  -- Question 57: ล้อรวม
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'ล้อรวมหนัก 18 กก. ล้อเหล็กหนัก 8 กก. ล้อยางหนักเท่าไร',
    '["10 กก.", "9 กก.", "11 กก.", "12 กก."]'::jsonb,
    '10 กก.',
    'วิธีทำ: 18 - 8 = 10 กก. (น้ำหนักรวม ลบ น้ำหนักล้อเหล็ก)',
    true, 'semester'
  );

  -- Question 58: กล่อง 2 กล่อง
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'easy',
    'รวมกล่อง 17 กก. กล่องแรกหนัก 11 กก. กล่องสองหนักเท่าไร',
    '["6 กก.", "7 กก.", "5 กก.", "8 กก."]'::jsonb,
    '6 กก.',
    'วิธีทำ: 17 - 11 = 6 กก. (น้ำหนักรวม ลบ น้ำหนักกล่องแรก)',
    true, 'semester'
  );

  -- Question 59: ขายผัก 2 เดือน
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ขายผัก 2 เดือนรวม 11 กก. 6 ขีด เดือนก่อน 6 กก. 8 ขีด เดือนนี้ขายได้เท่าไร',
    '["4 กก. 8 ขีด", "5 กก. 2 ขีด", "4 กก. 2 ขีด", "5 กก. 8 ขีด"]'::jsonb,
    '4 กก. 8 ขีด',
    'วิธีทำ: 11.6 - 6.8 = 10 กก. 16 ขีด - 6 กก. 8 ขีด = 4 กก. 8 ขีด (ยอดรวม ลบ ยอดเดือนก่อน)',
    true, 'semester'
  );

  -- Question 60: ขายไป เหลือ
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'ขายผักไป 8 กก. ครึ่ง (8 กก. 5 ขีด) เหลือ 2 กก. 7 ขีด เดิมมีเท่าไร',
    '["11 กก. 2 ขีด", "10 กก. 2 ขีด", "12 กก. 2 ขีด", "11 กก."]'::jsonb,
    '11 กก. 2 ขีด',
    'วิธีทำ: 8.5 + 2.7 = 10 กก. 12 ขีด = 11 กก. 2 ขีด (ส่วนที่ขาย + ส่วนที่เหลือ)',
    true, 'semester'
  );

  -- Question 61: มี เหลือ ขายไป
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'มีผัก 5 กก. 3 ขีด เหลือ 3 กก. ครึ่ง (3 กก. 5 ขีด) ขายไปเท่าไร',
    '["1 กก. 8 ขีด", "2 กก. 2 ขีด", "1 กก. 2 ขีด", "2 กก. 8 ขีด"]'::jsonb,
    '1 กก. 8 ขีด',
    'วิธีทำ: 5.3 - 3.5 = 4 กก. 13 ขีด - 3 กก. 5 ขีด = 1 กก. 8 ขีด (ของที่มี ลบ ของที่เหลือ)',
    true, 'semester'
  );

  -- Question 62: เพิ่ม รวม เดิม
  INSERT INTO question_bank (admin_id, grade, semester, skill_name, subject, difficulty, question_text, choices, correct_answer, explanation, is_system_question, assessment_type)
  VALUES (
    v_admin_id, 2, 1, 'การชั่งน้ำหนัก', 'math', 'medium',
    'มีขยะเพิ่มมา 4 กก. 7 ขีด รวมเป็น 11 กก. 2 ขีด เดิมมีเท่าไร',
    '["6 กก. 5 ขีด", "7 กก. 5 ขีด", "5 กก. 5 ขีด", "6 กก."]'::jsonb,
    '6 กก. 5 ขีด',
    'วิธีทำ: 11.2 - 4.7 = 10 กก. 12 ขีด - 4 กก. 7 ขีด = 6 กก. 5 ขีด (ยอดรวมใหม่ ลบ ส่วนที่เพิ่มมา)',
    true, 'semester'
  );

END $$;