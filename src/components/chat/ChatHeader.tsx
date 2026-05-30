import React, { useState } from 'react';
import { ChevronLeft, Pin, BellOff, MoreVertical, Trash2, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatHeaderProps {
  activeChatData: { id: string; name: string; type: string };
  isDarkMode: boolean;
  isPinned: boolean;
  isMuted: boolean;
  onBack: () => void;
  onTogglePin: () => void;
  onToggleMute: () => void;
  onClearChat: () => Promise<void>;
  onLeaveChat: () => Promise<void>;
}

export function ChatHeader({
  activeChatData,
  isDarkMode,
  isPinned,
  isMuted,
  onBack,
  onTogglePin,
  onToggleMute,
  onClearChat,
  onLeaveChat
}: ChatHeaderProps) {
  const [showChatOptions, setShowChatOptions] = useState(false);

  // Aesthetic mapping helper for channels
  const getRoomStyles = (roomName: string) => {
    const name = roomName.toLowerCase();
    if (name.includes('alunos')) return { color: 'bg-gradient-to-tr from-blue-600 to-indigo-600', initials: 'AE' };
    if (name.includes('estruturas')) return { color: 'bg-gradient-to-tr from-slate-700 to-slate-900', initials: 'E' };
    if (name.includes('calculo')) return { color: 'bg-gradient-to-tr from-purple-500 to-indigo-500', initials: 'C' };
    if (name.includes('projetos') || name.includes('projeto')) return { color: 'bg-gradient-to-tr from-orange-500 to-amber-600', initials: 'P' };
    return { color: 'bg-gradient-to-tr from-emerald-500 to-teal-600', initials: roomName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() };
  };

  const styles = getRoomStyles(activeChatData.name);

  return (
    <div className={`px-4 pt-11 pb-3 flex items-center justify-between border-b shrink-0 z-10 ${isDarkMode ? 'bg-slate-900/90 border-slate-800/80 backdrop-blur-md' : 'bg-white/95 border-slate-200/60 backdrop-blur-sm shadow-xs'}`}>
      <div className="flex items-center gap-2.5">
        <button
          onClick={onBack}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-655 hover:text-slate-950 hover:bg-slate-100'}`}
        >
          <ChevronLeft size={22} />
        </button>

        <div className={`w-10 h-10 rounded-2xl ${styles.color} flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-md shadow-blue-500/10`}>
          {styles.initials}
        </div>

        <div className="text-left">
          <div className="flex items-center gap-1">
            <h1 className={`text-xs font-black tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-805'}`}>
              {activeChatData.name}
            </h1>
            {isPinned && (
              <Pin size={10} className="text-blue-550 dark:text-blue-400 rotate-45 fill-current shrink-0" />
            )}
            {isMuted && (
              <BellOff size={10} className="text-slate-450 dark:text-slate-550 shrink-0" />
            )}
          </div>
          <p className={`text-[9.5px] font-bold mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {activeChatData.type === 'channel' ? 'Canal de Engenharia' : 'Mensagens diretas'}
          </p>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowChatOptions(!showChatOptions)}
          aria-label="Opções do canal"
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            showChatOptions
              ? isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-105 text-slate-950'
              : isDarkMode ? 'text-slate-405 hover:text-white hover:bg-slate-800' : 'text-slate-555 hover:text-slate-805 hover:bg-slate-100'
          }`}
        >
          <MoreVertical size={18} />
        </button>

        {/* Options popover */}
        <AnimatePresence>
          {showChatOptions && (
            <>
              <div className="fixed inset-0 z-[110]" onClick={() => setShowChatOptions(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className={`absolute right-0 mt-2 w-48 rounded-2xl border p-1 rounded-t-lg shadow-xl z-[120] text-left ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-white shadow-slate-950/80'
                    : 'bg-white border-slate-200/80 text-slate-800 shadow-slate-205/40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => { onTogglePin(); setShowChatOptions(false); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent text-left cursor-pointer`}
                >
                  <Pin size={13} className={isPinned ? "text-blue-500 fill-current" : ""} />
                  {isPinned ? 'Desafixar topo' : 'Fixar no topo'}
                </button>

                <button
                  type="button"
                  onClick={() => { onToggleMute(); setShowChatOptions(false); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent text-left cursor-pointer`}
                >
                  <BellOff size={13} className={isMuted ? "text-amber-500" : ""} />
                  {isMuted ? 'Ativar notificações' : 'Silenciar canal'}
                </button>

                <div className="border-t dark:border-slate-800 my-1" />

                <button
                  type="button"
                  onClick={() => { onClearChat(); setShowChatOptions(false); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 hover:text-red-650 cursor-pointer`}
                >
                  <Trash2 size={13} />
                  Limpar conversa
                </button>

                <button
                  type="button"
                  onClick={() => { onLeaveChat(); setShowChatOptions(false); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 hover:text-red-650 cursor-pointer`}
                >
                  <LogOut size={13} />
                  Excluir canal
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
