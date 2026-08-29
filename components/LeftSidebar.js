'use client'

import React from 'react'
import { Plus, Settings, User, Clock } from 'lucide-react'

export default function LeftSidebar({ chats, activeChatId, onSelect, onNewChat }) {
  return (
    <aside className="hidden lg:flex flex-col bg-vault-900 p-4 border-r border-vault-800 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">Narender AI</h1>
          <p className="text-sm text-gray-400">Vault</p>
        </div>
        <div className="rounded-full bg-vault-800 p-2">
          <User size={18} />
        </div>
      </div>

      <button
        onClick={onNewChat}
        className="flex items-center gap-2 bg-accent text-[#021524] px-3 py-2 rounded-md font-medium"
      >
        <Plus size={16} /> New Chat
      </button>

      <div className="mt-6 flex-1 overflow-auto">
        <h4 className="text-sm text-gray-400 mb-2">Recent Chats</h4>
        <ul className="space-y-2">
          {chats.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => onSelect(c.id)}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  c.id === activeChatId ? 'bg-[#062c3a]' : 'hover:bg-vault-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{c.title}</span>
                  <Clock size={14} className="text-gray-400" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 pt-4 border-t border-vault-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Narender</p>
            <p className="text-xs text-gray-400">Designer · AI</p>
          </div>
          <button className="p-2 rounded-md hover:bg-vault-800">
            <Settings size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
