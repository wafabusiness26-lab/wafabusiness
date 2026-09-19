'use client';

import React, { useState, useEffect, useRef } from 'react';

export function IntroSplash() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFinish = () => {
    if (fading) return;
    setFading(true);
    setTimeout(() => {
      setVisible(false);
    }, 600); // 600ms smooth fade transition
  };

  useEffect(() => {
    // Attempt playback immediately
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn('Intro video autoplay notice:', err);
      });
    }

    // Safety timeout in case video stalls or autoplay is blocked (5.5 seconds)
    const timer = setTimeout(() => {
      handleFinish();
    }, 5500);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center transition-opacity duration-700 select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={handleFinish}
      role="dialog"
      aria-label="Introduction Amana"
    >
      {/* Top Skip Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleFinish();
        }}
        className="absolute top-5 right-5 sm:top-8 sm:right-8 z-20 px-4 py-2 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-700 text-xs font-bold tracking-wide shadow-xs border border-slate-200/80 transition flex items-center gap-1.5 cursor-pointer"
        aria-label="Passer l'introduction"
      >
        <span>Passer</span>
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </button>

      {/* Centered 1080p Video Container on pure white */}
      <div className="w-full max-w-4xl px-4 sm:px-6 flex items-center justify-center">
        <video
          ref={videoRef}
          src="/brand/amana-intro-1080p.mp4"
          autoPlay
          muted
          playsInline
          onEnded={handleFinish}
          className="w-full h-auto max-h-[85vh] object-contain"
        />
      </div>
    </div>
  );
}
