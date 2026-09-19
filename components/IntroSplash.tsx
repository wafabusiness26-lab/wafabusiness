'use client';

import React, { useState, useEffect, useRef } from 'react';

export function IntroSplash() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dismissedRef = useRef(false);

  const triggerDismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setFading(true);
    setTimeout(() => {
      setVisible(false);
    }, 500);
  };

  useEffect(() => {
    // 1. Attempt immediate video playback
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Even if autoplay is blocked by browser policy, auto-dismiss will still reveal the site
      });
    }

    // 2. Automatic dismiss timer (3.8s: matches animation duration, then fades out smoothly)
    const autoTimer = setTimeout(() => {
      triggerDismiss();
    }, 3800);

    // 3. Fallback absolute safety timer: never stay visible longer than 4.5s under any condition
    const safetyTimer = setTimeout(() => {
      setVisible(false);
    }, 4500);

    // 4. Dismiss on any keypress (Esc, Space, Enter, etc.)
    const handleKeyDown = () => {
      triggerDismiss();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(autoTimer);
      clearTimeout(safetyTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-white flex items-center justify-center cursor-pointer transition-opacity duration-500 select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={triggerDismiss}
      role="dialog"
      aria-label="Introduction Amana"
    >
      {/* 1080p Video with multiply blend mode: 100% seamless white blend, zero box borders */}
      <div className="w-full max-w-4xl px-4 sm:px-6 flex items-center justify-center pointer-events-none">
        <video
          ref={videoRef}
          src="/brand/amana-intro-1080p.mp4"
          autoPlay
          muted
          playsInline
          onEnded={triggerDismiss}
          disableRemotePlayback
          className="w-full h-auto max-h-[85vh] object-contain pointer-events-none"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>
    </div>
  );
}
