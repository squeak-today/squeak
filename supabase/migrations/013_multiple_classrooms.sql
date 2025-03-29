ALTER TABLE classrooms ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Classroom';
ALTER TABLE classrooms DROP CONSTRAINT IF EXISTS unique_teacher_classroom;
ALTER TABLE classrooms ADD COLUMN IF NOT EXISTS teacher_user_id UUID;
ALTER TABLE classrooms ADD COLUMN IF NOT EXISTS new_teacher_id UUID;

-- First try: Copy existing teacher_id if it's already a valid teachers.id
UPDATE classrooms c
SET new_teacher_id = teacher_id
FROM teachers t
WHERE c.teacher_id = t.id;

-- Second try: For remaining rows, try to map auth.users ids to teachers.id
UPDATE classrooms c
SET teacher_user_id = teacher_id,
    new_teacher_id = t.id
FROM teachers t
WHERE c.teacher_id = t.user_id 
AND c.new_teacher_id IS NULL;

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