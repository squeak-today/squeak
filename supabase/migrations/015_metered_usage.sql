CREATE TABLE IF NOT EXISTS public.metered_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    plan TEXT NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.metered_usage ENABLE ROW LEVEL SECURITY; 