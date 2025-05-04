import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', fullscreen = false }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-2 border-t-transparent border-primaryc ${sizeClasses[size]}`}></div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-backgroundc/80 backdrop-blur-sm z-50">
        <div className="relative w-16 h-16">
          <svg className="animate-spin" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5c1a8c" />
                <stop offset="50%" stopColor="#89239e" />
                <stop offset="100%" stopColor="#2d2969" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="none" stroke="#141414" strokeWidth="8" />
            <path
              d="M50 5 A45 45 0 0 1 95 50"
              fill="none"
              stroke="url(#spinner-gradient)"
              strokeWidth="8"
              strokeLinecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 50 50"
                to="360 50 50"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>
      </div>
    );
  }

  return spinner;
};
  
  