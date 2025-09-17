-- Add some test data for approved users to help with testing
INSERT INTO public.user_registrations (
  nickname, age, grade, avatar, learning_style, 
  parent_email, parent_phone, password_hash, status, approved_at, approved_by
) VALUES 
(
  'ดร.ภค', 
  8, 
  'ป.2', 
  'cat', 
  'เล่นเกมการเรียน',
  'drphakhawatr@gmail.com',
  '081-234-5678',
  '12345678',
  'approved',
  now(),
  (SELECT id FROM public.admins LIMIT 1)
)
ON CONFLICT (parent_email) 
DO UPDATE SET 
  password_hash = '12345678',
  status = 'approved',
  approved_at = now();