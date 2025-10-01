-- Add input validation and security enhancements at database level

-- Create validation function for email format
CREATE OR REPLACE FUNCTION public.validate_email_format(email text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

-- Create validation function for phone format
CREATE OR REPLACE FUNCTION public.validate_phone_format(phone text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN phone ~* '^(08[0-9]|09[0-9]|06[0-9])-[0-9]{3}-[0-9]{4}$';
END;
$$;

-- Create validation function for user registration data
CREATE OR REPLACE FUNCTION public.validate_user_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate nickname
  IF length(trim(NEW.nickname)) = 0 OR length(NEW.nickname) > 50 THEN
    RAISE EXCEPTION 'Nickname must be between 1 and 50 characters';
  END IF;

  -- Validate age
  IF NEW.age < 1 OR NEW.age > 150 THEN
    RAISE EXCEPTION 'Age must be between 1 and 150';
  END IF;

  -- Validate grade
  IF length(trim(NEW.grade)) = 0 OR length(NEW.grade) > 10 THEN
    RAISE EXCEPTION 'Grade must be between 1 and 10 characters';
  END IF;

  -- Validate parent email format
  IF NOT validate_email_format(NEW.parent_email) THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Validate parent phone format if provided
  IF NEW.parent_phone IS NOT NULL AND NOT validate_phone_format(NEW.parent_phone) THEN
    RAISE EXCEPTION 'Invalid phone format. Must be in format: 08X-XXX-XXXX';
  END IF;

  -- Validate password length
  IF length(NEW.password_hash) < 6 OR length(NEW.password_hash) > 100 THEN
    RAISE EXCEPTION 'Password must be between 6 and 100 characters';
  END IF;

  -- Trim whitespace from text fields
  NEW.nickname = trim(NEW.nickname);
  NEW.grade = trim(NEW.grade);
  NEW.parent_email = trim(lower(NEW.parent_email));
  IF NEW.parent_phone IS NOT NULL THEN
    NEW.parent_phone = trim(NEW.parent_phone);
  END IF;
  IF NEW.learning_style IS NOT NULL THEN
    NEW.learning_style = trim(NEW.learning_style);
  END IF;

  RETURN NEW;
END;
$$;

-- Create validation function for admin data
CREATE OR REPLACE FUNCTION public.validate_admin_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate name
  IF length(trim(NEW.name)) = 0 OR length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Name must be between 1 and 100 characters';
  END IF;

  -- Validate email format
  IF NOT validate_email_format(NEW.email) THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Trim whitespace
  NEW.name = trim(NEW.name);
  NEW.email = trim(lower(NEW.email));

  RETURN NEW;
END;
$$;

-- Create validation function for profiles
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate nickname
  IF length(trim(NEW.nickname)) = 0 OR length(NEW.nickname) > 50 THEN
    RAISE EXCEPTION 'Nickname must be between 1 and 50 characters';
  END IF;

  -- Validate age
  IF NEW.age < 1 OR NEW.age > 150 THEN
    RAISE EXCEPTION 'Age must be between 1 and 150';
  END IF;

  -- Validate parent email format
  IF NOT validate_email_format(NEW.parent_email) THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Validate parent phone format if provided
  IF NEW.parent_phone IS NOT NULL AND NOT validate_phone_format(NEW.parent_phone) THEN
    RAISE EXCEPTION 'Invalid phone format';
  END IF;

  -- Trim whitespace
  NEW.nickname = trim(NEW.nickname);
  NEW.grade = trim(NEW.grade);
  NEW.parent_email = trim(lower(NEW.parent_email));
  IF NEW.parent_phone IS NOT NULL THEN
    NEW.parent_phone = trim(NEW.parent_phone);
  END IF;

  RETURN NEW;
END;
$$;

-- Apply validation triggers
DROP TRIGGER IF EXISTS validate_user_registration_trigger ON public.user_registrations;
CREATE TRIGGER validate_user_registration_trigger
  BEFORE INSERT OR UPDATE ON public.user_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_registration();

DROP TRIGGER IF EXISTS validate_admin_data_trigger ON public.admins;
CREATE TRIGGER validate_admin_data_trigger
  BEFORE INSERT OR UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_admin_data();

DROP TRIGGER IF EXISTS validate_profile_data_trigger ON public.profiles;
CREATE TRIGGER validate_profile_data_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_data();

-- Create audit log table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_identifier text,
  ip_address text,
  user_agent text,
  event_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs (through functions)
CREATE POLICY "admins_view_audit_logs" 
ON public.security_audit_log 
FOR SELECT 
USING (false);

-- Create index for faster audit log queries
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at 
ON public.security_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type 
ON public.security_audit_log(event_type);

CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_identifier 
ON public.security_audit_log(user_identifier);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_user_identifier text DEFAULT NULL,
  p_event_data jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO public.security_audit_log (
    event_type,
    user_identifier,
    event_data
  ) VALUES (
    p_event_type,
    p_user_identifier,
    p_event_data
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Add indexes for performance on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_user_registrations_parent_email 
ON public.user_registrations(parent_email);

CREATE INDEX IF NOT EXISTS idx_user_registrations_status 
ON public.user_registrations(status);

CREATE INDEX IF NOT EXISTS idx_user_registrations_is_online 
ON public.user_registrations(is_online) 
WHERE is_online = true;

-- Add comment to document security measures
COMMENT ON TABLE public.security_audit_log IS 
'Audit log for security events including failed login attempts, suspicious activities, and admin actions';

COMMENT ON FUNCTION public.validate_email_format IS 
'Validates email format using regex pattern';

COMMENT ON FUNCTION public.validate_phone_format IS 
'Validates Thai phone number format (08X-XXX-XXXX, 09X-XXX-XXXX, 06X-XXX-XXXX)';
