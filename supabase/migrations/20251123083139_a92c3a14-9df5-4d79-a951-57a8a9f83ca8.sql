-- Fix NT exam questions to have exactly 4 choices each

-- 1. Measurement: ม้า 8 ตัว กินตัวละ 5 กก. ต่อวัน 3 วัน = 120 กก.
UPDATE question_bank
SET choices = '["40 กิโลกรัม", "80 กิโลกรัม", "120 กิโลกรัม", "150 กิโลกรัม"]'::jsonb,
    correct_answer = '120 กิโลกรัม',
    updated_at = now()
WHERE question_text LIKE '%ม้า 8 ตัว%' 
  AND skill_name = 'measurement'
  AND assessment_type = 'nt';

-- 2. Measurement: ตะกร้าผลไม้ 2500 + 350 + 300 = 3150 กรัม
UPDATE question_bank
SET choices = '["2,850 กรัม", "3,050 กรัม", "3,150 กรัม", "3,450 กรัม"]'::jsonb,
    correct_answer = '3,150 กรัม',
    updated_at = now()
WHERE question_text LIKE '%ตะกร้าใบหนึ่งมีน้ำหนัก 2,500 กรัม%'
  AND skill_name = 'measurement'
  AND assessment_type = 'nt';

-- 3. Mixed Operations: ขนม 95 ชิ้น x 30 - 2000 = 850 บาท
UPDATE question_bank
SET choices = '["650 บาท", "850 บาท", "950 บาท", "1,150 บาท"]'::jsonb,
    correct_answer = '850 บาท',
    updated_at = now()
WHERE question_text LIKE '%ขนมขบเคี้ยว 95 ชิ้น%'
  AND skill_name = 'mixedOperations'
  AND assessment_type = 'nt';

-- 4. Mixed Operations: พริก (29 + 33) x 40 = 2480 บาท
UPDATE question_bank
SET choices = '["1,240 บาท", "2,120 บาท", "2,480 บาท", "2,840 บาท"]'::jsonb,
    correct_answer = '2,480 บาท',
    updated_at = now()
WHERE question_text LIKE '%พริกชี้ฟ้า 29 กิโลกรัม%'
  AND skill_name = 'mixedOperations'
  AND assessment_type = 'nt';

-- 5. Mixed Operations: (1200 + 1500) / 9 = 300 ถุง
UPDATE question_bank
SET choices = '["270 ถุง", "290 ถุง", "300 ถุง", "330 ถุง"]'::jsonb,
    correct_answer = '300 ถุง',
    updated_at = now()
WHERE question_text LIKE '%ชา 1,200 ถุง%กาแฟ 1,500 ถุง%'
  AND skill_name = 'mixedOperations'
  AND assessment_type = 'nt';

-- 6. Money: 275.25 + 146.25 - 79.75 = 341.75 บาท
UPDATE question_bank
SET choices = '["261.75 บาท", "341.75 บาท", "355.25 บาท", "421.50 บาท"]'::jsonb,
    correct_answer = '341.75 บาท',
    updated_at = now()
WHERE question_text LIKE '%สมชายมีเงิน 275.25 บาท%'
  AND skill_name = 'money'
  AND assessment_type = 'nt';

-- 7. Money: 5900 - 4100 = 1800 บาท
UPDATE question_bank
SET choices = '["1,500 บาท", "1,800 บาท", "2,000 บาท", "2,200 บาท"]'::jsonb,
    correct_answer = '1,800 บาท',
    updated_at = now()
WHERE question_text LIKE '%เดิมราคา 5,900 บาท%ลดเหลือ 4,100 บาท%'
  AND skill_name = 'money'
  AND assessment_type = 'nt';

-- 8. Money: 300 + 250 + 80 + 100 = 730 บาท (fixing correct answer)
UPDATE question_bank
SET choices = '["480 บาท", "580 บาท", "630 บาท", "730 บาท"]'::jsonb,
    correct_answer = '730 บาท',
    updated_at = now()
WHERE question_text LIKE '%อาหารเช้า 300 บาท%อาหารกลางวัน 250 บาท%'
  AND skill_name = 'money'
  AND assessment_type = 'nt';