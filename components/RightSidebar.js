'use client'

import React from 'react'
import MemoryCard from './MemoryCard'
import PinnedItems from './PinnedItems'

export default function RightSidebar() {
  return (
    <aside className="hidden xl:flex flex-col bg-vault-900 p-4 min-h-screen border-l border-vault-800">
      <MemoryCard />
      <div className="mt-6">
        <PinnedItems />
      </div>
    </aside>
  )
}
