-- Create function to update user session when they login
CREATE OR REPLACE FUNCTION public.update_user_session(user_email text, session_id text, device_info text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Update user session info
    UPDATE public.user_registrations 
    SET 
        is_online = true,
        session_id = session_id,
        device_info = device_info,
        last_activity_at = now(),
        login_count = COALESCE(login_count, 0) + 1,
        last_login_at = now()
    WHERE parent_email = user_email AND status = 'approved';
    
    RETURN FOUND;
END;
$function$