-- Drop the old strict RLS policy
DROP POLICY IF EXISTS "public_can_register" ON public.user_registrations;

-- Create a more relaxed RLS policy
-- Only check essential security-related fields
-- Let the database trigger handle detailed validation
CREATE POLICY "public_can_register" 
ON public.user_registrations
FOR INSERT
WITH CHECK (
  status = 'pending' 
  AND approved_by IS NULL 
  AND approved_at IS NULL
  AND is_online = false
  AND session_id IS NULL
  AND parent_email LIKE '%@%'
  AND length(parent_email) > 5
);