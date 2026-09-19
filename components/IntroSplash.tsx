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
    }, 500); // 500ms smooth fade transition
  };

  useEffect(() => {
    // Attempt playback immediately
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn('Intro video notice:', err);
      });
    }

    // Automatic progression: video is 4.0s. Fade begins at 3.6s and unmounts cleanly at 4.1s
    const autoTimer = setTimeout(() => {
      handleFinish();
    }, 3600);

    return () => clearTimeout(autoTimer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-white flex items-center justify-center cursor-pointer transition-opacity duration-500 select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={handleFinish}
      role="dialog"
      aria-label="Introduction Amana"
      style={{
        animation: 'amanaSplashFade 4.2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      }}
    >
      <style>{`
        @keyframes amanaSplashFade {
          0% { opacity: 1; visibility: visible; }
          82% { opacity: 1; visibility: visible; }
          95% { opacity: 0; visibility: visible; }
          100% { opacity: 0; visibility: hidden; pointer-events: none; }
        }
      `}</style>

      {/* Centered 1080p Video on seamless pure white (no rectangle, no borders) */}
      <div className="w-full max-w-4xl px-4 sm:px-6 flex items-center justify-center">
        <video
          ref={videoRef}
          src="/brand/amana-intro-1080p.mp4"
          autoPlay
          muted
          playsInline
          controls={false}
          disablePictureInPicture
          // @ts-ignore
          disableRemotePlayback
          onEnded={handleFinish}
          className="w-full h-auto max-h-[85vh] object-contain pointer-events-none"
        />
      </div>
    </div>
  );
}
