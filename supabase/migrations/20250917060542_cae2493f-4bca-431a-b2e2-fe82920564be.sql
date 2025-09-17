-- CLEANUP: Remove duplicate INSERT policy for user_registrations
-- Keep the newer, more clearly named policy and remove the old one

DROP POLICY IF EXISTS "Allow public registration insert" ON public.user_registrations;

-- The "Public can insert new registrations" policy remains active
-- This ensures clean, non-redundant security policies