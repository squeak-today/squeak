CREATE TABLE IF NOT EXISTS public.billing_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'FREE',
    customer_id TEXT DEFAULT NULL,
    subscription_id TEXT DEFAULT NULL,
    expiration DATE DEFAULT NULL,
    canceled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_user_id UNIQUE (user_id),
    CONSTRAINT unique_customer_id UNIQUE (customer_id),
    CONSTRAINT unique_subscription_id UNIQUE (subscription_id)
);

CREATE OR REPLACE FUNCTION check_user_not_in_orgs_or_teachers()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.organizations WHERE organizations.admin_id = NEW.user_id
    ) OR EXISTS (
        SELECT 1 FROM public.teachers WHERE teachers.user_id = NEW.user_id
    ) THEN
        RAISE EXCEPTION 'User already exists in organizations or teachers tables';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_overlapping_plans_trigger ON public.billing_accounts;
CREATE TRIGGER prevent_overlapping_plans_trigger
    BEFORE INSERT ON public.billing_accounts
    FOR EACH ROW
    EXECUTE FUNCTION check_user_not_in_orgs_or_teachers();