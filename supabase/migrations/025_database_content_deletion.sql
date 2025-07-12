ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS soft_delete TEXT DEFAULT 'no';
ALTER TABLE content_databases ADD COLUMN IF NOT EXISTS soft_delete TEXT DEFAULT 'no';
ALTER TABLE content ADD COLUMN IF NOT EXISTS soft_delete TEXT DEFAULT 'no';

CREATE INDEX IF NOT EXISTS idx_workspaces_soft_delete ON workspaces(soft_delete);
CREATE INDEX IF NOT EXISTS idx_content_databases_soft_delete ON content_databases(soft_delete);
CREATE INDEX IF NOT EXISTS idx_content_soft_delete ON content(soft_delete);