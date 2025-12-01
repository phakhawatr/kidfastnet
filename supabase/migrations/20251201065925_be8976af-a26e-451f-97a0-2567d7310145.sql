-- Fix AI quota issue: Reset user's AI usage count and quota reset date
-- Remove daily_mission_generation logs as they should not count against user quota

-- Reset user's AI quota (user: 08f240f1-8a2e-4e87-9eab-eacb00c8bf28)
UPDATE user_registrations 
SET ai_usage_count = 0,
    ai_quota_reset_date = '2025-01-01'
WHERE id = '08f240f1-8a2e-4e87-9eab-eacb00c8bf28';

-- Remove daily_mission_generation logs from all users (they shouldn't count)
DELETE FROM ai_usage_logs 
WHERE feature_type = 'daily_mission_generation';