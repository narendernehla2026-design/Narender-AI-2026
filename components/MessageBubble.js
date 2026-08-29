'use client'

import React from 'react'

export default function MessageBubble({ from, text }) {
  const isAI = from === 'ai'
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`bubble ${isAI ? 'bg-[#0b2a35] text-gray-200' : 'bg-[#0d6a6f] text-[#021524]'}`}>
        <div className="text-sm">{text}</div>
      </div>
    </div>
  )
}
