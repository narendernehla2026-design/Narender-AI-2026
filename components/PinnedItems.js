'use client'

import React from 'react'

export default function PinnedItems() {
  const items = [
    { id: 1, type: 'note', title: 'Meeting notes' },
    { id: 2, type: 'code', title: 'Deploy script snippet' }
  ]
  return (
    <div className="bg-vault-800 p-4 rounded-md">
      <h4 className="font-semibold mb-3">Pinned Items</h4>
      <ul className="space-y-2 text-sm">
        {items.map((it) => (
          <li key={it.id} className="p-2 rounded-md hover:bg-vault-700">
            <div className="flex items-center justify-between">
              <span>{it.title}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
