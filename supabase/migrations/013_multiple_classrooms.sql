ALTER TABLE classrooms ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Classroom';
ALTER TABLE classrooms DROP CONSTRAINT IF EXISTS unique_teacher_classroom;
ALTER TABLE classrooms ADD COLUMN IF NOT EXISTS teacher_user_id UUID;
ALTER TABLE classrooms ADD COLUMN IF NOT EXISTS new_teacher_id UUID;


-- First: For classrooms where teacher_id corresponds to an existing teachers.id
-- (This handles the idempotent case where this migration runs multiple times)
UPDATE classrooms c
SET new_teacher_id = teacher_id
FROM teachers t
WHERE c.teacher_id = t.id;

-- Second: For classrooms where teacher_id is an auth.users id and not a teachers.id
-- First create organizations for these users if they don't exist
INSERT INTO organizations (admin_id, plan, created_at, updated_at)
SELECT DISTINCT c.teacher_id, 'FREE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM classrooms c
LEFT JOIN organizations o ON c.teacher_id = o.admin_id
WHERE c.new_teacher_id IS NULL
  AND o.id IS NULL;

-- Third: Create teacher entries for these users if they don't exist
INSERT INTO teachers (user_id, organization_id, created_at, updated_at)
SELECT DISTINCT c.teacher_id, o.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM classrooms c
JOIN organizations o ON c.teacher_id = o.admin_id
LEFT JOIN teachers t ON c.teacher_id = t.user_id
WHERE c.new_teacher_id IS NULL
  AND t.id IS NULL;

-- Fourth: Link classrooms to the new teacher entries
UPDATE classrooms c
SET teacher_user_id = teacher_id,
    new_teacher_id = t.id
FROM teachers t
WHERE c.teacher_id = t.user_id
  AND c.new_teacher_id IS NULL;

-- Continue with the rest of your migration
DROP INDEX IF EXISTS classrooms_teacher_id_idx;
ALTER TABLE classrooms DROP CONSTRAINT IF EXISTS classrooms_teacher_id_fkey;

-- switch to new teacher_id
ALTER TABLE classrooms DROP COLUMN IF EXISTS teacher_id CASCADE;
ALTER TABLE classrooms ALTER COLUMN new_teacher_id SET NOT NULL;
ALTER TABLE classrooms RENAME COLUMN new_teacher_id TO teacher_id;

-- clean up temporary column
ALTER TABLE classrooms DROP COLUMN IF EXISTS teacher_user_id;

-- add new foreign key constraint and index
ALTER TABLE classrooms 
  ADD CONSTRAINT classrooms_teacher_id_fkey 
  FOREIGN KEY (teacher_id) 
  REFERENCES teachers(id) 
  ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS classrooms_teacher_id_idx ON classrooms(teacher_id);
ALTER TABLE classrooms ADD CONSTRAINT classrooms_teacher_id_not_null CHECK (teacher_id IS NOT NULL); 