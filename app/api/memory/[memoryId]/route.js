import {
  apiError,
  databaseError,
  getAuthenticatedSupabase,
} from '@/lib/serverSupabase';

export const runtime = 'nodejs';
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function DELETE(request, { params }) {
  const context = await getAuthenticatedSupabase(request);
  if (context.error) return apiError(context.error, context.status);
  if (!UUID_PATTERN.test(params.memoryId)) {
    return apiError('Memory not found.', 404);
  }

  const { data, error } = await context.supabase
    .from('assistant_memories')
    .delete()
    .eq('id', params.memoryId)
    .eq('user_id', context.user.id)
    .select('id')
    .maybeSingle();

  if (error) return databaseError(error);
  if (!data) return apiError('Memory not found.', 404);
  return new Response(null, { status: 204 });
}
