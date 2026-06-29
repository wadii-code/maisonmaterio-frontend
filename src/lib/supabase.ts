  import { createClient } from '@supabase/supabase-js';

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Parse the session out of the URL (hash or query) when the user lands here
    // from an email link — this is what powers the password-recovery flow.
    detectSessionInUrl: true,
    // Implicit flow is the most forgiving for password resets: it works even when
    // the email is opened on a different device/browser than the one that requested it.
    flowType: 'implicit',
  },
});