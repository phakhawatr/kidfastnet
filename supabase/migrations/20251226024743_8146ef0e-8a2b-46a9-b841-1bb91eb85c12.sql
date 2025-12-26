-- Fix OAuth login for existing email users
-- Change ON CONFLICT to handle parent_email instead of id
CREATE OR REPLACE FUNCTION public.handle_google_oauth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_name text;
  v_email text;
  v_existing_id uuid;
BEGIN
  -- Only process Google OAuth users
  IF NEW.raw_app_meta_data->>'provider' = 'google' THEN
    -- Get name and email from user metadata
    v_name := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    );
    v_email := NEW.email;
    
    -- Check if email already exists in user_registrations
    SELECT id INTO v_existing_id 
    FROM public.user_registrations 
    WHERE parent_email = v_email;
    
    IF v_existing_id IS NOT NULL THEN
      -- Email exists: Update existing record to link with this OAuth user ID
      -- This allows existing email/password users to also login with Google
      UPDATE public.user_registrations
      SET 
        id = NEW.id,  -- Link to OAuth user ID
        status = 'approved',
        approved_at = COALESCE(approved_at, NOW())
      WHERE parent_email = v_email;
    ELSE
      -- Email doesn't exist: Create new record
      INSERT INTO public.user_registrations (
        id,
        nickname,
        age,
        grade,
        avatar,
        parent_email,
        password_hash,
        status,
        subscription_tier,
        approved_at,
        ai_features_enabled,
        ai_monthly_quota,
        ai_usage_count
      ) VALUES (
        NEW.id,
        v_name,
        10, -- default age
        'ป.4', -- default grade
        'cat', -- default avatar
        v_email,
        '', -- no password for OAuth
        'approved', -- Auto-approved!
        'basic', -- Free tier
        NOW(),
        false, -- AI features disabled for free tier
        0,
        0
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;