import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

try {
  if (url && anonKey) {
    supabase = createClient(url, anonKey, {
      auth: {
        // don't persist session in localStorage automatically in the client to avoid auth loops
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } else {
    // keys not provided — running in guest/no-supabase mode
    supabase = null;
    console.warn(
      "Supabase keys not found. Running in guest mode. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel environment variables for full auth functionality."
    );
  }
} catch (err) {
  console.error("Failed to initialize Supabase client:", err);
  supabase = null;
}

export default supabase;
