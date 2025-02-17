ALTER TABLE news
ADD COLUMN date_created DATE DEFAULT NULL;

ALTER TABLE stories
ADD COLUMN date_created DATE DEFAULT NULL;

UPDATE news
SET date_created = DATE(created_at)
WHERE date_created IS NULL;

UPDATE stories
SET date_created = DATE(created_at)
WHERE date_created IS NULL;

ALTER TABLE news
ALTER COLUMN date_created SET NOT NULL;

ALTER TABLE stories
ALTER COLUMN date_created SET NOT NULL;

ALTER TABLE news
DROP CONSTRAINT IF EXISTS unique_news_entry;

ALTER TABLE stories 
DROP CONSTRAINT IF EXISTS unique_stories_entry;

ALTER TABLE news
ADD CONSTRAINT IF NOT EXISTS unique_news_entry 
UNIQUE (topic, language, cefr_level, date_created);

ALTER TABLE stories 
ADD CONSTRAINT IF NOT EXISTS unique_stories_entry 
UNIQUE (topic, language, cefr_level, date_created);