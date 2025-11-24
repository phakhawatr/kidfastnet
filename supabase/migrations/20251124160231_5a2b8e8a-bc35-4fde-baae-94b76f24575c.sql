-- Drop existing policies that require authentication
DROP POLICY IF EXISTS "Teachers can upload school logos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can view their school logos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update their school logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view school logos" ON storage.objects;

-- Create new policies that allow unauthenticated uploads for school-logos bucket
-- This is safe because the bucket is public and used only for school branding

-- Allow anyone to upload to school-logos (teachers using the system)
CREATE POLICY "Allow uploads to school-logos bucket"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'school-logos');

-- Allow anyone to view school logos
CREATE POLICY "Allow public read of school logos"
ON storage.objects
FOR SELECT
TO anon, authenticated, public
USING (bucket_id = 'school-logos');

-- Allow updates to school logos
CREATE POLICY "Allow updates to school logos"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'school-logos')
WITH CHECK (bucket_id = 'school-logos');

-- Allow deletes (optional, for cleanup)
CREATE POLICY "Allow deletes from school logos"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (bucket_id = 'school-logos');