"use client";
import React, { useEffect, useRef, useState } from 'react';

export default function VoiceVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [listening, setListening] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioCtx = audioCtxRef.current;
      analyserRef.current = audioCtx.createAnalyser();
      analyserRef.current.fftSize = 2048;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      sourceRef.current = audioCtx.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      setListening(true);
      draw();
    } catch (err) {
      console.warn('Microphone access denied or unavailable', err);
    }
  }

  function stop() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    dataArrayRef.current = null;
    sourceRef.current = null;
    setListening(false);
  }

  function draw() {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    if (!canvas || !analyser || !dataArray) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#7c3aed';

    ctx.beginPath();
    const sliceWidth = (WIDTH * 1.0) / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * HEIGHT) / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.lineTo(WIDTH, HEIGHT / 2);
    ctx.stroke();

    rafRef.current = requestAnimationFrame(draw);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <canvas ref={canvasRef} width={320} height={80} style={{ borderRadius: 8, background: 'linear-gradient(90deg, rgba(255,255,255,0.01), rgba(255,255,255,0.015))' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => { if (!listening) start(); else stop(); }} style={{ padding: 8, borderRadius: 8, background: listening ? '#ef4444' : '#3b82f6', border: 'none', color: '#fff' }}>{listening ? 'Stop' : 'Start Mic'}</button>
        <div style={{ color: '#cfe9ff', fontSize: 13, alignSelf: 'center' }}>{listening ? 'Listening...' : 'Tap to start voice input'}</div>
      </div>
    </div>
  );
}
