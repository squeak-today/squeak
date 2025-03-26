CREATE TABLE IF NOT EXISTS classrooms (
    id SERIAL PRIMARY KEY,
    teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_teacher_classroom UNIQUE (teacher_id)
);

CREATE TABLE IF NOT EXISTS accepted_content (
    id SERIAL PRIMARY KEY,
    classroom_id INTEGER REFERENCES classrooms(id) ON DELETE CASCADE,
    story_id INTEGER REFERENCES stories(id),
    news_id INTEGER REFERENCES news(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT exclusive_content CHECK (
        (story_id IS NULL AND news_id IS NOT NULL) OR
        (story_id IS NOT NULL AND news_id IS NULL)
    ),
    
    CONSTRAINT unique_story_classroom UNIQUE (classroom_id, story_id),
    CONSTRAINT unique_news_classroom UNIQUE (classroom_id, news_id)
);

CREATE TABLE IF NOT EXISTS students (
    student_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    classroom_id INTEGER REFERENCES classrooms(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_student_user UNIQUE (user_id),
    CONSTRAINT unique_student_classroom UNIQUE (user_id, classroom_id)
);


ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE accepted_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS classrooms_teacher_id_idx ON classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS accepted_content_classroom_id_idx ON accepted_content(classroom_id);
CREATE INDEX IF NOT EXISTS students_classroom_id_idx ON students(classroom_id);
CREATE INDEX IF NOT EXISTS students_user_id_idx ON students(user_id); 