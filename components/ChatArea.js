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
    <main className="flex flex-col h-screen bg-white text-gray-900">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
        <h3 className="text-xl font-bold text-gray-800">Conversation</h3>
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 transition">
            <VoiceControls />
          </div>
          <div className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 transition">
            <ScreenPreview />
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-auto p-6 space-y-4 bg-gray-50">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.map((m) => (
            <MessageBubble key={m.id} id={m.id} from={m.from} text={m.text} />
          ))}
          <div id="chat-end" />
        </div>
      </div>

      {/* Bottom Input & Action Bar */}
      <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <input
            className="flex-1 bg-gray-100 border border-gray-300 py-3 px-4 rounded-xl outline-none focus:border-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 text-sm transition shadow-inner"
            placeholder="Type or use voice input..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            disabled={loading}
            aria-label="Chat input"
          />
          <button 
            onClick={onAttach} 
            className="p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition shadow-sm" 
            title="Attach file"
          >
            <Paperclip size={18} />
          </button>
          <input ref={fileRef} type="file" className="hidden" />
          <button 
            onClick={send} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 transition shadow-md active:scale-95" 
            disabled={loading} 
            aria-label="Send"
          >
            <Send size={16} /> <span>{loading ? 'Thinking…' : 'Send'}</span>
          </button>
        </div>
      </div>
    </main>
  )
}
