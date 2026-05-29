import React, { useState, useRef, useEffect } from 'react'
import { Bell, Inbox } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { motion, AnimatePresence } from 'motion/react'

interface NotificationBellProps {
  isDarkMode?: boolean
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ isDarkMode = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      if (diffMins < 1) return 'agora mesmo'
      if (diffMins < 60) return `há ${diffMins} min`
      const diffHrs = Math.floor(diffMins / 60)
      if (diffHrs < 24) return `há ${diffHrs}h`
      const diffDays = Math.floor(diffHrs / 24)
      return `há ${diffDays}d`
    } catch {
      return ''
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer hover:scale-115 active:scale-95 relative p-2 rounded-xl transition-all duration-200 ${
          isDarkMode
            ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-100 shadow-sm'
        }`}
        title="Abrir Notificações"
        aria-label="Abrir Notificações"
      >
        <Bell size={18} className={unreadCount > 0 ? 'animate-wiggle' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border border-white text-[8px] font-black text-white flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 mt-3.5 w-72 rounded-2xl border p-1 shadow-2xl z-[999] text-left overflow-hidden ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-white shadow-slate-950/80'
                : 'bg-white border-slate-200/80 text-slate-800 shadow-slate-205/40'
            }`}
          >
            {/* Header */}
            <div className={`px-4 py-3 flex items-center justify-between border-b ${
              isDarkMode ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <h3 className="font-extrabold text-[11.5px] uppercase tracking-wider text-blue-500">Notificações</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className={`text-[9px] font-black uppercase cursor-pointer hover:underline transition-colors ${
                    isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Ler todas
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto no-scrollbar py-1">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => {
                      if (!notif.read) markAsRead(notif.id)
                    }}
                    className={`w-full text-left px-4 py-3 border-b transition-colors flex gap-2.5 items-start ${
                      isDarkMode
                        ? 'border-slate-800/40 hover:bg-slate-850'
                        : 'border-slate-100 hover:bg-slate-50'
                    } ${
                      !notif.read
                        ? isDarkMode
                          ? 'bg-slate-850/50'
                          : 'bg-blue-50/20 font-semibold'
                        : 'opacity-70'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className={`text-xs font-black truncate leading-none ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          {notif.title}
                        </h4>
                        <span className={`text-[8.5px] font-mono shrink-0 font-medium ${
                          isDarkMode ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {getRelativeTime(notif.created_at)}
                        </span>
                      </div>
                      <p className={`text-[10.5px] leading-snug mt-1 break-words font-medium ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {notif.body}
                      </p>
                    </div>

                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0"></span>
                    )}
                  </button>
                ))
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <Inbox className={`mb-2 ${isDarkMode ? 'text-slate-700' : 'text-slate-300'}`} size={24} />
                  <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Nenhuma notificação
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
