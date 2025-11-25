-- Drop old unique constraint that only allows 1 mission per day
ALTER TABLE daily_missions 
DROP CONSTRAINT IF EXISTS daily_missions_user_id_mission_date_key;

-- Create new unique constraint that allows 3 missions per day (one for each option 1, 2, 3)
ALTER TABLE daily_missions
ADD CONSTRAINT daily_missions_user_date_option_key 
UNIQUE (user_id, mission_date, mission_option);