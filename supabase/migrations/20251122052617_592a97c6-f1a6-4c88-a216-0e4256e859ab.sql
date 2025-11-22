-- Phase 1: Enhance question_bank table
ALTER TABLE question_bank 
ADD COLUMN IF NOT EXISTS topic TEXT,
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_variables JSONB,
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Create curriculum_topics table
CREATE TABLE IF NOT EXISTS curriculum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade INTEGER NOT NULL,
  semester INTEGER,
  subject TEXT NOT NULL DEFAULT 'math',
  topic_name_th TEXT NOT NULL,
  topic_name_en TEXT NOT NULL,
  skill_category TEXT NOT NULL,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE curriculum_topics ENABLE ROW LEVEL SECURITY;

-- Anyone can view curriculum topics
CREATE POLICY "Anyone can view curriculum topics"
ON curriculum_topics FOR SELECT
USING (true);

-- Create question_templates table
CREATE TABLE IF NOT EXISTS question_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  template_text TEXT NOT NULL,
  variables JSONB NOT NULL,
  answer_formula TEXT NOT NULL,
  choices_formula JSONB,
  grade INTEGER NOT NULL,
  topic TEXT,
  difficulty TEXT NOT NULL,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE question_templates ENABLE ROW LEVEL SECURITY;

-- Teachers can manage their own templates
CREATE POLICY "Teachers can manage their own templates"
ON question_templates FOR ALL
USING (
  teacher_id IN (
    SELECT user_id FROM user_roles WHERE role = 'teacher'
  )
)
WITH CHECK (
  teacher_id IN (
    SELECT user_id FROM user_roles WHERE role = 'teacher'
  )
);

-- Seed curriculum topics for grades 1-6
INSERT INTO curriculum_topics (grade, semester, subject, topic_name_th, topic_name_en, skill_category, order_index) VALUES
-- Grade 1
(1, 1, 'math', 'การนับจำนวน 1-10', 'Counting 1-10', 'number_sense', 1),
(1, 1, 'math', 'การบวกเลขภายใน 10', 'Addition within 10', 'addition', 2),
(1, 1, 'math', 'การลบเลขภายใน 10', 'Subtraction within 10', 'subtraction', 3),
(1, 2, 'math', 'การนับจำนวน 11-20', 'Counting 11-20', 'number_sense', 4),
(1, 2, 'math', 'รูปร่างพื้นฐาน', 'Basic Shapes', 'geometry', 5),

-- Grade 2
(2, 1, 'math', 'การบวกภายใน 100', 'Addition within 100', 'addition', 1),
(2, 1, 'math', 'การลบภายใน 100', 'Subtraction within 100', 'subtraction', 2),
(2, 1, 'math', 'การวัดความยาว', 'Measuring Length', 'measurement', 3),
(2, 2, 'math', 'ตารางสูตรคูณ', 'Multiplication Tables', 'multiplication', 4),
(2, 2, 'math', 'เวลา', 'Time', 'time', 5),

-- Grade 3
(3, 1, 'math', 'การคูณภายใน 100', 'Multiplication within 100', 'multiplication', 1),
(3, 1, 'math', 'การหารพื้นฐาน', 'Basic Division', 'division', 2),
(3, 1, 'math', 'เศษส่วน', 'Fractions', 'fractions', 3),
(3, 2, 'math', 'การวัดน้ำหนัก', 'Measuring Weight', 'measurement', 4),
(3, 2, 'math', 'พื้นที่และปริมาตร', 'Area and Volume', 'geometry', 5),

-- Grade 4
(4, 1, 'math', 'ทศนิยม', 'Decimals', 'decimals', 1),
(4, 1, 'math', 'เศษส่วนขั้นสูง', 'Advanced Fractions', 'fractions', 2),
(4, 1, 'math', 'การคูณและหารจำนวนมาก', 'Multi-digit Multiplication and Division', 'multiplication', 3),
(4, 2, 'math', 'กราฟและแผนภูมิ', 'Graphs and Charts', 'data', 4),
(4, 2, 'math', 'มุม', 'Angles', 'geometry', 5),

-- Grade 5
(5, 1, 'math', 'เปอร์เซ็นต์', 'Percentages', 'percentages', 1),
(5, 1, 'math', 'อัตราส่วนและสัดส่วน', 'Ratios and Proportions', 'ratios', 2),
(5, 1, 'math', 'พื้นที่รูปทรงเรขาคณิต', 'Area of Geometric Shapes', 'geometry', 3),
(5, 2, 'math', 'ความน่าจะเป็น', 'Probability', 'probability', 4),
(5, 2, 'math', 'สมการพื้นฐาน', 'Basic Equations', 'algebra', 5),

-- Grade 6
(6, 1, 'math', 'พีชคณิตเบื้องต้น', 'Introduction to Algebra', 'algebra', 1),
(6, 1, 'math', 'เรขาคณิตขั้นสูง', 'Advanced Geometry', 'geometry', 2),
(6, 1, 'math', 'จำนวนเต็ม', 'Integers', 'number_sense', 3),
(6, 2, 'math', 'สถิติและข้อมูล', 'Statistics and Data', 'data', 4),
(6, 2, 'math', 'ปริมาตรและพื้นที่ผิว', 'Volume and Surface Area', 'geometry', 5);

-- Create storage bucket for question images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('question-images', 'question-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for question images
CREATE POLICY "Teachers can upload question images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'question-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view question images"
ON storage.objects FOR SELECT
USING (bucket_id = 'question-images');

CREATE POLICY "Teachers can delete their own question images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'question-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);