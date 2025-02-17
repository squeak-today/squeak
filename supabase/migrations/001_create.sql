CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title TEXT DEFAULT '',
    language TEXT DEFAULT NULL,
    topic TEXT DEFAULT NULL,
    cefr_level TEXT DEFAULT NULL,
    preview_text TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_created DATE DEFAULT CURRENT_DATE NOT NULL  -- Add this column from the start
);

CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    title TEXT DEFAULT '',
    language TEXT DEFAULT NULL,
    topic TEXT DEFAULT NULL,
    cefr_level TEXT DEFAULT NULL,
    preview_text TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_created DATE DEFAULT CURRENT_DATE NOT NULL  -- Add this column from the start
);

-- Create the final version of the constraints directly
ALTER TABLE news
DROP CONSTRAINT IF EXISTS unique_news_entry;

ALTER TABLE news
DROP CONSTRAINT IF EXISTS unique_news_entry;

ALTER TABLE news
ADD CONSTRAINT unique_news_entry 
UNIQUE (topic, language, cefr_level, date_created);

ALTER TABLE stories 
DROP CONSTRAINT IF EXISTS unique_stories_entry;

ALTER TABLE stories 
DROP CONSTRAINT IF EXISTS unique_stories_entry;

ALTER TABLE stories 
ADD CONSTRAINT unique_stories_entry 
UNIQUE (topic, language, cefr_level, date_created);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;