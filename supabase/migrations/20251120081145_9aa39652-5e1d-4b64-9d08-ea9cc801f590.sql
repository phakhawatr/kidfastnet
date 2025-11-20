-- Add draft mode and randomization fields to exam_sessions
ALTER TABLE exam_sessions
ADD COLUMN is_draft boolean DEFAULT true,
ADD COLUMN question_order jsonb,
ADD COLUMN choices_order jsonb,
ADD COLUMN auto_saved_at timestamp with time zone,
ADD COLUMN draft_answers jsonb;

-- Create index for faster draft session lookups
CREATE INDEX idx_exam_sessions_draft ON exam_sessions(exam_link_id, student_name, student_number, is_draft);

-- Add comments
COMMENT ON COLUMN exam_sessions.is_draft IS 'True if session is auto-saved draft, false when submitted';
COMMENT ON COLUMN exam_sessions.question_order IS 'Randomized order of questions for this session';
COMMENT ON COLUMN exam_sessions.choices_order IS 'Randomized order of choices per question';
COMMENT ON COLUMN exam_sessions.auto_saved_at IS 'Last auto-save timestamp';
COMMENT ON COLUMN exam_sessions.draft_answers IS 'Current draft answers before final submission';