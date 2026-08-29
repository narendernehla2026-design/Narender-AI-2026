'use client'

import React, { useState, useEffect, useRef } from 'react';

// HARD-CODED AUTH (change these constants only if you know what you're doing)
const AUTH_PHONE = '+15551234567';
const AUTH_PIN = '123456';

export default function Page() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');

  // Voice state
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Screen preview
  const videoRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    // Persist session in sessionStorage
    const stored = typeof window !== 'undefined' && sessionStorage.getItem('narender_vault_auth');
    if (stored === 'true') setAuthed(true);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    // Simple exact-match check against hard-coded credentials
    if (phone.trim() === AUTH_PHONE && pin === AUTH_PIN) {
      sessionStorage.setItem('narender_vault_auth', 'true');
      setAuthed(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  }

  // Web Speech API (client-side only)
  function startListening() {
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      setError('SpeechRecognition API is not available in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }
      setTranscript((prev) => (final ? prev + ' ' + final : prev));
      // optionally show interim
      if (interim) setTranscript((prev) => prev + ' ' + interim);
    };

    recognition.onerror = (e) => {
      console.error('recognition error', e);
      setError('Speech recognition error: ' + e.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
    setError('');
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  }

  async function startShare() {
    try {
      // request display media for screen preview
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setSharing(true);
      // stop sharing when the track ends
      const tracks = stream.getTracks();
      tracks.forEach((t) => t.addEventListener('ended', () => setSharing(false)));
    } catch (err) {
      console.error('Error sharing screen', err);
      setError('Unable to share screen: ' + (err.message || err));
    }
  }

  function stopShare() {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setSharing(false);
  }

  if (!authed) {
    return (
      <main style={{minHeight: '100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0f172a',color:'#e6eef8',fontFamily:'Inter, system-ui, sans-serif'}}>
        <div style={{width: '360px',padding: '28px',borderRadius: '12px',background:'#071129',boxShadow:'0 6px 24px rgba(2,6,23,0.6)'}}>
          <h1 style={{margin:0,marginBottom:8,fontSize:20}}>Narender AI Vault</h1>
          <p style={{marginTop:0,opacity:0.8}}>Secure login — access restricted.</p>
          <form onSubmit={handleSubmit}>
            <label style={{display:'block',marginTop:12,fontSize:13}}>Authorized Phone</label>
            <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder='+1555...' style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #133554',background:'#021524',color:'#e6eef8'}} />
            <label style={{display:'block',marginTop:12,fontSize:13}}>Secret PIN</label>
            <input value={pin} onChange={(e)=>setPin(e.target.value)} placeholder='PIN' type='password' style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #133554',background:'#021524',color:'#e6eef8'}} />
            <button type='submit' style={{marginTop:16,width:'100%',padding:10,borderRadius:8,background:'#06b6d4',border:'none',color:'#021524',fontWeight:700}}>Unlock Vault</button>
          </form>
          {error && <p style={{color:'#ff7b7b',marginTop:12}}>{error}</p>}
          <p style={{marginTop:12,fontSize:12,opacity:0.7}}>This page uses a hard-coded phone number and PIN for the first-layer lock. Do not use this as production authentication.</p>
        </div>
      </main>
    );
  }

  // Authenticated UI
  return (
    <main style={{minHeight:'100vh',padding:24,background:'#071129',color:'#e6eef8',fontFamily:'Inter, system-ui, sans-serif'}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 style={{margin:0}}>Narender AI Vault</h2>
        <div>
          <button onClick={() => { sessionStorage.removeItem('narender_vault_auth'); setAuthed(false); }} style={{marginRight:8}}>Sign out</button>
        </div>
      </header>

      <section style={{marginTop:20,display:'grid',gridTemplateColumns:'1fr 420px',gap:20}}>
        <div style={{background:'#041025',padding:16,borderRadius:10}}>
          <h3>Live Voice</h3>
          <p style={{marginTop:4,opacity:0.8}}>Use your microphone to speak with the AI (client-only, Web Speech API).</p>
          <div style={{marginTop:12}}>
            {!listening ? (
              <button onClick={startListening} style={{padding:10,borderRadius:8,background:'#06b6d4',border:'none',color:'#021524'}}>Start Listening</button>
            ) : (
              <button onClick={stopListening} style={{padding:10,borderRadius:8,background:'#ef4444',border:'none',color:'#fff'}}>Stop</button>
            )}
          </div>
          <textarea readOnly value={transcript} style={{width:'100%',height:160,marginTop:12,background:'#021524',color:'#e6eef8',padding:12,borderRadius:8}} />
          <div style={{marginTop:8}}>
            <button onClick={()=>{ setTranscript(''); }} style={{padding:8}}>Clear</button>
            <button style={{padding:8,marginLeft:8}} onClick={()=>{ /* placeholder: send transcript to server / AI */ alert('Would send transcript to AI for processing (API integration pending).'); }}>Send to AI</button>
          </div>
        </div>

        <div style={{background:'#041025',padding:16,borderRadius:10}}>
          <h3>Screen Preview</h3>
          <p style={{marginTop:4,opacity:0.8}}>Share your screen so the AI can see outputs and help debug.</p>
          <div style={{marginTop:12}}>
            {!sharing ? (
              <button onClick={startShare} style={{padding:10,borderRadius:8,background:'#06b6d4',border:'none',color:'#021524'}}>Share Screen</button>
            ) : (
              <button onClick={stopShare} style={{padding:10,borderRadius:8,background:'#ef4444',border:'none',color:'#fff'}}>Stop Sharing</button>
            )}
          </div>
          <video ref={videoRef} style={{marginTop:12,width:'100%',height:240,background:'#000',borderRadius:8}} playsInline autoPlay muted />
          <p style={{fontSize:12,opacity:0.75,marginTop:8}}>Screen stream is local to your browser and not uploaded by default. Integrate with backend if you want remote analysis.</p>
        </div>

      </section>

      <section style={{marginTop:20,background:'#041025',padding:16,borderRadius:10}}>
        <h3>Developer & PWA</h3>
        <p style={{opacity:0.8}}>Service worker and manifest are registered to enable PWA install (see app components).</p>
      </section>

    </main>
  );
}
