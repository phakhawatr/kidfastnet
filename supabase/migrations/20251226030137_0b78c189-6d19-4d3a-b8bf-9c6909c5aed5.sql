-- Add composite index on daily_missions for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_missions_user_date 
ON public.daily_missions(user_id, mission_date);

-- Add partial index for pending missions (commonly queried)
CREATE INDEX IF NOT EXISTS idx_daily_missions_pending 
ON public.daily_missions(user_id, mission_date) 
WHERE status = 'pending';

-- Add index for user_streaks
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id 
ON public.user_streaks(user_id);

-- Improve exam_sessions query performance
CREATE INDEX IF NOT EXISTS idx_exam_sessions_link_student 
ON public.exam_sessions(exam_link_id, student_number);

-- Improve question_bank query performance for teachers
CREATE INDEX IF NOT EXISTS idx_question_bank_teacher_grade 
ON public.question_bank(teacher_id, grade) 
WHERE teacher_id IS NOT NULL;