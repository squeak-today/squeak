INSERT INTO public.billing_accounts (user_id, plan, canceled)
SELECT id, 'FREE', false
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.billing_accounts WHERE billing_accounts.user_id = auth.users.id
)
AND NOT EXISTS (
    SELECT 1 FROM public.organizations WHERE organizations.admin_id = auth.users.id
)
AND NOT EXISTS (
    SELECT 1 FROM public.teachers WHERE teachers.user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION create_billing_account_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    -- Only create if user doesn't already exist in billing_accounts table
    -- (this makes the function idempotent)
    IF NOT EXISTS (SELECT 1 FROM public.billing_accounts WHERE user_id = NEW.id) THEN
        -- Skip users that are part of organizations to avoid conflict with existing triggers
        IF NOT EXISTS (
            SELECT 1 FROM public.organizations WHERE organizations.admin_id = NEW.id
        ) AND NOT EXISTS (
            SELECT 1 FROM public.teachers WHERE teachers.user_id = NEW.id
        ) THEN
            INSERT INTO public.billing_accounts (user_id, plan, canceled)
            VALUES (NEW.id, 'FREE', false);
        END IF;
    END IF;
    RETURN NEW;
END;
$$; 

DROP TRIGGER IF EXISTS create_billing_account_trigger ON auth.users;
CREATE TRIGGER create_billing_account_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_billing_account_for_new_user(); 