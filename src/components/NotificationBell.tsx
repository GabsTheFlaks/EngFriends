import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationBell({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Agora';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-colors ${
          isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
        }`}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-slate-900">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl shadow-xl border z-50 animate-fade-in ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className={`sticky top-0 z-10 flex justify-between items-center p-3 border-b backdrop-blur-md ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-100'
          }`}>
            <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Notificações</h3>
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  markAllAsRead();
                  setIsOpen(false);
                }}
                className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md transition-colors ${
                  isDarkMode ? 'text-blue-400 hover:bg-slate-800' : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <CheckCircle size={14} /> Marcar todas
              </button>
            )}
          </div>

          <div className="p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className={`py-8 text-center text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => {
                    markAsRead(notif.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    !notif.read
                      ? (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50/50')
                      : (isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50')
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-semibold text-sm ${
                      !notif.read ? (isDarkMode ? 'text-blue-400' : 'text-blue-700') : (isDarkMode ? 'text-slate-300' : 'text-slate-700')
                    }`}>
                      {notif.title}
                    </span>
                    <span className={`text-[10px] whitespace-nowrap ml-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {timeAgo(notif.created_at)}
                    </span>
                  </div>
                  <p className={`text-xs line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {notif.body}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
