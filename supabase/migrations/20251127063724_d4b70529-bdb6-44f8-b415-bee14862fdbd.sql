-- Fix missions with completed_at set but status still pending
-- This fixes the data inconsistency bug where missions have completed_at timestamp
-- but status remains 'pending' with correct_answers=0 and stars_earned=0

UPDATE daily_missions
SET status = 'completed'
WHERE completed_at IS NOT NULL 
  AND status = 'pending';

-- Log the affected records for audit
DO $$
DECLARE
  affected_count INTEGER;
BEGIN
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RAISE NOTICE 'Fixed % missions with completed_at but pending status', affected_count;
END $$;

-- Add a database trigger to prevent this issue in the future
-- Ensures that if completed_at is set, status must be 'completed'
CREATE OR REPLACE FUNCTION ensure_completed_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If completed_at is being set and status is not 'completed' or 'catchup', force it to 'completed'
  IF NEW.completed_at IS NOT NULL AND NEW.status NOT IN ('completed', 'catchup') THEN
    NEW.status := 'completed';
    RAISE NOTICE 'Auto-corrected status to completed for mission %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_ensure_completed_status ON daily_missions;

CREATE TRIGGER trigger_ensure_completed_status
  BEFORE INSERT OR UPDATE ON daily_missions
  FOR EACH ROW
  EXECUTE FUNCTION ensure_completed_status();