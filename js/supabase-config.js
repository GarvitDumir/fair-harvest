
const SUPABASE_URL = 'https://xedmzhlcyvsibancxesp.supabase.co';

const SUPABASE_ANON_KEY = 'sb_publishable_The-xEmECjhSNlak7DAx6g_lObysM3m';

const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (supabaseClient) {
  console.log('✅ Supabase client initialized!');
} else {
  console.error('❌ Supabase CDN library failed to load.');
}
