-- Create exam_questions table for storing individual questions
CREATE TABLE exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_link_id uuid NOT NULL REFERENCES exam_links(id) ON DELETE CASCADE,
  question_number integer NOT NULL,
  question_text text NOT NULL,
  choices jsonb NOT NULL,
  correct_answer text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  skill_name text NOT NULL,
  is_edited boolean DEFAULT false,
  original_question jsonb,
  explanation text,
  visual_elements jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT unique_exam_question UNIQUE(exam_link_id, question_number)
);

-- Index for fast lookup
CREATE INDEX idx_exam_questions_link_id ON exam_questions(exam_link_id);

-- RLS Policies
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;

-- Teachers can view questions for their exam links
CREATE POLICY teachers_view_own_exam_questions ON exam_questions
  FOR SELECT
  USING (
    exam_link_id IN (
      SELECT id FROM exam_links 
      WHERE teacher_id IN (
        SELECT user_id FROM user_roles WHERE role = 'teacher'
      )
    )
  );

-- Teachers can insert/update/delete questions for their exam links
CREATE POLICY teachers_manage_own_exam_questions ON exam_questions
  FOR ALL
  USING (
    exam_link_id IN (
      SELECT id FROM exam_links 
      WHERE teacher_id IN (
        SELECT user_id FROM user_roles WHERE role = 'teacher'
      )
    )
  );

-- Students can view questions for active exam links (when taking exam)
CREATE POLICY students_view_active_exam_questions ON exam_questions
  FOR SELECT
  USING (
    exam_link_id IN (
      SELECT id FROM exam_links WHERE status = 'active'
    )
  );

-- Add columns to exam_links
ALTER TABLE exam_links 
ADD COLUMN has_custom_questions boolean DEFAULT false,
ADD COLUMN questions_finalized_at timestamptz;