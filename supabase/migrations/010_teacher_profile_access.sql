-- File: 005_teacher_profile_access.sql
-- Allow teachers to view profiles of students in their classroom
DROP POLICY IF EXISTS "Teachers can view student profiles" ON profiles;
CREATE POLICY "Teachers can view student profiles"
ON profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM classrooms c
        JOIN students s ON s.classroom_id = c.id
        WHERE c.teacher_id = auth.uid() AND s.user_id = profiles.user_id
    )
);