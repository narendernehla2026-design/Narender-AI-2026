import { type FormEvent, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Check, ChevronDown, CircleAlert, Globe2, Layers3, Save, ShieldCheck, UserRound } from 'lucide-react';
import { getGetAssistantProfileQueryKey, useGetAssistantProfile, useUpdateAssistantProfile } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const languageOptions = ['English', 'Hindi', 'Tamil', 'Telugu'];

function AccountAccess({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string>();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSessionEmail(data.session?.user.email ?? data.session?.user.phone));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSessionEmail(nextSession?.user.email ?? nextSession?.user.phone);
      if (nextSession) onAuthenticated();
    });
    return () => data.subscription.unsubscribe();
  }, [onAuthenticated]);

  async function submitEmail(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !email.trim() || !password || busy) return;
    setBusy(true);
    setMessage('');
    const result = isSignUp
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    setMessage(result.error?.message ?? (isSignUp ? 'Check your email to confirm your account.' : 'Signed in.'));
  }

  async function sendPhoneCode(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !phone.trim() || busy) return;
    setBusy(true);
    setMessage('');
    const result = codeSent
      ? await supabase.auth.verifyOtp({ phone: phone.trim(), token: code.trim(), type: 'sms' })
      : await supabase.auth.signInWithOtp({ phone: phone.trim() });
    setBusy(false);
    if (!result.error && !codeSent) setCodeSent(true);
    setMessage(result.error?.message ?? (codeSent ? 'Signed in.' : 'Verification code sent.'));
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setMessage('Signed out.');
  }

  if (!isSupabaseConfigured) {
    return (
      <section className="rounded-2xl border border-[hsl(var(--accent)/.55)] bg-[hsl(var(--accent)/.16)] p-5 shadow-[var(--shadow-sm)] sm:p-7">
        <div className="flex items-start gap-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--accent-foreground))]" />
          <div>
            <h2 className="font-display text-xl font-semibold">Private access is ready to connect</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Add Supabase project settings to enable email and phone sign-in. The preview workspace stays local until then.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (sessionEmail) {
    return (
      <section className="flex flex-col gap-4 rounded-2xl border border-[hsl(var(--secondary)/.6)] bg-[hsl(var(--secondary)/.2)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="font-mono-app text-[9px] uppercase tracking-[.18em] text-muted-foreground">Authenticated session</p>
          <p className="mt-2 text-sm font-semibold">{sessionEmail}</p>
          <p className="mt-1 text-xs text-muted-foreground">Your conversations and memories are scoped to this account.</p>
        </div>
        <button onClick={signOut} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm font-semibold hover:-translate-y-0.5">Sign out</button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-sm)] sm:p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/.6)] text-[hsl(var(--accent-foreground))]"><ShieldCheck className="h-5 w-5" /></div>
        <div><h2 className="font-display text-xl font-semibold">Sign in to your private space</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Use email/password or a phone verification code.</p></div>
      </div>
      <div className="mt-6 flex gap-2 border-b border-[hsl(var(--border))] pb-3">
        <button type="button" onClick={() => { setMethod('email'); setMessage(''); }} className={`rounded-lg px-3 py-2 text-xs font-bold ${method === 'email' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-muted-foreground hover:bg-[hsl(var(--muted))]'}`}>Email</button>
        <button type="button" onClick={() => { setMethod('phone'); setMessage(''); }} className={`rounded-lg px-3 py-2 text-xs font-bold ${method === 'phone' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-muted-foreground hover:bg-[hsl(var(--muted))]'}`}>Phone</button>
      </div>
      {method === 'email' ? (
        <form onSubmit={submitEmail} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2"><span className="mb-2 block text-xs font-bold">Email</span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3.5 py-3 text-sm outline-none focus:border-[hsl(var(--primary))]" /></label>
          <label className="block sm:col-span-2"><span className="mb-2 block text-xs font-bold">Password</span><input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3.5 py-3 text-sm outline-none focus:border-[hsl(var(--primary))]" /></label>
          <button disabled={busy} className="rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-50">{busy ? 'Working…' : isSignUp ? 'Create account' : 'Sign in'}</button>
          <button type="button" onClick={() => setIsSignUp((value) => !value)} className="rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-[hsl(var(--muted))]">{isSignUp ? 'I already have an account' : 'Create a new account'}</button>
        </form>
      ) : (
        <form onSubmit={sendPhoneCode} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2"><span className="mb-2 block text-xs font-bold">Phone number</span><input type="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 00000 00000" className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3.5 py-3 text-sm outline-none focus:border-[hsl(var(--primary))]" /></label>
          {codeSent && <label className="block sm:col-span-2"><span className="mb-2 block text-xs font-bold">Verification code</span><input inputMode="numeric" required value={code} onChange={(event) => setCode(event.target.value)} placeholder="123456" className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3.5 py-3 text-sm outline-none focus:border-[hsl(var(--primary))]" /></label>}
          <button disabled={busy} className="rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-50">{busy ? 'Working…' : codeSent ? 'Verify code' : 'Send code'}</button>
        </form>
      )}
      {message && <p className="mt-4 text-xs text-muted-foreground">{message}</p>}
    </section>
  );
}

export default function Settings() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const profileQuery = useGetAssistantProfile();
  const updateProfile = useUpdateAssistantProfile();
  const [form, setForm] = useState({ displayName: '', preferredLanguage: 'English', profession: '', project: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profileQuery.data) setForm({ displayName: profileQuery.data.displayName, preferredLanguage: profileQuery.data.preferredLanguage, profession: profileQuery.data.profession, project: profileQuery.data.project });
  }, [profileQuery.data]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaved(false);
    updateProfile.mutate({ data: form }, {
      onSuccess: (profile) => {
        queryClient.setQueryData(getGetAssistantProfileQueryKey(), profile);
        setSaved(true);
      },
    });
  }

  const handleAuthenticated = () => { void queryClient.invalidateQueries(); };

  return (
    <div className="noise min-h-[100dvh] bg-[hsl(var(--background))]">
      <header className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] px-5 sm:px-10">
        <Link href="/" data-testid="link-back-workspace" className="flex items-center gap-2 text-sm font-semibold hover:text-[hsl(var(--primary))]"><ArrowLeft className="h-4 w-4" /> Back to workspace</Link>
        <div className="flex items-center gap-2 text-[hsl(var(--primary))]"><Layers3 className="h-4 w-4" /><span className="font-display text-sm font-semibold">Narender AI</span></div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-10 sm:py-16">
        <div className="animate-rise-in max-w-xl"><p className="font-mono-app text-[10px] uppercase tracking-[.22em] text-[hsl(var(--primary))]">Configuration</p><h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Make it sound like you.</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">Your preferences shape how Narender AI thinks alongside you. Nothing here is shared.</p></div>
        {profileQuery.isLoading ? <div className="mt-10 space-y-4"><div className="h-28 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-64 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" /></div> : profileQuery.isError ? <div data-testid="settings-error" className="mt-10 rounded-2xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.05)] p-5"><div className="flex gap-3"><CircleAlert className="h-5 w-5 text-[hsl(var(--destructive))]" /><div><h2 className="font-semibold">Profile unavailable</h2><p className="mt-1 text-sm text-muted-foreground">Settings need a live connection to your assistant profile.</p><button data-testid="button-retry-profile" onClick={() => profileQuery.refetch()} className="mt-3 text-xs font-bold text-[hsl(var(--primary))] hover:underline">Try again</button></div></div></div> : (
          <>
          <div className="mt-10"><AccountAccess onAuthenticated={handleAuthenticated} /></div>
          <form onSubmit={submit} className="mt-5 space-y-5">
            <section className="flex flex-col gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--sidebar))] p-5 text-[hsl(var(--sidebar-foreground))] shadow-[var(--shadow-md)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div><p className="font-mono-app text-[9px] uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.5)]">Signed in account</p><p data-testid="text-account-email" className="mt-2 text-sm font-semibold">{profileQuery.data?.email}</p></div>
              <div className="flex items-center gap-2 self-start rounded-full border border-[hsl(var(--sidebar-foreground)/.18)] px-3 py-1.5 sm:self-auto"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" /><span data-testid="text-account-plan" className="font-mono-app text-[10px] uppercase tracking-[.12em]">{profileQuery.data?.plan || 'Personal plan'}</span></div>
            </section>
            <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-sm)] sm:p-7">
              <div className="flex items-start gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/.6)] text-[hsl(var(--accent-foreground))]"><UserRound className="h-5 w-5" /></div><div><h2 className="font-display text-xl font-semibold">About you</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">A little context helps the assistant skip the obvious.</p></div></div>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs font-bold">Display name</span><input data-testid="input-display-name" value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3.5 py-3 text-sm outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/.12)]" /></label>
                <label className="block"><span className="mb-2 block text-xs font-bold">Profession</span><input data-testid="input-profession" value={form.profession} onChange={(event) => setForm({ ...form, profession: event.target.value })} placeholder="Software engineer" className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3.5 py-3 text-sm outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/.12)]" /></label>
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs font-bold">Current project</span><input data-testid="input-project" value={form.project} onChange={(event) => setForm({ ...form, project: event.target.value })} placeholder="What are you building right now?" className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3.5 py-3 text-sm outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/.12)]" /></label>
              </div>
            </section>
            <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-sm)] sm:p-7">
              <div className="flex items-start gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]"><Globe2 className="h-5 w-5" /></div><div><h2 className="font-display text-xl font-semibold">Assistant language</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Choose the language Narender AI should prefer in replies.</p></div></div>
              <label className="relative mt-7 block max-w-sm"><span className="mb-2 block text-xs font-bold">Preferred language</span><select data-testid="select-preferred-language" value={form.preferredLanguage} onChange={(event) => setForm({ ...form, preferredLanguage: event.target.value })} className="w-full appearance-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3.5 py-3 text-sm outline-none focus:border-[hsl(var(--primary))]">{languageOptions.map((language) => <option key={language} value={language}>{language}</option>)}</select><ChevronDown className="pointer-events-none absolute bottom-3.5 right-3 h-4 w-4 text-muted-foreground" /></label>
            </section>
            <section className="flex items-start gap-3 rounded-2xl border border-[hsl(var(--secondary)/.6)] bg-[hsl(var(--secondary)/.28)] p-5"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--secondary-foreground))]" /><div><h2 className="text-sm font-bold">A private thinking space</h2><p className="mt-1 text-xs leading-5 text-[hsl(var(--secondary-foreground)/.75)]">Your conversations and pinned memories are scoped to your account. Narender AI only uses what you choose to keep here.</p></div></section>
            <div className="flex items-center justify-end gap-4 pt-2"><button data-testid="button-cancel-settings" type="button" onClick={() => setLocation('/')} className="rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-[hsl(var(--muted))]">Cancel</button><button data-testid="button-save-settings" type="submit" disabled={updateProfile.isPending || !profileQuery.data} className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-[0_8px_20px_hsl(var(--primary)/.18)] hover:-translate-y-0.5 disabled:opacity-45">{updateProfile.isPending ? 'Saving…' : saved ? <><Check className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save changes</>}</button></div>
            {updateProfile.isError && <p data-testid="status-settings-error" className="flex items-center justify-end gap-2 text-xs text-[hsl(var(--destructive))]"><CircleAlert className="h-3.5 w-3.5" /> Could not save changes.</p>}
          </form>
          </>
        )}
      </main>
    </div>
  );
}