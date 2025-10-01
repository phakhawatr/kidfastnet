-- Fix validation trigger to only validate fields that are being modified
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

  -- Validate parent phone only if it's being changed AND not null
  IF (TG_OP = 'INSERT' OR NEW.parent_phone IS DISTINCT FROM OLD.parent_phone) THEN
    IF NEW.parent_phone IS NOT NULL AND NOT validate_phone_format(NEW.parent_phone) THEN
      RAISE EXCEPTION 'Invalid phone format. Must be in format: 08X-XXX-XXXX';
    END IF;
    IF NEW.parent_phone IS NOT NULL THEN
      NEW.parent_phone = trim(NEW.parent_phone);
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