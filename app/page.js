'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Brain,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import VoiceControls from '@/components/VoiceControls';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';

const memoryCategories = ['personal', 'work', 'preference', 'project', 'note'];
const supabaseReady = isSupabaseConfigured();

function AuthPanel() {
  const [method, setMethod] = useState('email');
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);

    try {
      const supabase = getSupabaseClient();
      if (method === 'email' && resetMode) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        });
        if (resetError) throw resetError;
        setMessage('If an account uses that address, password reset instructions will arrive by email.');
        return;
      }
      if (method === 'phone' && otpSent) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          phone: phone.trim(),
          token: otp.trim(),
          type: 'sms',
        });
        if (verifyError) throw verifyError;
        return;
      }

      if (method === 'phone') {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          phone: phone.trim(),
        });
        if (otpError) throw otpError;
        setOtpSent(true);
        setMessage('A verification code was sent to your phone.');
        return;
      }

      if (creatingAccount) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) throw signUpError;
        if (!data.session) setMessage('Check your email to confirm your account, then sign in.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (authError) {
      setError(authError?.message || 'Authentication could not be completed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand-mark"><Sparkles size={22} /></div>
        <p className="eyebrow">PRIVATE AI WORKSPACE</p>
        <h1>Welcome to Narender AI</h1>
        <p className="auth-subtitle">Sign in to keep your conversations and saved context private to your account.</p>

        <div className="auth-tabs" role="tablist" aria-label="Sign-in method">
          <button type="button" className={method === 'email' ? 'selected' : ''} onClick={() => { setMethod('email'); setError(''); setMessage(''); }}>Email</button>
          <button type="button" className={method === 'phone' ? 'selected' : ''} onClick={() => { setMethod('phone'); setOtpSent(false); setError(''); setMessage(''); }}>Phone</button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {method === 'email' ? (
            <>
              <label>Email address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
              {!resetMode && <label>Password<input type="password" autoComplete={creatingAccount ? 'new-password' : 'current-password'} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>}
            </>
          ) : (
            <>
              <label>Phone number<input type="tel" autoComplete="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+1 555 123 4567" disabled={otpSent} /></label>
              {otpSent && <label>Verification code<input inputMode="numeric" autoComplete="one-time-code" required value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="Enter the code" /></label>}
            </>
          )}

          {(error || message) && <p className={error ? 'form-message error' : 'form-message success'} role="status">{error || message}</p>}
          <button className="primary-button full-width" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : method === 'phone' ? (otpSent ? 'Verify code' : 'Send code') : (resetMode ? 'Send secure link' : creatingAccount ? 'Create account' : 'Sign in')}
          </button>
        </form>

        {method === 'email' && !resetMode && !creatingAccount && (
          <button className="text-button" type="button" onClick={() => { setResetMode(true); setError(''); setMessage(''); }}>
            Forgot your password?
          </button>
        )}
        {method === 'email' && !resetMode && (
          <button className="text-button" type="button" onClick={() => { setCreatingAccount(!creatingAccount); setError(''); setMessage(''); }}>
            {creatingAccount ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </button>
        )}
        {method === 'email' && resetMode && (
          <button className="text-button" type="button" onClick={() => { setResetMode(false); setError(''); setMessage(''); }}>
            Back to sign in
          </button>
        )}
        {method === 'phone' && otpSent && <button className="text-button" type="button" onClick={() => { setOtpSent(false); setOtp(''); setMessage(''); }}>Use a different phone number</button>}

        <div className="privacy-note"><ShieldCheck size={16} /><span>Your account data is isolated by Supabase row-level security.</span></div>
      </section>
    </main>
  );
}

function PasswordResetPanel({ onComplete }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function updatePassword(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { error: updateError } = await getSupabaseClient().auth.updateUser({ password });
      if (updateError) throw updateError;
      window.history.replaceState({}, '', window.location.pathname);
      onComplete();
    } catch (updateError) {
      setError(updateError?.message || 'Password could not be updated.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand-mark"><Sparkles size={22} /></div>
        <p className="eyebrow">ACCOUNT SECURITY</p>
        <h1>Choose a new password</h1>
        <p className="auth-subtitle">Use at least 8 characters. Your password is stored and verified by Supabase Auth.</p>
        <form className="auth-form" onSubmit={updatePassword}>
          <label>New password<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {error && <p className="form-message error" role="alert">{error}</p>}
          <button className="primary-button full-width" type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
        </form>
      </section>
    </main>
  );
}

export default function Home() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [memories, setMemories] = useState([]);
  const [input, setInput] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryContent, setMemoryContent] = useState('');
  const [memoryCategory, setMemoryCategory] = useState('note');
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const [sending, setSending] = useState(false);
  const [savingMemory, setSavingMemory] = useState(false);
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [mobilePanel, setMobilePanel] = useState('');
  const bottomRef = useRef(null);
  const draftId = useRef(0);
  const authUserId = useRef(null);

  useEffect(() => {
    if (!supabaseReady) {
      setAuthReady(true);
      return undefined;
    }

    const supabase = getSupabaseClient();
    let active = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError('Unable to restore your sign-in session.');
      setSession(data?.session || null);
      authUserId.current = data?.session?.user?.id || null;
      setPasswordRecovery(window.location.hash.includes('type=recovery'));
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      const nextUserId = nextSession?.user?.id || null;
      if (authUserId.current !== nextUserId) {
        setChats([]);
        setMemories([]);
        setMessages([]);
        setActiveChatId(null);
      }
      authUserId.current = nextUserId;
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      setSession(nextSession);
      setError('');
      setNotice('');
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const apiFetch = useCallback(async (url, options = {}) => {
    if (!session?.access_token) throw new Error('Your session has expired. Sign in again.');
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${session.access_token}`);
    if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

    const response = await fetch(url, { ...options, headers, cache: 'no-store' });
    if (response.status === 204) return null;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'The request could not be completed.');
    return data;
  }, [session?.access_token]);

  const refreshWorkspace = useCallback(async () => {
    if (!session?.access_token) {
      setChats([]);
      setMemories([]);
      setMessages([]);
      setActiveChatId(null);
      return;
    }

    setLoadingWorkspace(true);
    setError('');
    try {
      const [chatResult, memoryResult] = await Promise.all([
        apiFetch('/api/chats'),
        apiFetch('/api/memory'),
      ]);
      setChats(chatResult.chats || []);
      setMemories(memoryResult.memories || []);
      setActiveChatId((current) =>
        chatResult.chats?.some((chat) => chat.id === current)
          ? current
          : chatResult.chats?.[0]?.id || null,
      );
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoadingWorkspace(false);
    }
  }, [apiFetch, session?.access_token]);

  useEffect(() => {
    void refreshWorkspace();
  }, [refreshWorkspace]);

  useEffect(() => {
    if (!activeChatId || !session?.access_token) {
      setMessages([]);
      return undefined;
    }

    let active = true;
    setMessages([]);
    apiFetch(`/api/chats/${activeChatId}/messages`)
      .then((result) => { if (active) setMessages(result.messages || []); })
      .catch((loadError) => { if (active) setError(loadError.message); });
    return () => { active = false; };
  }, [activeChatId, apiFetch, session?.access_token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  const activeChat = chats.find((chat) => chat.id === activeChatId);
  const visibleChats = useMemo(() => {
    const query = chatSearch.trim().toLowerCase();
    return query ? chats.filter((chat) => chat.title.toLowerCase().includes(query)) : chats;
  }, [chats, chatSearch]);

  async function createChat() {
    setError('');
    try {
      const result = await apiFetch('/api/chats', {
        method: 'POST',
        body: JSON.stringify({ title: 'New conversation' }),
      });
      setChats((current) => [result.chat, ...current]);
      setActiveChatId(result.chat.id);
      setMessages([]);
      setMobilePanel('');
    } catch (createError) {
      setError(createError.message);
    }
  }

  async function sendMessage(event) {
    event?.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    let chatId = activeChatId;
    setError('');
    setNotice('');

    try {
      if (!chatId) {
        const created = await apiFetch('/api/chats', {
          method: 'POST',
          body: JSON.stringify({ title: content.replace(/\s+/g, ' ').slice(0, 72) }),
        });
        chatId = created.chat.id;
        setChats((current) => [created.chat, ...current]);
      }

      const optimisticId = `draft-${++draftId.current}`;
      setMessages((current) => [...current, {
        id: optimisticId,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      }]);
      setInput('');
      setSending(true);

      const result = await apiFetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      setActiveChatId(chatId);
      setMessages((current) => [
        ...current.filter((message) => message.id !== optimisticId),
        { id: `user-${optimisticId}`, role: 'user', content, created_at: new Date().toISOString() },
        result.message,
      ]);
      setChats((current) => current
        .map((chat) => chat.id === chatId ? { ...chat, title: result.title, updated_at: new Date().toISOString() } : chat)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
    } catch (sendError) {
      setError(sendError.message);
      if (chatId) {
        setActiveChatId(chatId);
        apiFetch(`/api/chats/${chatId}/messages`)
          .then((result) => setMessages(result.messages || []))
          .catch(() => {});
      }
    } finally {
      setSending(false);
    }
  }

  async function saveMemory(event) {
    event.preventDefault();
    setSavingMemory(true);
    setError('');
    try {
      const result = await apiFetch('/api/memory', {
        method: 'POST',
        body: JSON.stringify({
          category: memoryCategory,
          title: memoryTitle,
          content: memoryContent,
        }),
      });
      setMemories((current) => [result.memory, ...current]);
      setMemoryTitle('');
      setMemoryContent('');
      setNotice('Saved to your private memory.');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSavingMemory(false);
    }
  }

  async function deleteMemory(memoryId) {
    setError('');
    try {
      await apiFetch(`/api/memory/${memoryId}`, { method: 'DELETE' });
      setMemories((current) => current.filter((memory) => memory.id !== memoryId));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function signOut() {
    const { error: signOutError } = await getSupabaseClient().auth.signOut();
    if (signOutError) setError('Sign out could not be completed. Please retry.');
  }

  if (!authReady) {
    return <main className="auth-shell"><div className="loading-card">Loading your private workspace…</div></main>;
  }

  if (!supabaseReady) {
    return (
      <main className="auth-shell">
        <section className="auth-card setup-card">
          <div className="brand-mark"><Sparkles size={22} /></div>
          <p className="eyebrow">DEPLOYMENT SETUP</p>
          <h1>Connect your private workspace</h1>
          <p className="auth-subtitle">Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your hosting environment to enable sign-in and private storage.</p>
          <p className="privacy-note"><ShieldCheck size={16} /><span>Do not add a service-role key to the browser or commit keys to the repository.</span></p>
        </section>
      </main>
    );
  }

  if (!session) return <AuthPanel />;
  if (passwordRecovery) {
    return <PasswordResetPanel onComplete={() => { setPasswordRecovery(false); setNotice('Your password has been updated.'); }} />;
  }

  return (
    <main className="workspace">
      {mobilePanel && <button className="drawer-backdrop" aria-label="Close panel" onClick={() => setMobilePanel('')} />}

      <aside className={`sidebar chat-sidebar ${mobilePanel === 'chats' ? 'drawer-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark small"><Sparkles size={18} /></div>
          <div><strong>Narender AI</strong><span>PRIVATE WORKSPACE</span></div>
          <button className="icon-button close-drawer" aria-label="Close conversations" onClick={() => setMobilePanel('')}><X size={18} /></button>
        </div>

        <button className="primary-button new-chat-button" onClick={createChat}><Plus size={17} /> New conversation</button>
        <label className="search-field"><span className="sr-only">Search conversations</span><input value={chatSearch} onChange={(event) => setChatSearch(event.target.value)} placeholder="Search conversations" /></label>
        <div className="list-heading"><span>RECENT CONVERSATIONS</span><span>{chats.length}</span></div>
        <nav className="chat-list" aria-label="Recent conversations">
          {visibleChats.map((chat) => (
            <button key={chat.id} className={`chat-list-item ${chat.id === activeChatId ? 'active' : ''}`} onClick={() => { setActiveChatId(chat.id); setMobilePanel(''); }}>
              <MessageCircle size={15} />
              <span><strong>{chat.title}</strong><small>{new Date(chat.updated_at).toLocaleDateString()}</small></span>
            </button>
          ))}
          {!visibleChats.length && <p className="empty-list">{loadingWorkspace ? 'Loading conversations…' : 'No conversations yet.'}</p>}
        </nav>

        <div className="account-card">
          <div className="avatar"><User size={17} /></div>
          <div className="account-details"><strong>{session.user?.email || session.user?.phone || 'Your account'}</strong><span>Private account</span></div>
          <button className="icon-button" onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={17} /></button>
        </div>
      </aside>

      <section className="conversation">
        <header className="conversation-header">
          <button className="icon-button mobile-only" aria-label="Open conversations" onClick={() => setMobilePanel('chats')}><Menu size={20} /></button>
          <div className="conversation-title">
            <span className="eyebrow">ACTIVE THREAD</span>
            <h1>{activeChat?.title || 'Your private assistant'}</h1>
          </div>
          <button className="context-toggle icon-button" aria-label="Open saved memory" onClick={() => setMobilePanel('memory')}><Brain size={19} /></button>
        </header>

        {error && <div className="notice error-notice" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss error"><X size={15} /></button></div>}
        {notice && <div className="notice success-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss message"><X size={15} /></button></div>}

        <div className="messages-scroll">
          {messages.length ? (
            <div className="message-stack">
              {messages.map((message) => (
                <article key={message.id} className={`message-row ${message.role === 'user' ? 'from-user' : 'from-assistant'}`}>
                  {message.role !== 'user' && <div className="assistant-avatar"><Sparkles size={15} /></div>}
                  <div className="message-content">
                    <div className="message-bubble">{message.content}</div>
                    <time>{new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>
                  </div>
                </article>
              ))}
              {sending && <div className="thinking-indicator"><span /><span /><span /> Narender AI is thinking</div>}
              <div ref={bottomRef} />
            </div>
          ) : (
            <div className="welcome-state">
              <div className="welcome-icon"><Sparkles size={25} /></div>
              <p className="eyebrow">YOUR PRIVATE AI</p>
              <h2>{loadingWorkspace ? 'Loading your workspace…' : 'What would you like to work on?'}</h2>
              <p>Your conversations and saved context are private to your account. Start a conversation or add a memory for more personalized help.</p>
              <button className="suggestion-chip" onClick={createChat}><Plus size={15} /> Start a conversation</button>
            </div>
          )}
        </div>

        <form className="composer" onSubmit={sendMessage}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Think out loud…"
            aria-label="Message Narender AI"
            maxLength={6000}
            disabled={sending}
          />
          <div className="composer-footer">
            <span className="composer-hint"><span className="status-dot" /> Context-aware <span className="character-count">{input.length}/6000</span></span>
            <div className="composer-actions">
              <VoiceControls onTranscript={(transcript) => setInput((current) => `${current}${current ? ' ' : ''}${transcript}`)} isListening={listening} setIsListening={setListening} />
              <button className="send-button" type="submit" disabled={!input.trim() || sending} aria-label="Send message">{sending ? <span className="spinner" /> : <Send size={17} />}</button>
            </div>
          </div>
          <p className="composer-footnote">Enter to send · Shift + Enter for a new line · AI responses may be inaccurate</p>
        </form>
      </section>

      <aside className={`sidebar memory-sidebar ${mobilePanel === 'memory' ? 'drawer-open' : ''}`}>
        <div className="memory-header">
          <div><span className="eyebrow">CONTEXT LAYER</span><h2>What I remember</h2></div>
          <button className="icon-button close-drawer" aria-label="Close saved memory" onClick={() => setMobilePanel('')}><X size={18} /></button>
        </div>
        <p className="memory-explainer">Saved context is only used to personalize your account’s assistant.</p>

        <form className="memory-form" onSubmit={saveMemory}>
          <label>Category
            <select value={memoryCategory} onChange={(event) => setMemoryCategory(event.target.value)}>
              {memoryCategories.map((category) => <option key={category} value={category}>{category[0].toUpperCase() + category.slice(1)}</option>)}
            </select>
          </label>
          <label>Title<input value={memoryTitle} onChange={(event) => setMemoryTitle(event.target.value)} placeholder="e.g. Current project" maxLength={120} required /></label>
          <label>Memory<textarea value={memoryContent} onChange={(event) => setMemoryContent(event.target.value)} placeholder="What should your assistant remember?" maxLength={2000} rows={3} required /></label>
          <button className="secondary-button full-width" type="submit" disabled={savingMemory || !memoryTitle.trim() || !memoryContent.trim()}><Plus size={15} /> {savingMemory ? 'Saving…' : 'Save memory'}</button>
        </form>

        <div className="list-heading memory-list-heading"><span>YOUR MEMORIES</span><span>{memories.length}</span></div>
        <div className="memory-list">
          {memories.map((memory) => (
            <article className="memory-card" key={memory.id}>
              <div className="memory-card-top"><span className={`memory-tag tag-${memory.category}`}>{memory.category}</span><button className="icon-button delete-button" aria-label={`Delete ${memory.title}`} onClick={() => deleteMemory(memory.id)}><Trash2 size={15} /></button></div>
              <h3>{memory.title}</h3>
              <p>{memory.content}</p>
              <time>{new Date(memory.updated_at).toLocaleDateString()}</time>
            </article>
          ))}
          {!memories.length && <p className="empty-list">No saved memories yet. Add context above when it would help.</p>}
        </div>
        <div className="memory-private-note"><ShieldCheck size={15} /> Private to your account</div>
      </aside>
    </main>
  );
}
