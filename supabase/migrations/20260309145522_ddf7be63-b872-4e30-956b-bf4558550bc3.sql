
-- Add new columns to user_registrations
ALTER TABLE public.user_registrations 
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS school_name text,
  ADD COLUMN IF NOT EXISTS profile_image_url text;

-- Create profile-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to profile-images bucket
CREATE POLICY "Anyone can upload profile images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'profile-images');

-- Allow public read access
CREATE POLICY "Public read access for profile images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'profile-images');

-- Allow users to update their own images
CREATE POLICY "Anyone can update profile images"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'profile-images');
