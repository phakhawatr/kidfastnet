INSERT INTO storage.buckets (id, name, public) VALUES ('quiz-images', 'quiz-images', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for quiz images" ON storage.objects FOR SELECT USING (bucket_id = 'quiz-images');

CREATE POLICY "Service role can upload quiz images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'quiz-images');
