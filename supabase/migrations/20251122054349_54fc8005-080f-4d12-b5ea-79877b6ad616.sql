-- Create shared_questions table for sharing questions between teachers
CREATE TABLE IF NOT EXISTS public.shared_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES public.user_registrations(id) ON DELETE CASCADE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  share_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  view_count INTEGER NOT NULL DEFAULT 0,
  copy_count INTEGER NOT NULL DEFAULT 0
);

-- Create shared_templates table for sharing templates between teachers
CREATE TABLE IF NOT EXISTS public.shared_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.question_templates(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES public.user_registrations(id) ON DELETE CASCADE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  share_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  view_count INTEGER NOT NULL DEFAULT 0,
  copy_count INTEGER NOT NULL DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shared_questions_is_public ON public.shared_questions(is_public);
CREATE INDEX IF NOT EXISTS idx_shared_questions_shared_by ON public.shared_questions(shared_by);
CREATE INDEX IF NOT EXISTS idx_shared_templates_is_public ON public.shared_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_shared_templates_shared_by ON public.shared_templates(shared_by);

-- Enable RLS
ALTER TABLE public.shared_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shared_questions
CREATE POLICY "Teachers can view public shared questions"
  ON public.shared_questions
  FOR SELECT
  USING (
    is_public = true OR
    shared_by IN (
      SELECT user_id FROM user_roles WHERE role = 'teacher'
    )
  );

CREATE POLICY "Teachers can share their own questions"
  ON public.shared_questions
  FOR INSERT
  WITH CHECK (
    shared_by IN (
      SELECT user_id FROM user_roles WHERE role = 'teacher'
    )
  );

CREATE POLICY "Teachers can manage their own shared questions"
  ON public.shared_questions
  FOR ALL
  USING (
    shared_by IN (
      SELECT user_id FROM user_roles WHERE role = 'teacher'
    )
  );

-- RLS Policies for shared_templates
CREATE POLICY "Teachers can view public shared templates"
  ON public.shared_templates
  FOR SELECT
  USING (
    is_public = true OR
    shared_by IN (
      SELECT user_id FROM user_roles WHERE role = 'teacher'
    )
  );

CREATE POLICY "Teachers can share their own templates"
  ON public.shared_templates
  FOR INSERT
  WITH CHECK (
    shared_by IN (
      SELECT user_id FROM user_roles WHERE role = 'teacher'
    )
  );

CREATE POLICY "Teachers can manage their own shared templates"
  ON public.shared_templates
  FOR ALL
  USING (
    shared_by IN (
      SELECT user_id FROM user_roles WHERE role = 'teacher'
    )
  );

-- Function to generate unique share codes
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate share codes
CREATE OR REPLACE FUNCTION auto_generate_share_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.share_code IS NULL THEN
    NEW.share_code := generate_share_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_share_code_for_questions
  BEFORE INSERT ON public.shared_questions
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_share_code();

CREATE TRIGGER generate_share_code_for_templates
  BEFORE INSERT ON public.shared_templates
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_share_code();