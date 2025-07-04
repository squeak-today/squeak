CREATE TABLE IF NOT EXISTS content_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    database_id UUID REFERENCES content_databases(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_jobs_user_id ON content_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_content_jobs_database_id ON content_jobs(database_id);
ALTER TABLE content_jobs ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS unique_content_job_database_id ON content_jobs(database_id);