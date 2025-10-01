-- Fix search_path for validation functions to prevent security warnings

-- Update email validation function with search_path
CREATE OR REPLACE FUNCTION public.validate_email_format(email text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

-- Update phone validation function with search_path
CREATE OR REPLACE FUNCTION public.validate_phone_format(phone text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN phone ~* '^(08[0-9]|09[0-9]|06[0-9])-[0-9]{3}-[0-9]{4}$';
END;
$$;
