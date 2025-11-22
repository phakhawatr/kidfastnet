-- Add semester and assessment_type to question_bank table
ALTER TABLE question_bank 
ADD COLUMN semester integer,
ADD COLUMN assessment_type text DEFAULT 'semester';

-- Set default values for existing questions
UPDATE question_bank 
SET semester = 1, assessment_type = 'semester1' 
WHERE semester IS NULL;

-- Add comment
COMMENT ON COLUMN question_bank.semester IS 'Semester number (1 or 2) for the question';
COMMENT ON COLUMN question_bank.assessment_type IS 'Assessment type: semester1, semester2, or nt';

-- Add semester and assessment_type to question_templates table
ALTER TABLE question_templates
ADD COLUMN semester integer,
ADD COLUMN assessment_type text DEFAULT 'semester';

-- Set default values for existing templates
UPDATE question_templates 
SET semester = 1, assessment_type = 'semester1' 
WHERE semester IS NULL;

-- Add comment
COMMENT ON COLUMN question_templates.semester IS 'Semester number (1 or 2) for the template';
COMMENT ON COLUMN question_templates.assessment_type IS 'Assessment type: semester1, semester2, or nt';