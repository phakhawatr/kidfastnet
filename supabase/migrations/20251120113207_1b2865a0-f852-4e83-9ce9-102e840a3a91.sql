-- Add activity_name and total_questions columns to exam_links table
ALTER TABLE exam_links 
ADD COLUMN activity_name text,
ADD COLUMN total_questions integer DEFAULT 20 NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN exam_links.activity_name IS 'ชื่อกิจกรรม/ชื่อแบบทดสอบ (เช่น ทดสอบกลางภาค, แบบฝึกหัด 1)';
COMMENT ON COLUMN exam_links.total_questions IS 'จำนวนข้อที่ต้องการในข้อสอบ (10, 20, 30, 40, 50)';