-- Add columns to support 3 daily mission options
ALTER TABLE daily_missions 
ADD COLUMN IF NOT EXISTS mission_option INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS daily_message TEXT;

-- Add index for better query performance when fetching today's missions
CREATE INDEX IF NOT EXISTS idx_daily_missions_date_user_option 
ON daily_missions(user_id, mission_date, mission_option);

-- Add comment for documentation
COMMENT ON COLUMN daily_missions.mission_option IS 'Mission choice number (1, 2, or 3) for the day - allows multiple mission options';
COMMENT ON COLUMN daily_missions.daily_message IS 'Daily motivational message from AI for the student';