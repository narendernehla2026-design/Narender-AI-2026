'use client'

import React, { useState } from 'react'
import LeftSidebar from '../components/LeftSidebar'
import ChatArea from '../components/ChatArea'
import RightSidebar from '../components/RightSidebar'

export default function Page() {
  const [activeChatId, setActiveChatId] = useState('chat-1')
  const [chats, setChats] = useState([
    { id: 'chat-1', title: 'Project kickoff' },
    { id: 'chat-2', title: 'Debugging session' }
  ])

  const createNewChat = () => {
    const id = `chat-${Date.now()}`
    const newChat = { id, title: 'New chat' }
    setChats((s) => [newChat, ...s])
    setActiveChatId(id)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[280px_1fr_340px]">
      <LeftSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelect={(id) => setActiveChatId(id)}
        onNewChat={createNewChat}
      />
      <ChatArea activeChatId={activeChatId} />
      <RightSidebar />
    </div>
  )
}
