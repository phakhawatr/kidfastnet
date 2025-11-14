-- Add support for NT assessment type
-- Add assessment_type column to track semester vs NT assessments
ALTER TABLE level_assessments 
ADD COLUMN IF NOT EXISTS assessment_type TEXT DEFAULT 'semester';

-- Add weighted_score for NT scoring (optional - for future detailed scoring)
ALTER TABLE level_assessments 
ADD COLUMN IF NOT EXISTS weighted_score NUMERIC(5,2);

-- Make semester nullable since NT doesn't have semesters
ALTER TABLE level_assessments 
ALTER COLUMN semester DROP NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_level_assessments_assessment_type 
ON level_assessments(assessment_type);

-- Add comments
COMMENT ON COLUMN level_assessments.assessment_type IS 'Type of assessment: semester or nt';
COMMENT ON COLUMN level_assessments.weighted_score IS 'Weighted score for NT assessments (3-4 points per question)';
COMMENT ON COLUMN level_assessments.semester IS 'Semester number (1 or 2) for semester assessments, null for NT';