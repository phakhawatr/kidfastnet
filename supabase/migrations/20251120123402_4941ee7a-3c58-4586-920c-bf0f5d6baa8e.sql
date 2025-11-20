-- Add school name and logo fields to exam_links table
ALTER TABLE exam_links 
ADD COLUMN school_name TEXT,
ADD COLUMN school_logo_url TEXT;