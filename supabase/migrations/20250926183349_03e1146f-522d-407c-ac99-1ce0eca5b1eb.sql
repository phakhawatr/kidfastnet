-- Drop and recreate the function with login stats
DROP FUNCTION public.get_user_registrations();

CREATE OR REPLACE FUNCTION public.get_user_registrations()
 RETURNS TABLE(id uuid, nickname text, age integer, grade text, avatar text, learning_style text, parent_email text, parent_phone text, status text, created_at timestamp with time zone, approved_at timestamp with time zone, approved_by uuid, login_count integer, last_login_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- This function bypasses RLS - only call from authenticated admin code
    RETURN QUERY 
    SELECT 
        ur.id,
        ur.nickname,
        ur.age,
        ur.grade,
        ur.avatar,
        ur.learning_style,
        ur.parent_email,
        ur.parent_phone,
        ur.status,
        ur.created_at,
        ur.approved_at,
        ur.approved_by,
        COALESCE(ur.login_count, 0) as login_count,
        ur.last_login_at
    FROM public.user_registrations ur
    ORDER BY ur.created_at DESC;
END;
$function$