-- Add missing session tracking fields if they don't exist
DO $$                  
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_registrations' AND column_name='session_id') THEN
        ALTER TABLE public.user_registrations ADD COLUMN session_id TEXT DEFAULT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_registrations' AND column_name='device_info') THEN
        ALTER TABLE public.user_registrations ADD COLUMN device_info TEXT DEFAULT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_registrations' AND column_name='last_activity_at') THEN
        ALTER TABLE public.user_registrations ADD COLUMN last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    END IF;
END $$;