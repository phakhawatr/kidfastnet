-- Fix foreign key constraint for admin_id in question_bank
-- The admin_id should reference admins table, not user_registrations table

-- Drop the incorrect foreign key constraint
ALTER TABLE question_bank 
DROP CONSTRAINT IF EXISTS question_bank_admin_id_fkey;

-- Add the correct foreign key constraint pointing to admins table
ALTER TABLE question_bank 
ADD CONSTRAINT question_bank_admin_id_fkey 
FOREIGN KEY (admin_id) 
REFERENCES admins(id) 
ON DELETE SET NULL;