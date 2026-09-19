'use client';

import React, { useState, useEffect } from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'white';
  animatedEvery10s?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = 'h-10 w-auto',
  variant = 'full',
  animatedEvery10s = false,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [gifKey, setGifKey] = useState<number>(0);

  useEffect(() => {
    if (!animatedEvery10s) return;

    // Trigger the 4.0s GIF animation every 10 seconds
    const interval = setInterval(() => {
      setGifKey(Date.now());
      setIsAnimating(true);

      // Return to crisp static logo after the 4-second GIF sequence completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 4000);
    }, 10000);

    return () => clearInterval(interval);
  }, [animatedEvery10s]);

  const handleMouseEnter = () => {
    if (animatedEvery10s && !isAnimating) {
      setGifKey(Date.now());
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 4000);
    }
  };

  // Image source resolution
  let src = '/brand/amana-logo.png';
  if (variant === 'white') {
    src = '/brand/amana-logo-white.png';
  } else if (animatedEvery10s) {
    src = isAnimating
      ? `/brand/amana-animation.gif?t=${gifKey}`
      : '/brand/amana-logo-aligned.png';
  }

  return (
    <div 
      className="inline-flex items-center justify-center shrink-0 cursor-pointer"
      onMouseEnter={handleMouseEnter}
    >
      <img
        src={src}
        alt="Amana — Vos enfants entre de bonnes mains"
        className={`${className} object-contain select-none`}
        loading="eager"
        style={variant === 'white' ? undefined : { mixBlendMode: 'multiply' }}
      />
    </div>
  );
};
