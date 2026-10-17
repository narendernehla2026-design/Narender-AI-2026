// app/api/generate/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message ?? '';

    // If GEMINI_API_KEY is configured on the server, you should implement a secure
    // server-side call to the Gemini (or other) LLM here. We keep a safe fallback so
    // deployments without a key still work and users aren't blocked by auth/keys.
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      // Simple fallback / echo + small canned response for usability in production
      const text = `Echoing (guest): ${message}\n\nTip: add a GEMINI_API_KEY as a server environment variable to enable the production model.`;
      return NextResponse.json({ text });
    }

    // If the key exists, the project owner should replace the following block with
    // a proper call to the Gemini API or another LLM provider's server-side endpoint.
    // We return a clear message indicating the integration point.
    const placeholder = `(GEMINI KEY detected) Received your message but the server-side Gemini integration is a placeholder. Message: ${message}`;
    return NextResponse.json({ text: placeholder });
  } catch (err) {
    console.error('API generate error', err);
    return NextResponse.json({ text: 'Server error while generating response.' }, { status: 500 });
  }
}
