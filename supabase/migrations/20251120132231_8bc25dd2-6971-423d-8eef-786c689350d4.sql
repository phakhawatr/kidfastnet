-- Allow anonymous users to read exam questions for active exams
CREATE POLICY "allow_public_read_exam_questions"
ON exam_questions
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM exam_links
    WHERE exam_links.id = exam_questions.exam_link_id
    AND exam_links.status = 'active'
    AND (exam_links.expires_at IS NULL OR exam_links.expires_at > now())
  )
);