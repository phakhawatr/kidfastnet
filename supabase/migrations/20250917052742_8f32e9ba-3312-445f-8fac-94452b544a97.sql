-- Add a test admin with simple password for testing
INSERT INTO public.admins (email, name, password_hash) 
VALUES ('admin@kidfast.net', 'ผู้ดูแลระบบ', 'admin123')
ON CONFLICT (email) 
DO UPDATE SET password_hash = 'admin123', name = 'ผู้ดูแลระบบ';