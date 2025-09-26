-- Add session tracking fields to user_registrations table
ALTER TABLE public.user_registrations 
ADD COLUMN is_online BOOLEAN DEFAULT false,
ADD COLUMN session_id TEXT DEFAULT NULL,
ADD COLUMN device_info TEXT DEFAULT NULL,
ADD COLUMN last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;