import { createClient } from '@supabase/supabase-js';

if (!process.env.REACT_APP_SUPABASE_URL) {
    throw new Error('Missing REACT_APP_SUPABASE_URL');
}
if (!process.env.REACT_APP_SUPABASE_ANON_KEY) {
    throw new Error('Missing REACT_APP_SUPABASE_ANON_KEY');
}

const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default supabase; 