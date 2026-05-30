import React from 'react';

export function AppLogo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <img 
      src="/unespar_logo.png" 
      alt="Logo UNESPAR" 
      className={`${className} object-contain`}
    />
  );
}

