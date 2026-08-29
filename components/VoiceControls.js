'use client'

import React, { useState, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'

export default function VoiceControls() {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef(null)

  const start = () => {
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!SpeechRecognition) {
      alert('SpeechRecognition not supported in this browser.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.onresult = (e) => {
      let final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript
      }
      setTranscript((t) => (final ? t + ' ' + final : t))
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognition.start()
    recognitionRef.current = recognition
    setListening(true)
  }

  const stop = () => {
    if (recognitionRef.current) recognitionRef.current.stop()
    recognitionRef.current = null
    setListening(false)
  }

  return (
    <div className="flex items-center gap-2">
      {!listening ? (
        <button onClick={start} title="Start voice" className="p-2 rounded-md hover:bg-vault-800">
          <Mic size={18} />
        </button>
      ) : (
        <button onClick={stop} title="Stop voice" className="p-2 rounded-md hover:bg-vault-800">
          <MicOff size={18} />
        </button>
      )}
    </div>
  )
}
