import {
  apiError,
  databaseError,
  getAuthenticatedSupabase,
} from '@/lib/serverSupabase';

export const runtime = 'nodejs';

export async function GET(request) {
  const context = await getAuthenticatedSupabase(request);
  if (context.error) return apiError(context.error, context.status);

  const { data, error } = await context.supabase
    .from('assistant_chats')
    .select('id,title,updated_at')
    .eq('user_id', context.user.id)
    .order('updated_at', { ascending: false })
    .limit(100);

  if (error) return databaseError(error);
  return Response.json({ chats: data || [] });
}

export async function POST(request) {
  const context = await getAuthenticatedSupabase(request);
  if (context.error) return apiError(context.error, context.status);

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError('Request body must be valid JSON.', 400);
  }

  const title =
    typeof body?.title === 'string' && body.title.trim()
      ? body.title.trim().slice(0, 120)
      : 'New conversation';

  const { data: allowed, error: rateError } = await context.supabase.rpc(
    'consume_assistant_request',
  );
  if (rateError) return databaseError(rateError);
  if (!allowed) {
    return apiError('You have reached the request limit. Try again in a minute.', 429);
  }

  const { data, error } = await context.supabase
    .from('assistant_chats')
    .insert({ user_id: context.user.id, title })
    .select('id,title,updated_at')
    .single();

  if (error) return databaseError(error);
  return Response.json({ chat: data }, { status: 201 });
}
