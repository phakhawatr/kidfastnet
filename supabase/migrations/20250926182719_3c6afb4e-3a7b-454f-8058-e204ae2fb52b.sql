-- Add login tracking fields to user_registrations table
ALTER TABLE public.user_registrations 
ADD COLUMN login_count INTEGER DEFAULT 0,
ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create function to update login stats
CREATE OR REPLACE FUNCTION public.update_login_stats(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update login count and last login time for the user
  UPDATE public.user_registrations 
  SET 
    login_count = COALESCE(login_count, 0) + 1,
    last_login_at = now()
  WHERE parent_email = user_email AND status = 'approved';
  
  RETURN FOUND;
END;
$function$