-- Create a secure function to authenticate regular users from registrations
CREATE OR REPLACE FUNCTION public.authenticate_user(user_email text, user_password text)
RETURNS TABLE(user_id uuid, nickname text, email text, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Find approved user by email and password
    SELECT ur.id, ur.nickname, ur.parent_email, ur.password_hash 
    INTO user_record
    FROM public.user_registrations ur 
    WHERE ur.parent_email = user_email 
    AND ur.password_hash = user_password 
    AND ur.status = 'approved';
    
    -- Check if user exists and credentials match
    IF user_record.id IS NOT NULL THEN
        RETURN QUERY SELECT user_record.id, user_record.nickname, user_record.parent_email, true;
    ELSE
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, false;
    END IF;
END;
$$;