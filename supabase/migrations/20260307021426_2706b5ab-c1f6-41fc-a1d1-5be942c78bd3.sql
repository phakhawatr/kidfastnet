CREATE OR REPLACE FUNCTION public.admin_update_school(
  p_school_id uuid,
  p_data jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE schools
  SET
    name = COALESCE(p_data->>'name', name),
    code = COALESCE(p_data->>'code', code),
    address = COALESCE(p_data->>'address', address),
    district = COALESCE(p_data->>'district', district),
    province = COALESCE(p_data->>'province', province),
    phone = COALESCE(p_data->>'phone', phone),
    email = COALESCE(p_data->>'email', email),
    website = COALESCE(p_data->>'website', website),
    logo_url = COALESCE(p_data->>'logo_url', logo_url),
    updated_at = now()
  WHERE id = p_school_id;
  
  RETURN FOUND;
END;
$$;