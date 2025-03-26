-- Create user_answers table
CREATE TABLE IF NOT EXISTS user_answers (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row-Level Security (RLS)
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own answers
CREATE POLICY "Students can view own answers"
    ON user_answers FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Students can insert their own answers
CREATE POLICY "Students can insert own answers"
    ON user_answers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Teachers can view answers of students in their classroom
CREATE POLICY "Teachers can view student answers"
    ON user_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM classrooms c
            JOIN students s ON s.classroom_id = c.id
            WHERE c.teacher_id = auth.uid() AND s.user_id = user_answers.user_id
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS user_answers_user_id_idx ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS user_answers_question_id_idx ON user_answers(question_id);