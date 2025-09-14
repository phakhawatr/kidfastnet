-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  nickname TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 5 AND age <= 12),
  grade TEXT NOT NULL CHECK (grade IN ('ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6')),
  avatar TEXT NOT NULL DEFAULT 'cat',
  learning_style TEXT,
  parent_email TEXT NOT NULL,
  parent_phone TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admins table
CREATE TABLE public.admins (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user registrations table for signup data
CREATE TABLE public.user_registrations (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT NOT NULL,
  age INTEGER NOT NULL,
  grade TEXT NOT NULL,
  avatar TEXT NOT NULL,
  learning_style TEXT,
  parent_email TEXT NOT NULL UNIQUE,
  parent_phone TEXT,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES public.admins(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- RLS Policies for admins (only authenticated admins can access)
CREATE POLICY "Admins can view all admins" 
ON public.admins 
FOR SELECT 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can insert admins" 
ON public.admins 
FOR INSERT 
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for user registrations (admins only)
CREATE POLICY "Admins can view all registrations" 
ON public.user_registrations 
FOR SELECT 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update registrations" 
ON public.user_registrations 
FOR UPDATE 
USING (auth.jwt() ->> 'role' = 'admin');

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

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO public.admins (email, password_hash, name) 
VALUES ('admin@kidfast.net', '$2b$10$rQZ8vWJjZYZHk0pLKzJtXuK5M5JnCjK8wNqXyZrKf7ZHkPnJ9zJ8u', 'Admin KidFast');

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
  
  -- Create user profile
  INSERT INTO public.profiles (
    user_id, nickname, age, grade, avatar, learning_style, 
    parent_email, parent_phone, is_approved
  ) VALUES (
    gen_random_uuid(), reg_data.nickname, reg_data.age, reg_data.grade, 
    reg_data.avatar, reg_data.learning_style, reg_data.parent_email, 
    reg_data.parent_phone, true
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;