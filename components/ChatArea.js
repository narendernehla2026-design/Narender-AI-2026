'use client'

import React, { useState, useRef } from 'react'
import MessageBubble from './MessageBubble'
import VoiceControls from './VoiceControls'
import ScreenPreview from './ScreenPreview'
import { Paperclip, Send } from 'lucide-react'

export default function ChatArea({ activeChatId }) {
  const [messages, setMessages] = useState([
    { id: 1, from: 'ai', text: 'Welcome to Narender AI Vault — how can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef(null)

  const send = async () => {
    const prompt = input.trim()
    if (!prompt) return

    const userMsg = { id: Date.now(), from: 'user', text: prompt }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, chatId: activeChatId })
      })

      if (!res.ok) {
        let errText = 'Unknown error'
        try { const j = await res.json(); errText = j?.error || JSON.stringify(j) } catch (e) { errText = await res.text().catch(() => res.statusText) }
        setMessages((m) => [...m, { id: Date.now() + 1, from: 'ai', text: `Error: ${errText}` }])
        return
      }

      const json = await res.json()
      const reply = json?.reply ?? 'No reply from assistant.'
      setMessages((m) => [...m, { id: Date.now() + 2, from: 'ai', text: reply }])

      setTimeout(() => {
        const el = document.getElementById('chat-end')
        el?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    } catch (err) {
      console.error('Send error', err)
      setMessages((m) => [...m, { id: Date.now() + 3, from: 'ai', text: `Network error: ${err?.message || err}` }])
    } finally {
      setLoading(false)
    }
  }

  const onAttach = () => {
    if (fileRef.current) fileRef.current.click()
  }

  return (
    <main className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-4 border-b border-vault-800 bg-vault-900">
        <h3 className="text-lg font-semibold">Conversation</h3>
        <div className="flex items-center gap-3">
          <VoiceControls />
          <ScreenPreview />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4 bg-vault-700">
        <div className="max-w-3xl mx-auto">
          {messages.map((m) => (
            <MessageBubble key={m.id} id={m.id} from={m.from} text={m.text} />
          ))}
          <div id="chat-end" />
        </div>
      </div>

      <div className="sticky bottom-0 bg-vault-900 p-4 border-t border-vault-800">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <input
            className="flex-1 bg-vault-800 py-2 px-3 rounded-md outline-none text-white placeholder:text-gray-400"
            placeholder="Type or use voice input..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            disabled={loading}
            aria-label="Chat input"
          />
          <button onClick={onAttach} className="p-2 rounded-md hover:bg-vault-800 text-white" title="Attach file">
            <Paperclip size={18} />
          </button>
          <input ref={fileRef} type="file" className="hidden" />
          <button onClick={send} className="bg-accent text-[#021524] px-3 py-2 rounded-md flex items-center gap-2 disabled:opacity-50" disabled={loading} aria-label="Send">
            <Send size={16} /> {loading ? 'Thinking…' : 'Send'}
          </button>
        </div>
      </div>
    </main>
  )
}
