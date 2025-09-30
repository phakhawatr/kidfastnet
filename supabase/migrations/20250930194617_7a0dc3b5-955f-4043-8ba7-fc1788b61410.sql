-- Add member_id column to user_registrations table
ALTER TABLE public.user_registrations 
ADD COLUMN IF NOT EXISTS member_id text UNIQUE;

-- Create a sequence for member IDs starting from 10000
CREATE SEQUENCE IF NOT EXISTS member_id_seq START WITH 10000;

-- Create a function to generate member ID
CREATE OR REPLACE FUNCTION public.generate_member_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  next_id integer;
  new_member_id text;
BEGIN
  -- Get next sequence value
  next_id := nextval('member_id_seq');
  
  -- Format as 5-digit string with leading zeros
  new_member_id := lpad(next_id::text, 5, '0');
  
  RETURN new_member_id;
END;
$$;

-- Create trigger to auto-generate member_id on insert
CREATE OR REPLACE FUNCTION public.set_member_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.member_id IS NULL THEN
    NEW.member_id = generate_member_id();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_member_id_trigger ON public.user_registrations;
CREATE TRIGGER set_member_id_trigger
BEFORE INSERT ON public.user_registrations
FOR EACH ROW
EXECUTE FUNCTION public.set_member_id();

-- Update existing records with member IDs
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT id FROM public.user_registrations WHERE member_id IS NULL ORDER BY created_at
  LOOP
    UPDATE public.user_registrations 
    SET member_id = generate_member_id()
    WHERE id = rec.id;
  END LOOP;
END $$;

-- Drop and recreate get_user_registrations function to include member_id
DROP FUNCTION IF EXISTS public.get_user_registrations();
CREATE FUNCTION public.get_user_registrations()
RETURNS TABLE(
  id uuid,
  member_id text,
  nickname text,
  age integer,
  grade text,
  avatar text,
  learning_style text,
  parent_email text,
  parent_phone text,
  status text,
  created_at timestamp with time zone,
  approved_at timestamp with time zone,
  approved_by uuid,
  login_count integer,
  last_login_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        ur.id,
        ur.member_id,
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
$$;

-- Drop and recreate authenticate_user function to return member_id
DROP FUNCTION IF EXISTS public.authenticate_user(text, text);
CREATE FUNCTION public.authenticate_user(user_email text, user_password text)
RETURNS TABLE(user_id uuid, member_id text, nickname text, email text, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
            login_count = COALESCE(login_count, 0) + 1,
            last_login_at = now()
        WHERE id = user_record.id;
        
        RETURN QUERY SELECT user_record.id, user_record.member_id, user_record.nickname, user_record.parent_email, true;
    ELSE
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, false;
    END IF;
END;
$$;