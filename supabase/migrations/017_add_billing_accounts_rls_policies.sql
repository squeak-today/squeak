ALTER TABLE IF EXISTS public.billing_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their billing accounts" ON public.billing_accounts;
DROP POLICY IF EXISTS "Users can insert their billing accounts" ON public.billing_accounts;
DROP POLICY IF EXISTS "Users can update their billing accounts" ON public.billing_accounts;
DROP POLICY IF EXISTS "Users can delete their billing accounts" ON public.billing_accounts;

CREATE POLICY "Users can view their billing accounts" 
ON public.billing_accounts 
FOR SELECT 
TO authenticated 
USING ((auth.uid()) = user_id);

CREATE POLICY "Users can insert their billing accounts" 
ON public.billing_accounts 
FOR INSERT 
TO authenticated 
WITH CHECK ((auth.uid()) = user_id);

CREATE POLICY "Users can update their billing accounts" 
ON public.billing_accounts 
FOR UPDATE 
TO authenticated 
USING ((auth.uid()) = user_id) 
WITH CHECK ((auth.uid()) = user_id);

CREATE POLICY "Users can delete their billing accounts" 
ON public.billing_accounts 
FOR DELETE 
TO authenticated 
USING ((auth.uid()) = user_id); 