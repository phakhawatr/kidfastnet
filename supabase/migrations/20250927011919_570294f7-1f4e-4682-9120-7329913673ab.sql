-- Update session timeout from 5 minutes to 30 minutes
CREATE OR REPLACE FUNCTION public.check_user_session_status(user_email text, new_session_id text, new_device_info text DEFAULT NULL::text)
 RETURNS TABLE(can_login boolean, message text, user_id uuid, nickname text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    user_record RECORD;
BEGIN
    -- Find the user by email
    SELECT ur.id, ur.nickname, ur.parent_email, ur.is_online, ur.session_id, ur.last_activity_at
    INTO user_record
    FROM public.user_registrations ur 
    WHERE ur.parent_email = user_email 
    AND ur.status = 'approved';
    
    -- Check if user exists
    IF user_record.id IS NULL THEN
        RETURN QUERY SELECT false, 'ไม่พบบัญชีผู้ใช้หรือยังไม่ได้รับการอนุมัติ'::text, NULL::UUID, NULL::TEXT;
        RETURN;
    END IF;
    
    -- Check if user is currently online from another session
    IF user_record.is_online = true AND user_record.session_id IS NOT NULL AND user_record.session_id != new_session_id THEN
        -- Check if the session is still active (within last 30 minutes)
        IF user_record.last_activity_at > (now() - interval '30 minutes') THEN
            RETURN QUERY SELECT false, 'ชื่อบัญชีนี้กำลังใช้งานอยู่ กรุณาออกจากระบบในอุปกรณ์อื่นก่อน'::text, user_record.id, user_record.nickname;
            RETURN;
        ELSE
            -- Session expired, allow new login
            UPDATE public.user_registrations 
            SET is_online = false, session_id = NULL, device_info = NULL, last_activity_at = NULL
            WHERE id = user_record.id;
        END IF;
    END IF;
    
    -- User can login
    RETURN QUERY SELECT true, 'สามารถเข้าสู่ระบบได้'::text, user_record.id, user_record.nickname;
END;
$function$