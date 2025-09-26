-- Create function to logout user (clear session)
CREATE OR REPLACE FUNCTION public.logout_user_session(user_email text, session_id text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Clear user session info
    UPDATE public.user_registrations 
    SET 
        is_online = false,
        session_id = NULL,
        device_info = NULL,
        last_activity_at = NULL
    WHERE parent_email = user_email 
    AND (session_id IS NULL OR user_registrations.session_id = logout_user_session.session_id);
    
    RETURN FOUND;
END;
$function$