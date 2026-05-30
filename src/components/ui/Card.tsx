import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-white p-6 md:p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] border border-slate-400/60 ${className}`}>
      {children}
    </div>
  );
}
