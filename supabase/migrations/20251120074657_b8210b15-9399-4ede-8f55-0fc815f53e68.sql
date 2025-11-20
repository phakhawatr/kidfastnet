-- Phase 1: Add Teacher Mode Foundation

-- 1. Add 'teacher' role to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'teacher';

-- 2. Create exam_links table (เก็บ link ข้อสอบที่ครูสร้าง)
CREATE TABLE IF NOT EXISTS exam_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES user_registrations(id) ON DELETE CASCADE,
  link_code TEXT NOT NULL UNIQUE,
  grade INTEGER NOT NULL,
  semester INTEGER,
  assessment_type TEXT NOT NULL DEFAULT 'semester',
  max_students INTEGER NOT NULL DEFAULT 30,
  current_students INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for exam_links
CREATE INDEX IF NOT EXISTS idx_exam_links_link_code ON exam_links(link_code);
CREATE INDEX IF NOT EXISTS idx_exam_links_teacher_id ON exam_links(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exam_links_status ON exam_links(status);

-- Enable RLS for exam_links
ALTER TABLE exam_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exam_links
CREATE POLICY "Teachers can view their own exam links"
  ON exam_links FOR SELECT
  USING (teacher_id IN (
    SELECT id FROM user_registrations 
    WHERE parent_email = (auth.jwt() ->> 'email')
  ));

CREATE POLICY "Teachers can create exam links"
  ON exam_links FOR INSERT
  WITH CHECK (teacher_id IN (
    SELECT id FROM user_registrations 
    WHERE parent_email = (auth.jwt() ->> 'email')
  ));

CREATE POLICY "Teachers can update their own exam links"
  ON exam_links FOR UPDATE
  USING (teacher_id IN (
    SELECT id FROM user_registrations 
    WHERE parent_email = (auth.jwt() ->> 'email')
  ));

CREATE POLICY "Public can read active exam links by code"
  ON exam_links FOR SELECT
  USING (status = 'active');

-- 3. Create exam_sessions table (เก็บผลการทำข้อสอบของนักเรียนภายนอก)
CREATE TABLE IF NOT EXISTS exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_link_id UUID NOT NULL REFERENCES exam_links(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_class TEXT NOT NULL,
  student_number INTEGER NOT NULL,
  grade INTEGER NOT NULL,
  semester INTEGER,
  assessment_type TEXT NOT NULL DEFAULT 'semester',
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score NUMERIC NOT NULL,
  time_taken INTEGER NOT NULL,
  assessment_data JSONB,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for exam_sessions
CREATE INDEX IF NOT EXISTS idx_exam_sessions_exam_link_id ON exam_sessions(exam_link_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_score ON exam_sessions(exam_link_id, score DESC);

-- Enable RLS for exam_sessions
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exam_sessions
CREATE POLICY "Teachers can view sessions for their exam links"
  ON exam_sessions FOR SELECT
  USING (exam_link_id IN (
    SELECT id FROM exam_links 
    WHERE teacher_id IN (
      SELECT id FROM user_registrations 
      WHERE parent_email = (auth.jwt() ->> 'email')
    )
  ));

CREATE POLICY "Anyone can insert exam sessions"
  ON exam_sessions FOR INSERT
  WITH CHECK (true);

-- 4. Create trigger function to increment student count
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS after_exam_session_insert ON exam_sessions;
CREATE TRIGGER after_exam_session_insert
AFTER INSERT ON exam_sessions
FOR EACH ROW
EXECUTE FUNCTION increment_exam_students();