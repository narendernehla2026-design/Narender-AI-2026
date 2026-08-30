'use client';

import React, { useEffect, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceControls({ onTranscript, isListening, setIsListening }) {
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'hi-IN';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onresult = (e) => {
        const text = e.results.transcript;
        if (onTranscript) onTranscript(text);
      };
      setRecognition(rec);
    }
  }, [onTranscript, setIsListening]);

  const toggleVoice = () => {
    if (!recognition) return alert("ब्राउज़र सपोर्टेड नहीं है।");
    isListening ? recognition.stop() : recognition.start();
  };

  return (
    <button
      type="button"
      onClick={toggleVoice}
      className={`p-2.5 rounded-full transition-all active:scale-95 flex items-center justify-center ${
        isListening 
          ? 'bg-rose-600 text-white animate-pulse' 
          : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md'
      }`}
    >
      {isListening ? <MicOff className="w-4 h-4 stroke-[2.5]" /> : <Mic className="w-4 h-4 stroke-[2.5]" />}
    </button>
  );
}
