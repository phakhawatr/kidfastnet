-- Add LINE Notify token column to user_registrations table
ALTER TABLE user_registrations 
ADD COLUMN line_notify_token TEXT;

-- Add comment for documentation
COMMENT ON COLUMN user_registrations.line_notify_token IS 'LINE Notify token for sending quiz results to parents';

-- Create RLS policy to allow users to update their own token
CREATE POLICY "Users can update their own LINE Notify token"
ON user_registrations
FOR UPDATE
USING (parent_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
WITH CHECK (parent_email = (SELECT email FROM auth.users WHERE id = auth.uid()));