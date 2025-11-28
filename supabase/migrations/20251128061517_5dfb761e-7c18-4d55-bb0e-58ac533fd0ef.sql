-- Add columns for second LINE account
ALTER TABLE user_registrations 
ADD COLUMN IF NOT EXISTS line_user_id_2 text,
ADD COLUMN IF NOT EXISTS line_display_name_2 text,
ADD COLUMN IF NOT EXISTS line_picture_url_2 text,
ADD COLUMN IF NOT EXISTS line_connected_at_2 timestamp with time zone;

-- Add account_number column to line_link_codes to track which account is being linked
ALTER TABLE line_link_codes 
ADD COLUMN IF NOT EXISTS account_number integer DEFAULT 1;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_registrations_line_user_id_2 ON user_registrations(line_user_id_2);

-- Update comment
COMMENT ON COLUMN user_registrations.line_user_id_2 IS 'LINE user ID for second guardian account';
COMMENT ON COLUMN line_link_codes.account_number IS 'Which LINE account this link code is for (1 or 2)';