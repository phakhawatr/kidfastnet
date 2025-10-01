-- Update authenticate_user to set is_online = true on successful login
CREATE OR REPLACE FUNCTION public.authenticate_user(user_email text, user_password text)
RETURNS TABLE(user_id uuid, member_id text, nickname text, email text, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    user_record RECORD;
BEGIN
    SELECT ur.id, ur.member_id, ur.nickname, ur.parent_email, ur.password_hash 
    INTO user_record
    FROM public.user_registrations ur 
    WHERE ur.parent_email = user_email 
    AND ur.password_hash = user_password 
    AND ur.status = 'approved';
    
    IF user_record.id IS NOT NULL THEN
        UPDATE public.user_registrations 
        SET 
            is_online = true,
            login_count = COALESCE(login_count, 0) + 1,
            last_login_at = now(),
            last_activity_at = now()
        WHERE id = user_record.id;
        
        RETURN QUERY SELECT user_record.id, user_record.member_id, user_record.nickname, user_record.parent_email, true;
    ELSE
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, false;
    END IF;
END;
$function$;