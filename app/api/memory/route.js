import {
  apiError,
  databaseError,
  getAuthenticatedSupabase,
} from '@/lib/serverSupabase';

export const runtime = 'nodejs';

const categories = new Set(['personal', 'work', 'preference', 'project', 'note']);

export async function GET(request) {
  const context = await getAuthenticatedSupabase(request);
  if (context.error) return apiError(context.error, context.status);

  const { data, error } = await context.supabase
    .from('assistant_memories')
    .select('id,category,title,content,updated_at')
    .eq('user_id', context.user.id)
    .order('updated_at', { ascending: false })
    .limit(100);

  if (error) return databaseError(error);
  return Response.json({ memories: data || [] });
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

  const category = typeof body?.category === 'string' ? body.category : '';
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const content = typeof body?.content === 'string' ? body.content.trim() : '';
  if (!categories.has(category)) return apiError('Choose a valid memory category.', 400);
  if (!title || title.length > 120) return apiError('Memory titles must be between 1 and 120 characters.', 400);
  if (!content || content.length > 2000) return apiError('Memory content must be between 1 and 2,000 characters.', 400);

  const { data, error } = await context.supabase
    .from('assistant_memories')
    .insert({ user_id: context.user.id, category, title, content })
    .select('id,category,title,content,updated_at')
    .single();

  if (error) return databaseError(error);
  return Response.json({ memory: data }, { status: 201 });
}
