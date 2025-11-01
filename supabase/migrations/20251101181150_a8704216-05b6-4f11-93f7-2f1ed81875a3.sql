-- Drop old LINE Notify column
ALTER TABLE user_registrations 
DROP COLUMN IF EXISTS line_notify_token;

-- Add LINE Official Account columns
ALTER TABLE user_registrations 
ADD COLUMN line_user_id TEXT UNIQUE,
ADD COLUMN line_display_name TEXT,
ADD COLUMN line_picture_url TEXT,
ADD COLUMN line_connected_at TIMESTAMP WITH TIME ZONE;

-- Create index for line_user_id
CREATE INDEX idx_line_user_id ON user_registrations(line_user_id);

-- Create line_link_codes table for account linking
CREATE TABLE line_link_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_registrations(id) ON DELETE CASCADE,
  link_code TEXT NOT NULL UNIQUE,
  line_user_id TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for line_link_codes
CREATE INDEX idx_link_code ON line_link_codes(link_code);
CREATE INDEX idx_link_code_expires ON line_link_codes(expires_at);
CREATE INDEX idx_link_code_user_id ON line_link_codes(user_id);

-- Enable RLS on line_link_codes
ALTER TABLE line_link_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own link codes
CREATE POLICY "Users can view their own link codes"
ON line_link_codes FOR SELECT
USING (user_id IN (
  SELECT id FROM user_registrations 
  WHERE parent_email = (auth.jwt()->>'email')
));

-- RLS Policy: Users can update their own LINE info
CREATE POLICY "Users can update their own LINE info v2"
ON user_registrations FOR UPDATE
USING (parent_email = (auth.jwt()->>'email'))
WITH CHECK (parent_email = (auth.jwt()->>'email'));

COMMENT ON COLUMN user_registrations.line_user_id IS 'LINE User ID from LINE Official Account';
COMMENT ON COLUMN user_registrations.line_display_name IS 'LINE Display Name';
COMMENT ON COLUMN user_registrations.line_picture_url IS 'LINE Profile Picture URL';
COMMENT ON COLUMN user_registrations.line_connected_at IS 'Timestamp when LINE account was connected';
COMMENT ON TABLE line_link_codes IS 'Temporary codes for linking LINE accounts to user accounts';