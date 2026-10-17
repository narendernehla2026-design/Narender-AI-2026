import { createClient } from '@supabase/supabase-js';

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return { error: 'Supabase is not configured for this deployment.', status: 503 };
  }

  try {
    const parsed = new URL(url);
    const localDevelopment =
      process.env.NODE_ENV !== 'production' &&
      ['localhost', '127.0.0.1'].includes(parsed.hostname);
    if (parsed.protocol !== 'https:' && !(localDevelopment && parsed.protocol === 'http:')) {
      throw new Error();
    }
  } catch {
    return { error: 'Supabase configuration is invalid.', status: 503 };
  }

  return { url, anonKey };
}

export async function getAuthenticatedSupabase(request) {
  const config = getSupabaseConfig();
  if (config.error) return config;

  const authorization = request.headers.get('authorization') || '';
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return { error: 'Sign in to continue.', status: 401 };

  const supabase = createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return { error: 'Your session has expired. Sign in again.', status: 401 };
    }
    return { supabase, user: data.user };
  } catch {
    return { error: 'Authentication service is temporarily unavailable.', status: 503 };
  }

}

export function apiError(message, status) {
  return Response.json({ error: message }, { status });
}

export function databaseError(error) {
  if (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    error?.code === 'PGRST202'
  ) {
    return apiError('The Supabase database migration has not been applied.', 503);
  }
  if (error?.code === '42501' || error?.code === 'PGRST301') {
    return apiError('You are not allowed to access this data.', 403);
  }
  return apiError('The database request could not be completed.', 500);
}
