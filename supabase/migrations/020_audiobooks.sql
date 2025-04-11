CREATE TABLE IF NOT EXISTS audiobooks (
    id SERIAL PRIMARY KEY,
    news_id INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    tier TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audiobooks_news_id ON audiobooks(news_id);
ALTER TABLE audiobooks ENABLE ROW LEVEL SECURITY;

ALTER TABLE audiobooks
DROP CONSTRAINT IF EXISTS unique_audiobook_entry;

ALTER TABLE audiobooks
ADD CONSTRAINT unique_audiobook_entry 
UNIQUE (news_id);