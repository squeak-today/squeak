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
    CONSTRAINT unique_subscription_id UNIQUE (subscription_id),
    CONSTRAINT prevent_overlapping_plans_check_in_orgs_or_teachers
    CHECK (
        NOT EXISTS (
            SELECT 1 FROM public.organizations WHERE organizations.admin_id = billing_accounts.user_id
        ) AND
        NOT EXISTS (
            SELECT 1 FROM public.teachers WHERE teachers.user_id = billing_accounts.user_id
        )
    )
);