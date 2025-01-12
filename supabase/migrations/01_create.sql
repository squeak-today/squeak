CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title TEXT DEFAULT '',
    language TEXT DEFAULT NULL,
    topic TEXT DEFAULT NULL,
    cefr_level TEXT DEFAULT NULL,
    preview_text TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    title TEXT DEFAULT '',
    language TEXT DEFAULT NULL,
    topic TEXT DEFAULT NULL,
    cefr_level TEXT DEFAULT NULL,
    preview_text TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE news
ADD CONSTRAINT unique_news_entry 
UNIQUE (topic, language, cefr_level);

ALTER TABLE stories 
ADD CONSTRAINT unique_stories_entry 
UNIQUE (topic, language, cefr_level);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;