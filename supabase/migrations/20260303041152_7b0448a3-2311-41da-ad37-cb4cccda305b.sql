-- Create storage bucket for chart images (public access for LINE to read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chart-images', 'chart-images', true, 5242880, ARRAY['image/png', 'image/jpeg'])
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read chart images (public bucket)
CREATE POLICY "Chart images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'chart-images');

-- Allow authenticated or anon users to upload chart images
CREATE POLICY "Anyone can upload chart images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chart-images');

-- Allow deletion of chart images (cleanup)
CREATE POLICY "Anyone can delete chart images"
ON storage.objects FOR DELETE
USING (bucket_id = 'chart-images');