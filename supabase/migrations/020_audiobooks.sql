CREATE TABLE IF NOT EXISTS audiobooks (
    id SERIAL PRIMARY KEY,
    news_id INTEGER REFERENCES news(id) ON DELETE CASCADE,
    story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
    tier TEXT NOT NULL,
    pages INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE ;

CREATE INDEX IF NOT EXISTS idx_audiobooks_news_id ON audiobooks(news_id);
ALTER TABLE audiobooks ENABLE ROW LEVEL SECURITY;

ALTER TABLE audiobooks
DROP CONSTRAINT IF EXISTS unique_audiobook_entry;

ALTER TABLE audiobooks
ADD CONSTRAINT unique_audiobook_entry 
UNIQUE (news_id);
