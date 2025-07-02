CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS unique_workspace_name_per_user ON workspaces(user_id, name);

CREATE TABLE IF NOT EXISTS content_databases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_databases_workspace_id ON content_databases(workspace_id);
ALTER TABLE content_databases ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS unique_content_database_name_per_workspace ON content_databases(workspace_id, name);

CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    database_id UUID REFERENCES content_databases(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    -- other fields added later
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_database_id ON content(database_id);
ALTER TABLE content ENABLE ROW LEVEL SECURITY;