-- Create question_bank table for reusable questions
CREATE TABLE question_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES user_registrations(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  choices jsonb NOT NULL,
  correct_answer text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  skill_name text NOT NULL,
  grade integer NOT NULL,
  subject text NOT NULL DEFAULT 'math',
  explanation text,
  visual_elements jsonb,
  tags text[] DEFAULT '{}',
  times_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast lookup
CREATE INDEX idx_question_bank_teacher_id ON question_bank(teacher_id);
CREATE INDEX idx_question_bank_grade ON question_bank(grade);
CREATE INDEX idx_question_bank_difficulty ON question_bank(difficulty);

-- RLS Policies
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;

-- Teachers can manage their own question bank
CREATE POLICY teachers_manage_own_questions ON question_bank
  FOR ALL
  USING (
    teacher_id IN (
      SELECT user_id FROM user_roles WHERE role = 'teacher'
    )
  );

-- Trigger to update updated_at
CREATE TRIGGER update_question_bank_updated_at
  BEFORE UPDATE ON question_bank
  FOR EACH ROW
  EXECUTE FUNCTION update_stem_updated_at();

-- Add is_from_bank column to exam_questions to track which came from question bank
ALTER TABLE exam_questions
ADD COLUMN is_from_bank boolean DEFAULT false,
ADD COLUMN question_bank_id uuid REFERENCES question_bank(id) ON DELETE SET NULL;