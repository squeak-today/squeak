CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    story_id INTEGER REFERENCES stories(id),
    news_id INTEGER REFERENCES news(id),
    question_type TEXT NOT NULL,
    cefr_level TEXT NOT NULL,
    question TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure only one of story_id or news_id is set
    CONSTRAINT exclusive_content CHECK (
        (story_id IS NULL AND news_id IS NOT NULL) OR
        (story_id IS NOT NULL AND news_id IS NULL)
    ),
    
    -- Ensure unique combination of content id, question_type, and CEFR level
    CONSTRAINT unique_story_question UNIQUE (story_id, question_type, cefr_level)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT unique_news_question UNIQUE (news_id, question_type, cefr_level)
        DEFERRABLE INITIALLY DEFERRED
);

-- Enable RLS to match the pattern of other tables
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;