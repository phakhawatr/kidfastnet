-- Phase 3: Improve Database Trigger for Phone Validation

-- 1. Update validate_phone_format to accept both formats (with and without hyphens)
CREATE OR REPLACE FUNCTION public.validate_phone_format(phone text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
BEGIN
  -- Accept standard format with hyphens: 08X-XXX-XXXX
  IF phone ~* '^(08[0-9]|09[0-9]|06[0-9])-[0-9]{3}-[0-9]{4}$' THEN
    RETURN true;
  END IF;
  
  -- Also accept format without hyphens: 08XXXXXXX
  IF phone ~* '^(08[0-9]|09[0-9]|06[0-9])[0-9]{7}$' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;

-- 2. Update validate_user_registration trigger to auto-sanitize phone numbers
CREATE OR REPLACE FUNCTION public.validate_user_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only validate fields that are actually being changed (for UPDATE) or being set (for INSERT)
  
  -- Validate nickname only if it's being changed
  IF (TG_OP = 'INSERT' OR NEW.nickname IS DISTINCT FROM OLD.nickname) THEN
    IF length(trim(NEW.nickname)) = 0 OR length(NEW.nickname) > 50 THEN
      RAISE EXCEPTION 'Nickname must be between 1 and 50 characters';
    END IF;
    NEW.nickname = trim(NEW.nickname);
  END IF;

  -- Validate age only if it's being changed
  IF (TG_OP = 'INSERT' OR NEW.age IS DISTINCT FROM OLD.age) THEN
    IF NEW.age < 1 OR NEW.age > 150 THEN
      RAISE EXCEPTION 'Age must be between 1 and 150';
    END IF;
  END IF;

  -- Validate grade only if it's being changed
  IF (TG_OP = 'INSERT' OR NEW.grade IS DISTINCT FROM OLD.grade) THEN
    IF length(trim(NEW.grade)) = 0 OR length(NEW.grade) > 10 THEN
      RAISE EXCEPTION 'Grade must be between 1 and 10 characters';
    END IF;
    NEW.grade = trim(NEW.grade);
  END IF;

  -- Validate parent email only if it's being changed
  IF (TG_OP = 'INSERT' OR NEW.parent_email IS DISTINCT FROM OLD.parent_email) THEN
    IF NOT validate_email_format(NEW.parent_email) THEN
      RAISE EXCEPTION 'Invalid email format';
    END IF;
    NEW.parent_email = trim(lower(NEW.parent_email));
  END IF;

  -- Validate and auto-sanitize parent phone only if it's being changed AND not null
  IF (TG_OP = 'INSERT' OR NEW.parent_phone IS DISTINCT FROM OLD.parent_phone) THEN
    IF NEW.parent_phone IS NOT NULL THEN
      -- Auto-sanitize: Convert similar characters to numbers
      -- Ø, ø, Ｏ, ｏ, O, o → 0
      NEW.parent_phone = regexp_replace(NEW.parent_phone, '[ØøＯｏOo]', '0', 'g');
      -- l, L, ｌ, Ｌ, I, i → 1
      NEW.parent_phone = regexp_replace(NEW.parent_phone, '[lLｌＬIiｉＩ]', '1', 'g');
      
      -- Remove all non-digit and non-hyphen characters (spaces, special chars, etc.)
      NEW.parent_phone = regexp_replace(NEW.parent_phone, '[^0-9-]', '', 'g');
      
      -- Auto-format: Add hyphens if not present (for 10-digit numbers)
      IF NEW.parent_phone !~ '-' AND length(NEW.parent_phone) = 10 THEN
        NEW.parent_phone = substring(NEW.parent_phone from 1 for 3) || '-' || 
                           substring(NEW.parent_phone from 4 for 3) || '-' || 
                           substring(NEW.parent_phone from 7 for 4);
      END IF;
      
      -- Trim any remaining whitespace
      NEW.parent_phone = trim(NEW.parent_phone);
      
      -- Validate the sanitized phone number
      IF NOT validate_phone_format(NEW.parent_phone) THEN
        RAISE EXCEPTION 'Invalid phone format: %. Must be 08X-XXX-XXXX, 09X-XXX-XXXX, or 06X-XXX-XXXX format', NEW.parent_phone;
      END IF;
    END IF;
  END IF;

  -- Validate password only if it's being changed (only on INSERT and when password is actually changed)
  IF (TG_OP = 'INSERT' OR (NEW.password_hash IS DISTINCT FROM OLD.password_hash AND NEW.password_hash IS NOT NULL)) THEN
    IF length(NEW.password_hash) < 6 OR length(NEW.password_hash) > 100 THEN
      RAISE EXCEPTION 'Password must be between 6 and 100 characters';
    END IF;
  END IF;

  -- Trim learning_style if it's being changed
  IF (TG_OP = 'INSERT' OR NEW.learning_style IS DISTINCT FROM OLD.learning_style) THEN
    IF NEW.learning_style IS NOT NULL THEN
      NEW.learning_style = trim(NEW.learning_style);
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;