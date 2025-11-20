-- Add DELETE policy for exam_sessions so teachers can delete sessions from their exams
CREATE POLICY "Teachers can delete sessions for their exam links"
ON exam_sessions
FOR DELETE
USING (
  exam_link_id IN (
    SELECT id FROM exam_links 
    WHERE teacher_id IN (
      SELECT id FROM user_registrations 
      WHERE parent_email = (auth.jwt() ->> 'email')
    )
  )
);

-- Add comment
COMMENT ON POLICY "Teachers can delete sessions for their exam links" ON exam_sessions 
IS 'Allows teachers to delete exam sessions from their own exam links';