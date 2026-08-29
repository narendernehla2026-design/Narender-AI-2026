'use client'

import React from 'react'

export default function MemoryCard() {
  const memory = {
    language: 'English',
    profession: 'Product Designer',
    project: 'Narender AI – Vault'
  }

  return (
    <div className="bg-vault-800 p-4 rounded-md">
      <h4 className="font-semibold mb-2">User Memory</h4>
      <dl className="text-sm text-gray-300 space-y-2">
        <div>
          <dt className="text-xs text-gray-400">Language</dt>
          <dd>{memory.language}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-400">Profession</dt>
          <dd>{memory.profession}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-400">Project</dt>
          <dd>{memory.project}</dd>
        </div>
      </dl>
    </div>
  )
}
