-- Deck Table
CREATE TABLE IF NOT EXISTS decks (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_deck_name UNIQUE (user_id, name)
);

-- Flashcard Table
CREATE TABLE IF NOT EXISTS flashcards (
    id SERIAL PRIMARY KEY,
    deck_id INTEGER REFERENCES decks(id) ON DELETE CASCADE,
    front_content TEXT NOT NULL,
    back_content TEXT NOT NULL,
    source_url TEXT,
    last_reviewed TIMESTAMP,
    review_count INTEGER DEFAULT 0,
    confidence_level INTEGER DEFAULT 0, -- 0-5 scale for spaced repetition
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Study Stats Table (for tracking learning progress)
CREATE TABLE IF NOT EXISTS study_stats (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    deck_id INTEGER REFERENCES decks(id) ON DELETE CASCADE,
    cards_studied INTEGER DEFAULT 0,
    cards_mastered INTEGER DEFAULT 0,
    last_study_session TIMESTAMP,
    study_streak_days INTEGER DEFAULT 0,
    
    CONSTRAINT unique_user_deck_stats UNIQUE (user_id, deck_id)
);

-- Deck Import Log (for future Anki imports)
CREATE TABLE IF NOT EXISTS deck_imports (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    deck_id INTEGER REFERENCES decks(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL, -- e.g., 'anki', 'csv', etc.
    file_name TEXT,
    cards_imported INTEGER,
    import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS decks_user_id_idx ON decks(user_id);
CREATE INDEX IF NOT EXISTS flashcards_deck_id_idx ON flashcards(deck_id);
CREATE INDEX IF NOT EXISTS study_stats_user_id_idx ON study_stats(user_id);
CREATE INDEX IF NOT EXISTS study_stats_deck_id_idx ON study_stats(deck_id);

-- Add RLS Policies for Decks
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own decks" ON decks;
CREATE POLICY "Users can view own decks"
    ON decks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public decks" ON decks;
CREATE POLICY "Users can view public decks"
    ON decks FOR SELECT
    USING (is_public = TRUE);

DROP POLICY IF EXISTS "Users can update own decks" ON decks;
CREATE POLICY "Users can update own decks"
    ON decks FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own decks" ON decks;
CREATE POLICY "Users can insert own decks"
    ON decks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own decks" ON decks;
CREATE POLICY "Users can delete own decks"
    ON decks FOR DELETE
    USING (auth.uid() = user_id);

-- Add RLS Policies for Flashcards
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view flashcards from owned decks" ON flashcards;
CREATE POLICY "Users can view flashcards from owned decks"
    ON flashcards FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM decks
        WHERE decks.id = flashcards.deck_id
        AND decks.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can view flashcards from public decks" ON flashcards;
CREATE POLICY "Users can view flashcards from public decks"
    ON flashcards FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM decks
        WHERE decks.id = flashcards.deck_id
        AND decks.is_public = TRUE
    ));

DROP POLICY IF EXISTS "Users can update flashcards in owned decks" ON flashcards;
CREATE POLICY "Users can update flashcards in owned decks"
    ON flashcards FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM decks
        WHERE decks.id = flashcards.deck_id
        AND decks.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can insert flashcards in owned decks" ON flashcards;
CREATE POLICY "Users can insert flashcards in owned decks"
    ON flashcards FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM decks
        WHERE decks.id = flashcards.deck_id
        AND decks.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete flashcards in owned decks" ON flashcards;
CREATE POLICY "Users can delete flashcards in owned decks"
    ON flashcards FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM decks
        WHERE decks.id = flashcards.deck_id
        AND decks.user_id = auth.uid()
    ));

-- Add RLS Policies for Study Stats
ALTER TABLE study_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own study stats" ON study_stats;
CREATE POLICY "Users can view own study stats"
    ON study_stats FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own study stats" ON study_stats;
CREATE POLICY "Users can update own study stats"
    ON study_stats FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own study stats" ON study_stats;
CREATE POLICY "Users can insert own study stats"
    ON study_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add RLS Policies for Deck Imports
ALTER TABLE deck_imports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own import logs" ON deck_imports;
CREATE POLICY "Users can view own import logs"
    ON deck_imports FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own import logs" ON deck_imports;
CREATE POLICY "Users can insert own import logs"
    ON deck_imports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Function to update timestamp on record changes
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at fields
DROP TRIGGER IF EXISTS update_decks_timestamp ON decks;
CREATE TRIGGER update_decks_timestamp
BEFORE UPDATE ON decks
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

DROP TRIGGER IF EXISTS update_flashcards_timestamp ON flashcards;
CREATE TRIGGER update_flashcards_timestamp
BEFORE UPDATE ON flashcards
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();