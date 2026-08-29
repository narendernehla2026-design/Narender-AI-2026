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
  const fileRef = useRef(null)

  const send = () => {
    if (!input.trim()) return
    setMessages((m) => [...m, { id: Date.now(), from: 'user', text: input }])
    setInput('')
    setTimeout(() => {
      setMessages((m) => [...m, { id: Date.now() + 1, from: 'ai', text: 'Acknowledged — I will help with that.' }])
    }, 700)
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
            <MessageBubble key={m.id} {...m} />
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 bg-vault-900 p-4 border-t border-vault-800">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <input
            className="flex-1 bg-vault-800 py-2 px-3 rounded-md outline-none"
            placeholder="Type or use voice input..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send() }}
          />
          <button onClick={onAttach} className="p-2 rounded-md hover:bg-vault-800">
            <Paperclip size={18} />
          </button>
          <input ref={fileRef} type="file" className="hidden" />
          <button onClick={send} className="bg-accent text-[#021524] px-3 py-2 rounded-md flex items-center gap-2">
            <Send size={16} /> Send
          </button>
        </div>
      </div>
    </main>
  )
}
