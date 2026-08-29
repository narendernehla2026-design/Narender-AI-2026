'use client'

import React, { useRef, useState } from 'react'
import { Monitor, StopCircle } from 'lucide-react'

export default function ScreenPreview() {
  const [sharing, setSharing] = useState(false)
  const videoRef = useRef(null)

  const startShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
      setSharing(true)
      stream.getTracks().forEach((t) => t.addEventListener('ended', () => setSharing(false)))
    } catch (e) {
      alert('Unable to start screen sharing: ' + (e.message || e))
    }
  }

  const stopShare = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      stream.getTracks().forEach((t) => t.stop())
      videoRef.current.srcObject = null
    }
    setSharing(false)
  }

  return (
    <div className="flex items-center gap-2">
      {!sharing ? (
        <button onClick={startShare} title="Share Screen" className="p-2 rounded-md hover:bg-vault-800">
          <Monitor size={18} />
        </button>
      ) : (
        <button onClick={stopShare} title="Stop Sharing" className="p-2 rounded-md hover:bg-vault-800">
          <StopCircle size={18} />
        </button>
      )}
      <video ref={videoRef} className="sr-only" playsInline muted />
    </div>
  )
}
