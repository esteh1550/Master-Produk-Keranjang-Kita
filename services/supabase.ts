import { createClient } from '@supabase/supabase-js';

// Configuration from prompt
const SUPABASE_URL = 'https://klbyofvsbeiygrtlnkmk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_secret_RVK2HWGVjxwq-PgpHpB_hA_F8tBAaE0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
