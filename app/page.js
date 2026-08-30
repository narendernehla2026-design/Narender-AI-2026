'use client';

import React, { useState } from 'react';
import { Send, Paperclip, Mic, MicOff, User, Pin, Settings, Sparkles } from 'lucide-react';
import VoiceControls from '@/components/VoiceControls';

export default function PremiumPWARedesign() {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, role: 'model', text: 'Analyze recent sales data and forecast next quarter\'s trends.' },
    { id: 2, role: 'system', text: 'Analysis complete. Q3 growth projected at 8%. Key drivers: Q4 marketing campaigns, new product launches. Risk: Supply chain volatility.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'model', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'error', text: `त्रुटि: ${data.error || 'कनेक्शन विफल'}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'error', text: 'त्रुटि: नेटवर्क कनेक्शन विफल हुआ।' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans max-w-md mx-auto shadow-2xl relative overflow-hidden">
      <header className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md shadow-blue-200">
            <Sparkles className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-base tracking-tight">AI Control Workshop</h1>
            <p className="text-xs font-bold text-slate-400">नरेन्द्र एआई वॉल्ट</p>
          </div>
        </div>
        <button className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-all text-slate-600">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-36 bg-white">
        <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2">
          <span>⚡ NEW CHAT</span>
        </button>

        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-3 rounded-2xl max-w-[90%] text-sm font-semibold shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : msg.role === 'error'
                  ? 'bg-rose-50 border border-rose-100 text-rose-600 rounded-tl-sm'
                  : 'bg-slate-50 text-slate-800 rounded-tl-sm border border-slate-100 font-medium'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <section className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl p-4 space-y-3 text-white">
          <div className="flex items-center gap-2 pb-1 text-rose-500">
            <Pin className="w-4 h-4 fill-rose-500 stroke-[2.5]" />
            <h2 className="font-extrabold text-xs uppercase tracking-wider text-slate-300">Pinned Items</h2>
          </div>
          <div className="space-y-1 text-xs font-bold text-slate-200">
            <p className="p-2 bg-slate-800/60 rounded-lg">Quarterly Forecast Data (PDF)</p>
            <p className="p-2 bg-slate-800/60 rounded-lg">Market Trend Report (DOCX)</p>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl p-4 space-y-3 text-white">
          <div className="flex items-center gap-2 pb-1 text-blue-400">
            <User className="w-4 h-4 stroke-[2.5]" />
            <h2 className="font-extrabold text-xs uppercase tracking-wider text-slate-300">User Memory</h2>
          </div>
          <div className="space-y-1.5 text-xs font-bold text-slate-400 pl-1">
            <p><span className="text-slate-500">Project:</span> Apex Project</p>
            <p><span className="text-slate-500">Language:</span> Hindi</p>
            <p><span className="text-slate-500">Developer Profile</span></p>
          </div>
        </section>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md p-4 border-t border-slate-100 z-20">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-slate-900 rounded-full p-2 shadow-xl">
          <input 
            type="text" 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask Narender AI..." 
            className="w-full bg-transparent py-2.5 pl-4 pr-2 text-sm font-bold outline-none text-white placeholder-slate-500"
          />
          <VoiceControls 
            onTranscript={(text) => setInputMessage(text)} 
            isListening={isListening} 
            setIsListening={setIsListening} 
          />
          <button 
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full font-extrabold text-xs tracking-wider transition-all flex items-center gap-1 active:scale-95 disabled:opacity-40"
          >
            <span>Send</span>
            <Send className="w-3 h-3 fill-white" />
          </button>
        </form>
      </footer>
    </div>
  );
}
