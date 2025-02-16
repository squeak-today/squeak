-- Add CASCADE for news foreign key
ALTER TABLE questions 
DROP CONSTRAINT IF EXISTS questions_news_id_fkey,
ADD CONSTRAINT questions_news_id_fkey 
    FOREIGN KEY (news_id) 
    REFERENCES news(id) 
    ON DELETE CASCADE;

-- Add CASCADE for story foreign key
ALTER TABLE questions 
DROP CONSTRAINT IF EXISTS questions_story_id_fkey,
ADD CONSTRAINT questions_story_id_fkey 
    FOREIGN KEY (story_id) 
    REFERENCES stories(id) 
    ON DELETE CASCADE;