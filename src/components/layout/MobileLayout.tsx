import React from 'react';
import { BottomNav } from './BottomNav';
import { TabType } from '../../types';

interface MobileLayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isDarkMode?: boolean;
}

export function MobileLayout({ children, activeTab, onTabChange, isDarkMode = false }: MobileLayoutProps) {
  return (
    <div className={`h-full transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-eng-ice'} flex justify-center overflow-hidden`}>
      {/* Mobile constrained container */}
      <div className={`w-full max-w-md h-full relative shadow-2xl flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-x border-slate-800' : 'bg-white'}`}>

        {/* Main Content Area - scrollable, leaves space for BottomNav */}
        <main className="flex-1 overflow-y-auto pb-[72px]">
          {children}
        </main>

        {/* Fixed Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={onTabChange} isDarkMode={isDarkMode} />

      </div>
    </div>
  );
}
