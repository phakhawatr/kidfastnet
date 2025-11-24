-- Add image_urls column to exam_questions table
ALTER TABLE exam_questions
ADD COLUMN image_urls TEXT[] DEFAULT NULL;