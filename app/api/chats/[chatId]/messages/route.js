import {
  apiError,
  databaseError,
  getAuthenticatedSupabase,
} from '@/lib/serverSupabase';

export const runtime = 'nodejs';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getOwnedChat(supabase, userId, chatId) {
  if (!UUID_PATTERN.test(chatId)) return { error: apiError('Conversation not found.', 404) };

  const { data, error } = await supabase
    .from('assistant_chats')
    .select('id,title')
    .eq('id', chatId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return { error: databaseError(error) };
  if (!data) return { error: apiError('Conversation not found.', 404) };
  return { chat: data };
}

export async function GET(request, { params }) {
  const context = await getAuthenticatedSupabase(request);
  if (context.error) return apiError(context.error, context.status);

  const { error: ownershipError } = await getOwnedChat(
    context.supabase,
    context.user.id,
    params.chatId,
  );
  if (ownershipError) return ownershipError;

  const { data, error } = await context.supabase
    .from('assistant_messages')
    .select('id,role,content,created_at')
    .eq('chat_id', params.chatId)
    .eq('user_id', context.user.id)
    .order('created_at', { ascending: true })
    .limit(200);

  if (error) return databaseError(error);
  return Response.json({ messages: data || [] });
}

export async function POST(request, { params }) {
  const context = await getAuthenticatedSupabase(request);
  if (context.error) return apiError(context.error, context.status);

  const { chat, error: ownershipError } = await getOwnedChat(
    context.supabase,
    context.user.id,
    params.chatId,
  );
  if (ownershipError) return ownershipError;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return apiError(
      'Smart AI is not connected yet. Add the server-side GEMINI_API_KEY in your hosting settings.',
      503,
      'GEMINI_NOT_CONFIGURED',
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError('Request body must be valid JSON.', 400);
  }

  const prompt = typeof body?.content === 'string' ? body.content.trim() : '';
  if (!prompt) return apiError('Enter a message before sending.', 400);
  if (prompt.length > 6000) return apiError('Messages must be 6,000 characters or fewer.', 413);

  const { data: allowed, error: rateError } = await context.supabase.rpc(
    'consume_assistant_request',
  );
  if (rateError) return databaseError(rateError);
  if (!allowed) return apiError('You have reached the assistant request limit. Try again in a minute.', 429);

  const { data: previous, error: historyError } = await context.supabase
    .from('assistant_messages')
    .select('role,content')
    .eq('chat_id', params.chatId)
    .eq('user_id', context.user.id)
    .order('created_at', { ascending: false })
    .limit(16);
  if (historyError) return databaseError(historyError);

  const { error: insertUserError } = await context.supabase
    .from('assistant_messages')
    .insert({
      chat_id: params.chatId,
      user_id: context.user.id,
      role: 'user',
      content: prompt,
    });
  if (insertUserError) return databaseError(insertUserError);

  const { data: memories, error: memoryError } = await context.supabase
    .from('assistant_memories')
    .select('category,title,content')
    .eq('user_id', context.user.id)
    .order('updated_at', { ascending: false })
    .limit(12);
  if (memoryError) return databaseError(memoryError);

  const memoryContext = (memories || [])
    .map((item) => `[${item.category}] ${item.title}: ${item.content}`)
    .join('\n');
  const history = [...(previous || []).reverse(), { role: 'user', content: prompt }]
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }));

  let geminiResponse;
  try {
    geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: `You are Smart AI, a helpful private personal assistant. Use the user's saved context only when relevant. Treat the context as private user-provided information.\n\nSaved context:\n${memoryContext || 'No saved context.'}`,
            }],
          },
          contents: history,
          generationConfig: { maxOutputTokens: 1200, temperature: 0.7 },
        }),
        signal: AbortSignal.timeout(30_000),
      },
    );
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    console.error('Gemini request failed:', timedOut ? 'timeout' : 'network error');
    return apiError(
      timedOut
        ? 'Gemini took too long to respond. Please try again.'
        : 'Gemini could not be reached. Check your connection and try again.',
      timedOut ? 504 : 502,
      timedOut ? 'GEMINI_TIMEOUT' : 'GEMINI_UNAVAILABLE',
    );
  }

  if (!geminiResponse.ok) {
    console.error('Gemini returned HTTP status:', geminiResponse.status);
    if (geminiResponse.status === 401 || geminiResponse.status === 403) {
      return apiError(
        'Gemini rejected the server key. Verify GEMINI_API_KEY in the hosting settings.',
        503,
        'GEMINI_CREDENTIALS_INVALID',
      );
    }
    if (geminiResponse.status === 429) {
      return apiError(
        'Gemini is limiting requests right now. Wait a moment and try again.',
        429,
        'GEMINI_RATE_LIMITED',
      );
    }
    if (geminiResponse.status === 400 || geminiResponse.status === 404) {
      return apiError(
        'Gemini rejected this request. Try a shorter message or check the model configuration.',
        502,
        'GEMINI_REQUEST_REJECTED',
      );
    }
    return apiError(
      'Gemini is temporarily unavailable. Please try again shortly.',
      502,
      'GEMINI_UNAVAILABLE',
    );
  }

  let responseData;
  try {
    responseData = await geminiResponse.json();
  } catch {
    return apiError('Gemini returned an invalid response. Please try again.', 502, 'GEMINI_INVALID_RESPONSE');
  }

  const answer = responseData?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();
  if (!answer) {
    return apiError(
      'Gemini could not produce an answer for that message. Please rephrase and try again.',
      502,
      'GEMINI_EMPTY_RESPONSE',
    );
  }

  const { data: savedMessage, error: saveError } = await context.supabase
    .from('assistant_messages')
    .insert({
      chat_id: params.chatId,
      user_id: context.user.id,
      role: 'assistant',
      content: answer,
    })
    .select('id,role,content,created_at')
    .single();
  if (saveError) return databaseError(saveError);

  const title = chat.title === 'New conversation'
    ? prompt.replace(/\s+/g, ' ').slice(0, 72)
    : chat.title;
  const { error: updateError } = await context.supabase
    .from('assistant_chats')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', params.chatId)
    .eq('user_id', context.user.id);
  if (updateError) return databaseError(updateError);

  return Response.json({ message: savedMessage, title });
}
