-- Add attempt tracking to exam_sessions
ALTER TABLE exam_sessions
ADD COLUMN attempt_number integer DEFAULT 1;

-- Add index for faster attempt lookups
CREATE INDEX idx_exam_sessions_attempts ON exam_sessions(exam_link_id, student_name, student_number, attempt_number);

-- Create function to automatically set attempt number
CREATE OR REPLACE FUNCTION set_attempt_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_attempt integer;
BEGIN
  -- Only set attempt number for non-draft submissions
  IF NEW.is_draft = false THEN
    -- Get the max attempt number for this student
    SELECT COALESCE(MAX(attempt_number), 0) INTO max_attempt
    FROM exam_sessions
    WHERE exam_link_id = NEW.exam_link_id
      AND student_name = NEW.student_name
      AND student_number = NEW.student_number
      AND is_draft = false
      AND id != NEW.id;
    
    NEW.attempt_number := max_attempt + 1;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-set attempt number
CREATE TRIGGER set_exam_attempt_number
BEFORE INSERT ON exam_sessions
FOR EACH ROW
EXECUTE FUNCTION set_attempt_number();

-- Add comment
COMMENT ON COLUMN exam_sessions.attempt_number IS 'Sequential attempt number for each student (1, 2, 3, etc.)';