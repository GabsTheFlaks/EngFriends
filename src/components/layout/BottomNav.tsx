import React from 'react';
import { MessageCircle, Info, Lightbulb, Settings, HelpCircle } from 'lucide-react';
import { TabType } from '../../types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isDarkMode?: boolean;
}

export function BottomNav({ activeTab, onTabChange, isDarkMode = false }: BottomNavProps) {
  const navItems = [
    { id: 'chat', label: 'CHAT', icon: MessageCircle },
    { id: 'info', label: 'INFOS', icon: Info },
    { id: 'proj', label: 'PROJ', icon: Lightbulb },
    { id: 'sist', label: 'SIST', icon: Settings },
    { id: 'ajuda', label: 'AJUDA', icon: HelpCircle },
  ] as const;

  return (
    <div className={`absolute bottom-0 left-0 w-full border-t flex justify-between px-2 py-2 pb-safe transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`} style={{ height: '72px' }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center w-full min-w-[64px] h-full rounded-xl transition-all cursor-pointer ${
              isActive
                ? isDarkMode ? 'text-blue-400' : 'text-eng-blue'
                : isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`flex items-center justify-center p-1 rounded-full mb-1 transition-colors ${
              isActive
                ? isDarkMode ? 'bg-slate-800' : 'bg-blue-50'
                : ''
            }`}>
              <Icon size={22} className={isActive ? isDarkMode ? 'fill-blue-400/25' : 'fill-blue-100/50' : ''} />
            </div>
            <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
