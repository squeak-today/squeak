-- Remove the unique constraint from stories
ALTER TABLE stories 
DROP CONSTRAINT IF EXISTS unique_stories_entry;

-- Add pages column with default value of 1
ALTER TABLE stories
ADD COLUMN pages INTEGER NOT NULL DEFAULT 1; 