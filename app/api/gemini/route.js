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

    // Correct Gemini 1.5 Flash endpoint supporting standard API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    }

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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

    // Correct extraction for Gemini 1.5 response structure
    let reply = ''
    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0]
    ) {
      reply = data.candidates[0].content.parts[0].text
    }

    if (!reply) {
      reply = JSON.stringify(data)
    }

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
