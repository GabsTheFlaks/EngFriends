import React from 'react';
import { Bell, X } from 'lucide-react';
import { NotificationItem } from '../layout/NotificationsDrawer';

interface PushToastProps {
  toast: NotificationItem | null;
  onClose: () => void;
  onClick: () => void;
  isDarkMode: boolean;
}

export function PushToast({ toast, onClose, onClick, isDarkMode }: PushToastProps) {
  if (!toast) return null;

  return (
    <div
      onClick={onClick}
      className={`absolute top-4 left-4 right-4 z-[999] p-4 rounded-2xl border transition-all duration-300 shadow-2xl cursor-pointer flex gap-3 animate-slide-down ${
        isDarkMode
          ? 'bg-slate-900/95 border-slate-800 text-white backdrop-blur-md'
          : 'bg-white/95 border-slate-200/80 text-slate-800 backdrop-blur-md shadow-lg shadow-slate-200/50'
      }`}
    >
      {/* Glowing pulse ring indicator */}
      <div className="relative shrink-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <Bell size={20} className="animate-wiggle" />
        </div>
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex justify-between items-baseline">
          <span className="text-[9px] font-black uppercase tracking-wider text-blue-500">
            Push Real-time • Eng+
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={`p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <X size={12} />
          </button>
        </div>
        <h4 className="text-xs font-bold leading-none mt-1.5 text-slate-900 dark:text-white truncate">
          {toast.title}
        </h4>
        <p className="text-[10.5px] font-semibold leading-snug mt-1 text-slate-500 dark:text-slate-400">
          {toast.description}
        </p>
      </div>
    </div>
  );
}
