import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'white';
}

export const Logo: React.FC<LogoProps> = ({ className = 'h-10 w-auto', variant = 'full' }) => {
  if (variant === 'icon') {
    return (
      <svg
        className={className}
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="TataWafa Logo"
      >
        <circle cx="26" cy="26" r="24" fill="#FAF8F5" stroke="#D97757" strokeWidth="2" />
        <path
          d="M18 30C18 22 24 16 32 16C35 16 36.5 17.5 36 20C35.5 22.5 32 23 30 24C25 26 23 30 25 35C26 37.5 24 38.5 22 37C19.5 35 18 32.5 18 30Z"
          fill="#D97757"
          fillOpacity="0.9"
        />
        <circle cx="30" cy="13" r="3.8" fill="#D4A373" />
        <path
          d="M24 27C27 23 33 24 35 29C36 31.5 33.5 35 30 36"
          stroke="#4A6B5B"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 240 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="TataWafa Alger"
    >
      <g transform="translate(4, 6)">
        <circle cx="24" cy="24" r="22" fill="#FAF8F5" stroke="#D97757" strokeWidth="1.8" />
        <path
          d="M16 28C16 20 22 14 30 14C33 14 34.5 15.5 34 18C33.5 20.5 30 21 28 22C23 24 21 28 23 33C24 35.5 22 36.5 20 35C17.5 33 16 30.5 16 28Z"
          fill="#D97757"
          fillOpacity="0.85"
        />
        <circle cx="28" cy="11" r="3.5" fill="#D4A373" />
        <path
          d="M22 25C25 21 31 22 33 27C34 29.5 31.5 33 28 34"
          stroke="#4A6B5B"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
      <text
        x="62"
        y="32"
        fontFamily="'Playfair Display', serif"
        fontSize="24"
        fontWeight="700"
        fill={variant === 'white' ? '#FFFFFF' : '#2B3A4A'}
        letterSpacing="-0.5"
      >
        Tata<tspan fill="#D97757">Wafa</tspan>
      </text>
      <text
        x="63"
        y="46"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontSize="9"
        fontWeight="600"
        fill={variant === 'white' ? '#C6EBD7' : '#4A6B5B'}
        letterSpacing="1.8"
      >
        ALGER • 57 COMMUNES
      </text>
    </svg>
  );
};
