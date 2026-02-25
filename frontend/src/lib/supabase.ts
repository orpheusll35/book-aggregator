import { createClient } from '@supabase/supabase-js';

// These are placeholders. In a real app, you would use import.meta.env.PUBLIC_SUPABASE_URL
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
