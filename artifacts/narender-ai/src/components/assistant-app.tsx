import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  Archive,
  ArrowUpRight,
  BrainCircuit,
  CircleAlert,
  Clock3,
  Code2,
  FileText,
  FolderKanban,
  Lightbulb,
  Loader2,
  Menu,
  MessageSquare,
  MoreHorizontal,
  PanelRight,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import {
  getListAssistantMemoryQueryKey,
  getListAssistantMessagesQueryKey,
  useCreateAssistantChat,
  useCreateAssistantMemory,
  useGetAssistantProfile,
  useListAssistantChats,
  useListAssistantMemory,
  useListAssistantMessages,
  useSendAssistantMessage,
} from '@workspace/api-client-react';
import type { AssistantChat, AssistantMemoryInput, AssistantMemoryItem, AssistantMessage } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

function formatTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const hours = Math.round((Date.now() - date.getTime()) / 36e5);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return 'yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function initials(name?: string) {
  return (name || 'N').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function Avatar({ name, image, size = 'md' }: { name?: string; image?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-14 w-14 text-lg' : size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs';
  return image ? (
    <img data-testid="img-avatar" src={image} alt={`${name || 'Narender'} avatar`} className={`${sizeClass} rounded-xl object-cover`} />
  ) : (
    <div data-testid="avatar-fallback" className={`${sizeClass} flex shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent))] font-bold text-[hsl(var(--accent-foreground))]`}>
      {initials(name)}
    </div>
  );
}

function QueryState({ label, retry }: { label: string; retry?: () => void }) {
  return (
    <div data-testid="state-error" className="mx-3 my-4 rounded-xl border border-[hsl(var(--destructive)/.22)] bg-[hsl(var(--destructive)/.06)] p-4">
      <div className="flex items-start gap-3">
        <CircleAlert className="mt-0.5 h-4 w-4 text-[hsl(var(--destructive))]" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">Connection paused</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{label}</p>
          {retry && <button data-testid="button-retry" onClick={retry} className="mt-3 text-xs font-bold text-primary hover:underline">Try again</button>}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ chats, selectedChatId, onSelectChat, onNewChat, isCreating, isError, refetch, profile, onClose }: {
  chats?: AssistantChat[];
  selectedChatId?: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  isCreating: boolean;
  isError: boolean;
  refetch: () => void;
  profile?: { displayName: string; email: string; avatarUrl?: string | null };
  onClose?: () => void;
}) {
  const [search, setSearch] = useState('');
  return (
    <aside className="flex h-full min-h-0 w-[278px] shrink-0 flex-col bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]">
      <div className="flex items-center justify-between px-5 pb-5 pt-6">
        <Link href="/" data-testid="link-home" className="group flex items-center gap-3">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_8px_20px_hsl(var(--primary)/.25)]">
            <BrainCircuit className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[hsl(var(--sidebar))] bg-[hsl(var(--accent))]" />
          </span>
          <span>
            <span className="block font-display text-[17px] font-semibold tracking-tight">Narender AI</span>
            <span className="font-mono-app text-[9px] uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.5)]">thinking space</span>
          </span>
        </Link>
        {onClose && <button data-testid="button-close-sidebar" onClick={onClose} className="rounded-lg p-2 text-[hsl(var(--sidebar-foreground)/.55)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))] md:hidden"><X className="h-4 w-4" /></button>}
      </div>

      <div className="px-4">
        <button data-testid="button-new-chat" onClick={onNewChat} disabled={isCreating} className="flex w-full items-center justify-between rounded-xl bg-[hsl(var(--sidebar-primary))] px-3.5 py-3 text-sm font-semibold text-[hsl(var(--sidebar-primary-foreground))] shadow-[0_10px_25px_hsl(var(--sidebar-primary)/.18)] hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-60">
          <span className="flex items-center gap-2.5">{isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} New conversation</span>
          <span className="rounded-md border border-current/20 px-1.5 py-0.5 font-mono-app text-[9px] opacity-70">N</span>
        </button>
      </div>

      <nav className="mt-7 px-3" aria-label="Primary navigation">
        <p className="px-3 pb-2 font-mono-app text-[9px] uppercase tracking-[.2em] text-[hsl(var(--sidebar-foreground)/.4)]">Workspace</p>
        <Link href="/" data-testid="link-workspace" className="flex items-center gap-3 rounded-lg bg-[hsl(var(--sidebar-accent))] px-3 py-2.5 text-sm font-medium text-[hsl(var(--sidebar-accent-foreground))]">
          <MessageSquare className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" /> Conversations
        </Link>
        <button data-testid="button-search-chats" onClick={() => document.getElementById('chat-search')?.focus()} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[hsl(var(--sidebar-foreground)/.65)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]">
          <Search className="h-4 w-4" /> Search chats <span className="ml-auto font-mono-app text-[9px] opacity-50">⌘ K</span>
        </button>
      </nav>

      <div className="mt-7 flex min-h-0 flex-1 flex-col px-3">
        <div className="flex items-center justify-between px-3 pb-2">
          <p className="font-mono-app text-[9px] uppercase tracking-[.2em] text-[hsl(var(--sidebar-foreground)/.4)]">Recent threads</p>
          <span data-testid="text-chat-count" className="font-mono-app text-[10px] text-[hsl(var(--sidebar-foreground)/.35)]">{chats?.length ?? 0}</span>
        </div>
        <div className="relative mx-2 mb-2">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[hsl(var(--sidebar-foreground)/.35)]" />
          <input id="chat-search" data-testid="input-search-chats" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter threads" className="w-full rounded-lg border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent)/.45)] py-2 pl-8 pr-2 text-xs text-[hsl(var(--sidebar-foreground))] outline-none placeholder:text-[hsl(var(--sidebar-foreground)/.35)] focus:border-[hsl(var(--sidebar-primary)/.6)]" />
        </div>
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
          {isError ? <QueryState label="Your conversations could not be reached." retry={refetch} /> : chats && chats.filter((chat) => chat.title.toLowerCase().includes(search.toLowerCase())).length > 0 ? chats.filter((chat) => chat.title.toLowerCase().includes(search.toLowerCase())).map((chat) => (
            <button data-testid={`button-chat-${chat.id}`} key={chat.id} onClick={() => { onSelectChat(chat.id); onClose?.(); }} className={`group mb-1 w-full rounded-lg px-3 py-2.5 text-left ${selectedChatId === chat.id ? 'bg-[hsl(var(--sidebar-accent))]' : 'hover:bg-[hsl(var(--sidebar-accent)/.7)]'}`}>
              <div className="flex items-start gap-2.5">
                <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${selectedChatId === chat.id ? 'bg-[hsl(var(--sidebar-primary))]' : 'bg-[hsl(var(--sidebar-foreground)/.25)]'}`} />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-[13px] ${selectedChatId === chat.id ? 'font-semibold text-[hsl(var(--sidebar-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)]'}`}>{chat.title}</span>
                  <span className="mt-1 block font-mono-app text-[9px] text-[hsl(var(--sidebar-foreground)/.38)]">{formatTime(chat.updatedAt)} · {chat.messageCount} {chat.messageCount === 1 ? 'message' : 'messages'}</span>
                </span>
                <MoreHorizontal className="mt-0.5 hidden h-4 w-4 text-[hsl(var(--sidebar-foreground)/.4)] group-hover:block" />
              </div>
            </button>
          )) : (
            <div data-testid="empty-chats" className="mx-2 mt-2 rounded-xl border border-dashed border-[hsl(var(--sidebar-border))] p-4 text-center">
              <Archive className="mx-auto h-5 w-5 text-[hsl(var(--sidebar-foreground)/.3)]" />
              <p className="mt-2 text-xs leading-5 text-[hsl(var(--sidebar-foreground)/.55)]">{search ? 'No thread matches that filter.' : 'Your thinking history will live here.'}</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[hsl(var(--sidebar-border))] p-3">
        <Link href="/settings" data-testid="link-settings" className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 hover:bg-[hsl(var(--sidebar-accent))]">
          <Avatar name={profile?.displayName} image={profile?.avatarUrl} size="sm" />
          <span className="min-w-0 flex-1">
            <span data-testid="text-sidebar-name" className="block truncate text-xs font-semibold">{profile?.displayName || 'Narender'}</span>
            <span className="block truncate font-mono-app text-[9px] text-[hsl(var(--sidebar-foreground)/.45)]">{profile?.email || 'Profile settings'}</span>
          </span>
          <Settings className="h-4 w-4 text-[hsl(var(--sidebar-foreground)/.4)]" />
        </Link>
      </div>
    </aside>
  );
}

function EmptyConversation({ onNewChat, hasChats }: { onNewChat: () => void; hasChats: boolean }) {
  return (
    <div data-testid="empty-conversation" className="surface-grid flex min-h-full flex-1 items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-[hsl(var(--primary)/.25)] bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))]">
          <Sparkles className="h-8 w-8" />
          <span className="absolute -right-1 top-2 h-3 w-3 rounded-full bg-[hsl(var(--accent))]" />
        </div>
        <p className="mt-7 font-mono-app text-[10px] uppercase tracking-[.24em] text-[hsl(var(--primary))]">Private intelligence layer</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground">Make room for the<br /><span className="text-[hsl(var(--primary))]">next good thought.</span></h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted-foreground">Ask Narender AI to untangle a problem, hold onto a decision, or help you move a project forward.</p>
        <button data-testid="button-start-thinking" onClick={onNewChat} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-[0_10px_22px_hsl(var(--primary)/.22)] hover:-translate-y-0.5">
          <Plus className="h-4 w-4" /> {hasChats ? 'Open a new thread' : 'Start a conversation'}
        </button>
        <p className="mt-4 font-mono-app text-[10px] text-muted-foreground/70">Your context stays yours.</p>
      </div>
    </div>
  );
}

function MessageBubble({ message, index }: { message: AssistantMessage; index: number }) {
  const isUser = message.role === 'user';
  return (
    <div data-testid={`message-${message.id}`} className={`animate-rise-in flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`} style={{ animationDelay: `${Math.min(index * 45, 300)}ms` }}>
      {!isUser && <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]"><BrainCircuit className="h-3.5 w-3.5" /></div>}
      <div className={`max-w-[min(680px,86%)] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-3 text-[14px] leading-6 ${isUser ? 'rounded-br-md bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]' : 'rounded-bl-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-foreground shadow-[var(--shadow-sm)]'}`}>
          <p data-testid={`text-message-content-${message.id}`} className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className={`mt-1.5 font-mono-app text-[9px] text-muted-foreground ${isUser ? 'text-right' : ''}`}>{formatTime(message.createdAt)}</p>
      </div>
    </div>
  );
}

function Conversation({ chat, onOpenPanel, onNewChat }: { chat?: AssistantChat; onOpenPanel: () => void; onNewChat: () => void }) {
  const [draft, setDraft] = useState('');
  const queryClient = useQueryClient();
  const messagesQuery = useListAssistantMessages(chat?.id || '', { query: { enabled: !!chat?.id, queryKey: getListAssistantMessagesQueryKey(chat?.id || '') } });
  const sendMessage = useSendAssistantMessage();
  const messages = messagesQuery.data;
  const hasMessages = !!messages && messages.length > 0;

  function submitMessage(event: React.FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !chat?.id || sendMessage.isPending) return;
    setDraft('');
    sendMessage.mutate({ chatId: chat.id, data: { content } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAssistantMessagesQueryKey(chat.id) }),
    });
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-[hsl(var(--background))]">
      <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.88)] px-5 backdrop-blur-md sm:px-8">
        <div className="min-w-0">
          <p className="font-mono-app text-[9px] uppercase tracking-[.2em] text-muted-foreground">Active thread</p>
          <h2 data-testid="text-active-chat-title" className="mt-1 truncate font-display text-xl font-semibold">{chat?.title || 'Choose a conversation'}</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button data-testid="button-toggle-context" onClick={onOpenPanel} className="rounded-lg p-2 text-muted-foreground hover:bg-[hsl(var(--muted))] hover:text-foreground md:hidden"><PanelRight className="h-4 w-4" /></button>
          <button data-testid="button-more-chat" className="rounded-lg p-2 text-muted-foreground hover:bg-[hsl(var(--muted))] hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
        </div>
      </header>

      {!chat ? <EmptyConversation onNewChat={onNewChat} hasChats={false} /> : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-7 sm:px-8">
            {messagesQuery.isLoading ? (
              <div data-testid="loading-messages" className="mx-auto flex max-w-2xl flex-col gap-5">
                {[0, 1, 2].map((item) => <div key={item} className={`flex gap-3 ${item === 1 ? 'justify-end' : ''}`}><div className={`h-16 animate-pulse rounded-2xl bg-[hsl(var(--muted))] ${item === 1 ? 'w-2/3' : 'w-3/4'}`} /></div>)}
              </div>
            ) : messagesQuery.isError ? <QueryState label="Messages are not available right now." retry={() => messagesQuery.refetch()} /> : hasMessages ? (
              <div className="mx-auto flex max-w-2xl flex-col gap-6">{messages.map((message, index) => <MessageBubble key={message.id} message={message} index={index} />)}{sendMessage.isPending && <div data-testid="status-thinking" className="flex items-center gap-3 text-sm text-muted-foreground"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--secondary))]"><BrainCircuit className="h-3.5 w-3.5" /></div><span>Thinking<span className="animate-caret ml-0.5">|</span></span></div>}</div>
            ) : (
              <div data-testid="empty-messages" className="mx-auto flex h-full max-w-md flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--secondary)/.65)] text-[hsl(var(--secondary-foreground))]"><Lightbulb className="h-5 w-5" /></div>
                <h3 className="mt-5 font-display text-2xl font-semibold">A blank page, in a good way.</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">This thread is ready. Start with a question, a rough idea, or the part that is not working yet.</p>
              </div>
            )}
          </div>
          <div className="shrink-0 px-5 pb-5 pt-2 sm:px-8 sm:pb-7">
            <form onSubmit={submitMessage} className="mx-auto max-w-2xl">
              <div className={`rounded-2xl border bg-[hsl(var(--card))] p-2 shadow-[var(--shadow-md)] ${sendMessage.isError ? 'border-[hsl(var(--destructive)/.45)]' : 'border-[hsl(var(--border))] focus-within:border-[hsl(var(--primary)/.5)]'}`}>
                <textarea data-testid="input-message" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submitMessage(event); } }} placeholder="Think out loud..." rows={2} className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-muted-foreground/65" />
                <div className="flex items-center justify-between px-2 pb-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary-foreground))]" /> Context-aware</div>
                  <button data-testid="button-send-message" type="submit" disabled={!draft.trim() || sendMessage.isPending} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35">{sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
                </div>
              </div>
              {sendMessage.isError && <p data-testid="status-send-error" className="mt-2 text-center text-xs text-[hsl(var(--destructive))]">Your message could not be sent. Check the connection and try again.</p>}
              <p className="mt-2 text-center font-mono-app text-[9px] text-muted-foreground/60">Enter to send · Shift + Enter for a new line</p>
            </form>
          </div>
        </>
      )}
    </section>
  );
}

function MemoryIcon({ category }: { category: AssistantMemoryItem['category'] }) {
  if (category === 'code') return <Code2 className="h-4 w-4" />;
  if (category === 'meeting') return <Clock3 className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

function ContextPanel({ profile, memory, isLoading, isError, refetch }: { profile?: { project: string; profession: string }; memory?: AssistantMemoryItem[]; isLoading: boolean; isError: boolean; refetch: () => void }) {
  const queryClient = useQueryClient();
  const createMemory = useCreateAssistantMemory();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<AssistantMemoryInput>({ category: 'note', title: '', content: '' });

  function addMemory(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim() || createMemory.isPending) return;
    createMemory.mutate({ data: { ...form, title: form.title.trim(), content: form.content.trim() } }, {
      onSuccess: () => {
        setForm({ category: 'note', title: '', content: '' });
        setIsAdding(false);
        queryClient.invalidateQueries({ queryKey: getListAssistantMemoryQueryKey() });
      },
    });
  }

  return (
    <aside className="flex min-h-0 w-[310px] shrink-0 flex-col border-l border-[hsl(var(--border))] bg-[hsl(var(--card)/.55)]">
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-[hsl(var(--border))] px-5">
        <div><p className="font-mono-app text-[9px] uppercase tracking-[.2em] text-muted-foreground">Context layer</p><h2 className="mt-1 font-display text-lg font-semibold">What I remember</h2></div>
        <button data-testid="button-add-memory" onClick={() => setIsAdding((value) => !value)} className="rounded-lg p-2 text-muted-foreground hover:bg-[hsl(var(--muted))] hover:text-foreground"><Plus className="h-4 w-4" /></button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {isAdding && <form data-testid="form-add-memory" onSubmit={addMemory} className="animate-rise-in mb-5 rounded-xl border border-[hsl(var(--primary)/.35)] bg-[hsl(var(--primary)/.05)] p-3.5">
          <div className="mb-3 flex items-center justify-between"><p className="text-xs font-bold">Pin a memory</p><button data-testid="button-cancel-memory" type="button" onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button></div>
          <select data-testid="select-memory-category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as AssistantMemoryInput['category'] })} className="mb-2 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-2.5 py-2 text-xs outline-none focus:border-[hsl(var(--primary))]"><option value="note">Note</option><option value="code">Code</option><option value="meeting">Meeting</option></select>
          <input data-testid="input-memory-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Memory title" className="mb-2 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-2.5 py-2 text-xs outline-none focus:border-[hsl(var(--primary))]" />
          <textarea data-testid="input-memory-content" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="What should stay top of mind?" rows={3} className="w-full resize-none rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-2.5 py-2 text-xs leading-5 outline-none focus:border-[hsl(var(--primary))]" />
          <button data-testid="button-save-memory" disabled={!form.title.trim() || !form.content.trim() || createMemory.isPending} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] py-2 text-xs font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-45">{createMemory.isPending && <Loader2 className="h-3 w-3 animate-spin" />} Pin memory</button>
          {createMemory.isError && <p className="mt-2 text-[10px] text-[hsl(var(--destructive))]">Could not pin this memory.</p>}
        </form>}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/.5)] p-3.5">
          <div className="flex items-center gap-2 text-[hsl(var(--primary))]"><FolderKanban className="h-4 w-4" /><span className="font-mono-app text-[9px] uppercase tracking-[.16em]">Current focus</span></div>
          {profile?.project ? <><h3 data-testid="text-project-name" className="mt-3 font-display text-base font-semibold">{profile.project}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Your assistant is tuned for your work as a {profile.profession || 'software engineer'}.</p></> : <div data-testid="empty-project-context" className="mt-3"><p className="text-xs leading-5 text-muted-foreground">Add a project in settings to give every conversation a useful starting point.</p><Link href="/settings" data-testid="link-add-project" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))] hover:underline">Set project <ArrowUpRight className="h-3 w-3" /></Link></div>}
        </div>

        <div className="mt-7 flex items-center justify-between"><p className="font-mono-app text-[9px] uppercase tracking-[.18em] text-muted-foreground">Pinned memories</p><span data-testid="text-memory-count" className="font-mono-app text-[10px] text-muted-foreground">{memory?.length ?? 0}</span></div>
        {isLoading ? <div data-testid="loading-memory" className="mt-3 space-y-2">{[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />)}</div> : isError ? <QueryState label="Pinned memory could not be loaded." retry={refetch} /> : memory && memory.length > 0 ? <div className="mt-3 space-y-2">{memory.map((item) => <article data-testid={`card-memory-${item.id}`} key={item.id} className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5 hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/.35)]"><div className="flex items-start gap-2.5"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))] text-muted-foreground"><MemoryIcon category={item.category} /></span><div className="min-w-0"><h3 data-testid={`text-memory-title-${item.id}`} className="truncate text-xs font-bold">{item.title}</h3><p className="mt-1 line-clamp-2 text-[11px] leading-5 text-muted-foreground">{item.content}</p><p className="mt-2 font-mono-app text-[9px] text-muted-foreground/70">{item.category} · {formatTime(item.updatedAt)}</p></div></div></article>)}</div> : <div data-testid="empty-memory" className="mt-3 rounded-xl border border-dashed border-[hsl(var(--border))] p-4"><p className="text-xs leading-5 text-muted-foreground">No pinned memories yet. Add the decisions and details you want Narender AI to carry forward.</p><button data-testid="button-empty-add-memory" onClick={() => setIsAdding(true)} className="mt-3 text-xs font-bold text-[hsl(var(--primary))] hover:underline">Pin your first memory</button></div>}
      </div>
      <div className="border-t border-[hsl(var(--border))] px-5 py-3.5"><div className="flex items-center gap-2 text-[10px] text-muted-foreground"><span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-[hsl(var(--secondary-foreground))]" /> Memory stays private to you</div></div>
    </aside>
  );
}

export default function AssistantWorkspace() {
  const [selectedChatId, setSelectedChatId] = useState<string>();
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [mobileContext, setMobileContext] = useState(false);
  const profileQuery = useGetAssistantProfile();
  const chatsQuery = useListAssistantChats();
  const memoryQuery = useListAssistantMemory();
  const createChat = useCreateAssistantChat();
  const chats = chatsQuery.data;
  const selectedChat = useMemo(() => chats?.find((chat) => chat.id === selectedChatId), [chats, selectedChatId]);

  useEffect(() => {
    if (!selectedChatId && chats?.[0]?.id) setSelectedChatId(chats[0].id);
  }, [chats, selectedChatId]);

  function newChat() {
    createChat.mutate({ data: { title: 'New conversation' } }, {
      onSuccess: (chat) => setSelectedChatId(chat.id),
    });
  }

  return (
    <div className="noise flex min-h-[100dvh] overflow-hidden bg-[hsl(var(--background))]">
      <div className={`fixed inset-0 z-30 bg-[hsl(var(--sidebar)/.45)] backdrop-blur-sm transition-opacity md:hidden ${mobileSidebar ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setMobileSidebar(false)} />
      <div className={`fixed inset-y-0 left-0 z-40 transition-transform md:static md:block md:translate-x-0 ${mobileSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar chats={chats} selectedChatId={selectedChatId} onSelectChat={setSelectedChatId} onNewChat={newChat} isCreating={createChat.isPending} isError={!!chatsQuery.isError} refetch={() => chatsQuery.refetch()} profile={profileQuery.data} onClose={() => setMobileSidebar(false)} />
      </div>
      <main className="flex min-h-[100dvh] min-w-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-[hsl(var(--border))] px-4 md:hidden">
          <button data-testid="button-open-sidebar" onClick={() => setMobileSidebar(true)} className="rounded-lg p-2 text-muted-foreground hover:bg-[hsl(var(--muted))]"><Menu className="h-4 w-4" /></button>
          <span className="font-display text-sm font-semibold">Narender AI</span>
          <button data-testid="button-open-context" onClick={() => setMobileContext(true)} className="rounded-lg p-2 text-muted-foreground hover:bg-[hsl(var(--muted))]"><PanelRight className="h-4 w-4" /></button>
        </div>
        <div className="flex min-h-0 flex-1">
          <Conversation chat={selectedChat} onOpenPanel={() => setMobileContext(true)} onNewChat={newChat} />
          <div className={`fixed inset-y-0 right-0 z-40 w-[min(310px,92vw)] transition-transform md:static md:block md:translate-x-0 ${mobileContext ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-full md:hidden"><ContextPanel profile={profileQuery.data} memory={memoryQuery.data} isLoading={!!memoryQuery.isLoading} isError={!!memoryQuery.isError} refetch={() => memoryQuery.refetch()} /></div>
            <div className="hidden h-full md:block"><ContextPanel profile={profileQuery.data} memory={memoryQuery.data} isLoading={!!memoryQuery.isLoading} isError={!!memoryQuery.isError} refetch={() => memoryQuery.refetch()} /></div>
          </div>
        </div>
      </main>
    </div>
  );
}