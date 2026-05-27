import React from 'react';
import { Card } from '../ui/Card';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-eng-ice flex flex-col">
      {/* Top Header Bar */}
      <header className="w-full bg-white h-16 flex items-center justify-between px-6 md:px-8 border-b border-gray-200 shrink-0">
        <span className="font-bold text-eng-blue tracking-tighter text-sm uppercase">ENG FRIENDS</span>
      </header>

      {/* Centered Content Area */}
      <div className="flex-1 flex flex-col items-center pt-16 md:pt-24 px-4 pb-12">
        <div className="w-full max-w-md">
          <Card>
            {children}
          </Card>
        </div>
      </div>
    </div>
  );
}
