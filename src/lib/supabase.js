import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Found' : 'MISSING');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Found' : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
    const msg = 'CRITICAL: Supabase keys are MISSING in this build. Please check Vercel Environment Variables.';
    console.error(msg);
    if (typeof window !== 'undefined') {
        // window.alert(msg); // Optional: if you want to be extra noisy
    }
}

export const supabase = createClient(supabaseUrl || 'https://missing-url.supabase.co', supabaseAnonKey || 'missing-key', {
    auth: {
        storage: typeof window !== 'undefined' ? window.sessionStorage : null,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})
