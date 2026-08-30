'use client'

import React, { useRef, useState } from 'react'
import { Monitor, StopCircle } from 'lucide-react'

export default function ScreenPreview() {
  const [sharing, setSharing] = useState(false)
  const videoRef = useRef(null)

  const startShare = async () => {
    try {
      if (!('mediaDevices' in navigator) || typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
        alert('Screen sharing is not supported on this device or browser.')
        return
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
      setSharing(true)
      stream.getTracks().forEach((t) => t.addEventListener('ended', () => setSharing(false)))
    } catch (e) {
      console.error('Unable to start screen sharing', e)
      alert('Unable to start screen sharing: ' + (e?.message || e))
    }
  }

  const stopShare = () => {
    try {
      const srcObj = videoRef.current?.srcObject
      if (srcObj) {
        const stream = srcObj
        if (stream.getTracks) stream.getTracks().forEach((t) => t.stop())
        if (videoRef.current) videoRef.current.srcObject = null
      }
    } catch (e) {
      console.error('Error stopping share', e)
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {!sharing ? (
        <button onClick={startShare} title="Share Screen" className="p-2 rounded-md hover:bg-vault-800 text-white">
          <Monitor size={18} />
        </button>
      ) : (
        <button onClick={stopShare} title="Stop Sharing" className="p-2 rounded-md hover:bg-vault-800 text-white">
          <StopCircle size={18} />
        </button>
      )}
      <video ref={videoRef} className="sr-only" playsInline muted />
    </div>
  )
}
