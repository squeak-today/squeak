CREATE TABLE IF NOT EXISTS audiobooks (
    id SERIAL PRIMARY KEY,
    news_id INTEGER REFERENCES news(id) ON DELETE CASCADE,
    story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
    tier TEXT NOT NULL,
    pages INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audiobooks_news_id ON audiobooks(news_id);
ALTER TABLE audiobooks ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS unique_audiobook_news_entry ON audiobooks(news_id) WHERE news_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS unique_audiobook_story_entry ON audiobooks(story_id) WHERE story_id IS NOT NULL;
