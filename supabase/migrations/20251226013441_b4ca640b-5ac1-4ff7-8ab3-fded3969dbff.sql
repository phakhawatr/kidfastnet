-- Function: Auto-create user_registrations for Google OAuth users
CREATE OR REPLACE FUNCTION public.handle_google_oauth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_name text;
  v_email text;
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
    
    -- Create record in user_registrations (auto-approved, free tier)
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
    )
    ON CONFLICT (id) DO UPDATE SET
      parent_email = EXCLUDED.parent_email,
      nickname = COALESCE(NULLIF(user_registrations.nickname, ''), EXCLUDED.nickname);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_google_user_created ON auth.users;

-- Create trigger for Google OAuth users
CREATE TRIGGER on_google_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_google_oauth_user();