CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_admin_id UNIQUE (admin_id)
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPT DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPT DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_teacher_user_id UNIQUE (user_id)
);

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_organization_updated_at ON organizations;
CREATE TRIGGER update_organization_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teacher_updated_at ON teacher;
CREATE TRIGGER update_teacher_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
