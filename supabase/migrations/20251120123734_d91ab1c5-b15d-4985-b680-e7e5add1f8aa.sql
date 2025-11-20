-- Create storage bucket for school logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-logos', 'school-logos', true);

-- Create RLS policies for school-logos bucket
CREATE POLICY "Teachers can upload school logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'school-logos' AND
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'teacher'
  )
);

CREATE POLICY "Teachers can update their school logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'school-logos' AND
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'teacher'
  )
);

CREATE POLICY "Teachers can delete their school logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'school-logos' AND
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'teacher'
  )
);

CREATE POLICY "Anyone can view school logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'school-logos');