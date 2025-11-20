-- Fix security warnings: Set search_path for increment_exam_students function
CREATE OR REPLACE FUNCTION increment_exam_students()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE exam_links
  SET current_students = current_students + 1,
      updated_at = now(),
      status = CASE 
        WHEN current_students + 1 >= max_students THEN 'full'
        ELSE status
      END
  WHERE id = NEW.exam_link_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;