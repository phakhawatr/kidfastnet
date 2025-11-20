-- Add security and time management fields to exam_links
ALTER TABLE exam_links 
ADD COLUMN exam_passcode text,
ADD COLUMN start_time timestamp with time zone,
ADD COLUMN time_limit_minutes integer,
ADD COLUMN allow_retake boolean DEFAULT false;

-- Add unique constraint to prevent duplicate submissions
ALTER TABLE exam_sessions
ADD CONSTRAINT unique_student_per_exam UNIQUE (exam_link_id, student_name, student_number);

-- Add comment for clarity
COMMENT ON COLUMN exam_links.exam_passcode IS '6-digit passcode required to access exam';
COMMENT ON COLUMN exam_links.start_time IS 'Earliest time students can start the exam';
COMMENT ON COLUMN exam_links.time_limit_minutes IS 'Time limit per student in minutes';
COMMENT ON COLUMN exam_links.allow_retake IS 'Whether students can retake the exam';
COMMENT ON CONSTRAINT unique_student_per_exam ON exam_sessions IS 'Prevents duplicate submissions from same student';