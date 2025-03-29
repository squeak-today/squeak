ALTER TABLE public.organizations 
    ADD COLUMN IF NOT EXISTS customer_id TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS subscription_id TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS expiration DATE DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS canceled BOOLEAN DEFAULT FALSE;

ALTER TABLE public.organizations 
    DROP CONSTRAINT IF EXISTS unique_customer_id,
    DROP CONSTRAINT IF EXISTS unique_subscription_id;

ALTER TABLE public.organizations 
    ADD CONSTRAINT unique_customer_id UNIQUE (customer_id),
    ADD CONSTRAINT unique_subscription_id UNIQUE (subscription_id);
