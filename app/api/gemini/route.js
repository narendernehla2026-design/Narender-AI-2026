export async function POST(req) {
  try {
    const body = await req.json()
    const prompt = body?.prompt ?? ''

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing prompt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const API_KEY = process.env.GENERATIVE_AI_API_KEY
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing GENERATIVE_AI_API_KEY on server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Default Gemini/Generative Language endpoint. Replace if you use a different model/endpoint.
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta2/models/assistant-bison-001:generateText'

    const payload = {
      prompt: { text: prompt },
      temperature: 0.2,
      candidateCount: 1
    }

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      return new Response(JSON.stringify({ error: errText || 'Generative API error' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await res.json()

    // Tolerant extraction for common response shapes
    let reply = ''
    if (Array.isArray(data.candidates) && data.candidates[0]) {
      const cand = data.candidates[0]
      if (cand.output && Array.isArray(cand.output)) {
        reply = cand.output.map(o => (o.content || []).map(c => c.text || '').join('')).join('\n')
      } else if (cand.content && Array.isArray(cand.content)) {
        reply = cand.content.map(c => c.text || '').join('\n')
      } else if (cand.text) {
        reply = cand.text
      }
    }

    if (!reply && Array.isArray(data.output) && data.output[0] && Array.isArray(data.output[0].content)) {
      reply = data.output[0].content.map(c => c.text || '').join('')
    }

    if (!reply) reply = JSON.stringify(data)

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('GEMINI ROUTE ERROR', err)
    return new Response(JSON.stringify({ error: err?.message || String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
