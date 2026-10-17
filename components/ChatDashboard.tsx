use client";
import React, { useEffect, useState, useRef } from 'react';
import supabase from '../lib/supabaseClient';
import VoiceVisualizer from './components/VoiceVisualizer';

type Message = { id: string; from: 'user' | 'ai'; text: string };

export default function ChatDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      try {
        if (!supabase) {
          // Supabase not configured or keys missing: fall back to anonymous guest mode
          if (mounted) setIsGuest(true);
          return;
        }

        // supabase-js v2
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase auth getSession error, falling back to guest:', error.message || error);
          if (mounted) setIsGuest(true);
          return;
        }

        const session = data?.session;
        if (session?.user) {
          if (mounted) {
            setIsGuest(false);
            setUserEmail((session.user as any).email ?? null);
          }
        } else {
          if (mounted) setIsGuest(true);
        }
      } catch (err) {
        console.warn('Auth check failed, using guest mode', err);
        if (mounted) setIsGuest(true);
      }
    }

    checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // seed a welcome message
    setMessages([
      { id: 'ai-1', from: 'ai', text: "Welcome to your AI workspace — say hi or try the quick actions!" },
    ]);
  }, []);

  async function sendMessage(text: string) {
    if (!text) return;
    const userMsg: Message = { id: String(Date.now()), from: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const payload = await res.json();
      const aiText = payload?.text ?? 'Sorry — no response available.';
      const aiMsg: Message = { id: String(Date.now() + 1), from: 'ai', text: aiText };
      setMessages((m) => [...m, aiMsg]);
    } catch (err) {
      console.error('Generate API error', err);
      const aiMsg: Message = { id: String(Date.now() + 2), from: 'ai', text: 'There was an error generating a response.' };
      setMessages((m) => [...m, aiMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', height: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg,#0f172a,#071024)', color: '#e6eef8' }}>
      <header style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>NEXA</div>
          <h1 style={{ margin: 0, fontSize: 28, lineHeight: '32px' }}>Hello{userEmail ? `, ${userEmail}` : ', Alex'}!</h1>
          <div style={{ fontSize: 13, opacity: 0.7 }}>Your Personal AI Companion</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{isGuest ? 'Guest Mode' : 'Signed in'}</div>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', gap: 20, padding: 20 }}>
        <section style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 10 }}>
            <input
              placeholder="How can I assist you today?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage(input);
              }}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: 'none', background: 'transparent', color: '#e6eef8' }}
            />
          </div>

          <div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>Primary User Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {['Plan My Day', 'Set Reminder', 'Ask Question', 'Summarize'].map((a) => (
                <button
                  key={a}
                  onClick={() => sendMessage(a)}
                  style={{ padding: 12, borderRadius: 10, background: 'linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.04)', color: '#e6eef8' }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>Active Integrations</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(66,153,225,0.12)', border: '1px solid rgba(66,153,225,0.2)', color: '#aee0ff' }}>Google Calendar</div>
              <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(30,215,96,0.08)', border: '1px solid rgba(30,215,96,0.15)', color: '#c7ffd6' }}>Spotify</div>
              <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,206,84,0.06)', border: '1px solid rgba(255,206,84,0.12)', color: '#ffe9b3' }}>Smart Home</div>
            </div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>Voice Visualizer</div>
            <VoiceVisualizer />
          </div>
        </section>

        <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ flex: 1, overflow: 'auto', padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
            {messages.map((m) => (
              <div key={m.id} style={{ marginBottom: 12, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: m.from === 'user' ? 'linear-gradient(90deg,#6366f1,#ec4899)' : 'linear-gradient(90deg,#06b6d4,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  {m.from === 'user' ? 'U' : 'A'}
                </div>
                <div>
                  <div style={{ fontSize: 13, marginBottom: 4, color: '#cfe9ff' }}>{m.from === 'user' ? 'You' : 'Nexa'}</div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                </div>
              </div>
            ))}
          </div>

          <footer style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(input); }}
              placeholder="Type a message or press the mic"
              style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)', background: 'transparent', color: '#e6eef8' }}
            />
            <button onClick={() => sendMessage(input)} disabled={loading} style={{ padding: '10px 14px', borderRadius: 10, background: '#10b981', border: 'none', color: '#012' }}>{loading ? '...' : 'Send'}</button>
          </footer>
        </section>
      </main>

      <nav style={{ height: 68, borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        {['Home', 'Assistant', 'Integrations', 'Profile'].map((n) => (
          <div key={n} style={{ textAlign: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.02)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{n[0]}</div>
            <div style={{ fontSize: 11, marginTop: 6, opacity: 0.75 }}>{n}</div>
          </div>
        ))}
      </nav>
    </div>
  );
}
