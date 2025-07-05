ALTER TABLE content_databases ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

UPDATE content_databases
SET user_id = workspaces.user_id
FROM workspaces
WHERE content_databases.workspace_id = workspaces.id;

ALTER TABLE content_databases ALTER COLUMN user_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_databases_user_id ON content_databases(user_id);

CREATE OR REPLACE FUNCTION check_content_database_user_matches_workspace()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM workspaces 
        WHERE id = NEW.workspace_id AND user_id = NEW.user_id
    ) THEN
        RAISE EXCEPTION 'content_database user_id must match workspace user_id';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_content_database_user_matches_workspace
    BEFORE INSERT OR UPDATE ON content_databases
    FOR EACH ROW
    EXECUTE FUNCTION check_content_database_user_matches_workspace();