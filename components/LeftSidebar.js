'use client'

import React from 'react'
import { Plus, Settings, User, Clock } from 'lucide-react'

export default function LeftSidebar({ chats, activeChatId, onSelect, onNewChat }) {
  return (
    <aside className="hidden lg:flex flex-col bg-white text-gray-900 p-4 border-r border-gray-200 min-h-screen shadow-sm">
      {/* Top Brand / Title Section */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-wide">Narender AI</h1>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Vault</p>
        </div>
        <div className="rounded-full bg-gray-100 p-2.5 text-gray-700 shadow-sm border border-gray-200">
          <User size={18} />
        </div>
      </div>

      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition shadow-md active:scale-95 mb-6"
      >
        <Plus size={18} /> <span>New Chat</span>
      </button>

      {/* Recent Chats Section */}
      <div className="flex-1 overflow-auto pr-1">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Recent Chats</h4>
        <ul className="space-y-1.5">
          {chats.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => onSelect(c.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition text-sm font-medium ${
                  c.id === activeChatId 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{c.title}</span>
                  <Clock size={14} className="text-gray-400 shrink-0 ml-2" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom User Profile & Settings */}
      <div className="mt-4 pt-4 border-t border-gray-200 px-2">
        <div className="flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-800 truncate">Narender</p>
            <p className="text-xs text-gray-500 truncate">Designer · AI</p>
          </div>
          <button className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition shadow-sm" title="Settings">
            <Settings size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
