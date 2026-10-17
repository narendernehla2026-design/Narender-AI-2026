import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message ?? "";

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      const text = `Echoing (guest): ${message}\n\nTip: add a GEMINI_API_KEY as a server environment variable to enable the production model.`;
      return NextResponse.json({ text });
    }

    // Attempt 1: Google Generative API (if API key is a Google API key). This uses the REST generate endpoint.
    try {
      const googleModel = process.env.GEMINI_MODEL || "models/text-bison-001"; // default model name
      const googleUrl = `https://generativelanguage.googleapis.com/v1beta2/${googleModel}:generate?key=${GEMINI_API_KEY}`;
      const googleRes = await fetch(googleUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: {
            text: message,
          },
          temperature: 0.2,
          maxOutputTokens: 512,
        }),
      });

      if (googleRes.ok) {
        const data = await googleRes.json();
        const text = (data?.candidates && data.candidates[0]?.output) || data?.output || JSON.stringify(data);
        return NextResponse.json({ text });
      }
    } catch (err) {
      console.warn("Google Generative API call failed, falling back:", (err as any)?.message || err);
    }

    // Attempt 2: OpenAI-compatible key — try Chat Completions as a fallback when the key works with OpenAI endpoints.
    try {
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GEMINI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [{ role: "user", content: message }],
          max_tokens: 512,
        }),
      });

      if (openaiRes.ok) {
        const data = await openaiRes.json();
        const text = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? JSON.stringify(data);
        return NextResponse.json({ text });
      }
    } catch (err) {
      console.warn("OpenAI-compatible call failed:", (err as any)?.message || err);
    }

    // If all provider attempts fail, return a helpful fallback message
    const fallback = `Echoing (guest): ${message}\n\nNote: GEMINI_API_KEY is set but provider calls failed. Confirm GEMINI_API_KEY, GEMINI_PROVIDER (optional), and GEMINI_MODEL (optional) environment variables on Vercel.`;
    return NextResponse.json({ text: fallback });
  } catch (err) {
    console.error("API generate error", err);
    return NextResponse.json({ text: "Server error while generating response." }, { status: 500 });
  }
}
