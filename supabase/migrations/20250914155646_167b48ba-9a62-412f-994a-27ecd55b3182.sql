-- Enable Row Level Security (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can insert admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.user_registrations;
DROP POLICY IF EXISTS "Admins can update registrations" ON public.user_registrations;
DROP POLICY IF EXISTS "Anyone can insert registration" ON public.user_registrations;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- RLS Policies for admins (public access for now, will be restricted in app logic)
CREATE POLICY "Public read access to admins" 
ON public.admins 
FOR SELECT 
USING (true);

-- RLS Policies for user registrations (public access for admin functionality)
CREATE POLICY "Public read access to registrations" 
ON public.user_registrations 
FOR SELECT 
USING (true);

CREATE POLICY "Public update access to registrations" 
ON public.user_registrations 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can insert registration" 
ON public.user_registrations 
FOR INSERT 
WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates (drop if exists first)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to approve user registration
CREATE OR REPLACE FUNCTION public.approve_user_registration(registration_id UUID, admin_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  reg_data RECORD;
BEGIN
  -- Get registration data
  SELECT * INTO reg_data FROM public.user_registrations WHERE id = registration_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update registration status
  UPDATE public.user_registrations 
  SET status = 'approved', approved_by = admin_id, approved_at = now()
  WHERE id = registration_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reject user registration
CREATE OR REPLACE FUNCTION public.reject_user_registration(registration_id UUID, admin_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_registrations 
  SET status = 'rejected', approved_by = admin_id, approved_at = now()
  WHERE id = registration_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;