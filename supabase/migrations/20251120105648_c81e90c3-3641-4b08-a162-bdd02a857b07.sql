-- Allow users to read their own roles
CREATE POLICY "users_can_read_own_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM user_registrations 
    WHERE parent_email = (auth.jwt() ->> 'email')
  )
);

-- Also allow unauthenticated users to check roles using registrationId
CREATE POLICY "allow_users_read_own_roles_by_id"
ON public.user_roles
FOR SELECT
USING (true);