'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceControls({ onTranscript, isListening, setIsListening }) {
  const recognitionRef = useRef(null);
  const transcriptRef = useRef(onTranscript);
  const setListeningRef = useRef(setIsListening);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    transcriptRef.current = onTranscript;
    setListeningRef.current = setIsListening;
  }, [onTranscript, setIsListening]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return undefined;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'hi-IN';
    recognition.onstart = () => setListeningRef.current?.(true);
    recognition.onend = () => setListeningRef.current?.(false);
    recognition.onerror = () => setListeningRef.current?.(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[event.resultIndex]?.[0]?.transcript;
      if (transcript) transcriptRef.current?.(transcript.trim());
    };

    recognitionRef.current = recognition;
    setSupported(true);
    return () => {
      recognition.onresult = null;
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  function toggleVoice() {
    if (!recognitionRef.current) return;
    try {
      if (isListening) recognitionRef.current.stop();
      else recognitionRef.current.start();
    } catch {
      setListeningRef.current?.(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleVoice}
      disabled={!supported}
      aria-label={supported ? (isListening ? 'Stop voice input' : 'Start voice input') : 'Voice input is not supported in this browser'}
      title={supported ? (isListening ? 'Stop voice input' : 'Start voice input') : 'Voice input is not supported in this browser'}
      className={`voice-button ${isListening ? 'listening' : ''}`}
    >
      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
    </button>
  );
}
