-- Add question_attempts column to daily_missions table for storing individual question data
ALTER TABLE daily_missions ADD COLUMN IF NOT EXISTS question_attempts JSONB;

-- Add comment explaining the structure
COMMENT ON COLUMN daily_missions.question_attempts IS 'Array of question attempts with structure: [{index, question, userAnswer, correctAnswer, isCorrect}]';