ALTER TABLE news
DROP CONSTRAINT IF EXISTS unique_news_entry;

ALTER TABLE stories 
DROP CONSTRAINT IF EXISTS unique_stories_entry;

ALTER TABLE news
ADD CONSTRAINT unique_news_entry 
UNIQUE (topic, language, cefr_level, DATE(created_at));

ALTER TABLE stories 
ADD CONSTRAINT unique_stories_entry 
UNIQUE (topic, language, cefr_level, DATE(created_at));