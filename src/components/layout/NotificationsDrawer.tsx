import React, { useState } from 'react';
import { X, CheckCircle, Bell, Megaphone, MessageSquare, Briefcase, Mail, MailOpen, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../../hooks/useNotifications';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export function NotificationsDrawer({
  isOpen,
  onClose,
  isDarkMode
}: NotificationsDrawerProps) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  // Enriquecendo a categoria baseada no título/corpo da notificação (como um fallback visual)
  const enrichedNotifications = notifications.map(n => {
    let category = 'general';
    const content = (n.title + n.body).toLowerCase();
    if (content.includes('chat') || content.includes('mensagem')) category = 'chat';
    else if (content.includes('acad') || content.includes('nota') || content.includes('aula')) category = 'academic';
    else if (content.includes('projeto') || content.includes('sae')) category = 'project';
    return { ...n, category };
  });

  const filtered = enrichedNotifications.filter((n) => {
    let matchesTab = true;
    if (activeTab === 'unread') matchesTab = !n.read;

    let matchesSearch = true;
    if (searchQuery.trim() !== '') {
      const queryStr = searchQuery.toLowerCase();
      matchesSearch =
        n.title.toLowerCase().includes(queryStr) ||
        n.body.toLowerCase().includes(queryStr);
    }

    return matchesTab && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
  });

  const getGroupHeader = (dateInput: string) => {
    const today = new Date();
    const checkDate = new Date(dateInput);
    const isSameDay = (d1: Date, d2: Date) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(today, checkDate)) return 'Hoje';

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(yesterday, checkDate)) return 'Ontem';

    return 'Anteriores';
  };

  const groups: Record<string, typeof sorted> = { 'Hoje': [], 'Ontem': [], 'Anteriores': [] };
  sorted.forEach(item => {
    const gr = getGroupHeader(item.created_at);
    if (groups[gr]) groups[gr].push(item);
    else groups['Anteriores'].push(item);
  });

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'academic': return { bg: isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-100', icon: Megaphone, name: 'Acadêmico' };
      case 'chat': return { bg: isDarkMode ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-purple-50 text-purple-700 border border-purple-100', icon: MessageSquare, name: 'Chat' };
      case 'project': return { bg: isDarkMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-100', icon: Briefcase, name: 'Projetos' };
      default: return { bg: isDarkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-700 border border-blue-100', icon: Bell, name: 'Geral' };
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      const diffMins = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000);
      if (diffMins < 1) return 'agora mesmo';
      if (diffMins < 60) return `há ${diffMins} min`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `há ${diffHrs}h`;
      return `há ${Math.floor(diffHrs / 24)}d`;
    } catch { return ''; }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-950/80 backdrop-blur-xs flex items-end justify-center z-[130] animate-fade-in">
      <div className={`w-full max-w-md h-[92%] rounded-t-[2.5rem] border-t flex flex-col shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 shrink-0" />

        <div className="px-6 pt-3 pb-3 flex items-center justify-between border-b shrink-0 dark:border-slate-800/60 border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-500">
              <Bell size={18} />
              {notifications.some(n => !n.read) && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>}
            </div>
            <div>
              <h3 className="font-extrabold text-[15px] tracking-tight">Notificações</h3>
              <p className={`text-[10px] font-medium leading-normal ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Integrado ao Supabase Realtime
              </p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'}`}>
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-2.5 pb-3 shrink-0 flex items-center gap-2 border-b dark:border-slate-800/60 border-slate-100">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full rounded-2xl py-1.5 pl-8 pr-7 text-xs font-semibold outline-none border transition-all ${isDarkMode ? 'bg-slate-950 text-white border-slate-800' : 'bg-slate-100/90 text-slate-700 border-slate-200/50'}`} />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')} className={`rounded-2xl py-1.5 px-3 text-xs font-bold outline-none border cursor-pointer select-none transition-all ${isDarkMode ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}>
            <option value="newest">⏰ Novas</option>
            <option value="oldest">⏳ Antigas</option>
          </select>
        </div>

        <div className="px-6 py-2 flex items-center justify-between shrink-0 dark:bg-slate-950/20 bg-slate-50/40 border-b dark:border-slate-800/30 border-slate-100">
          <div className="flex gap-2 text-[11px] font-bold">
            <button onClick={() => setActiveTab('all')} className={`${activeTab === 'all' ? 'text-blue-500' : 'text-slate-500'} cursor-pointer`}>Todas ({notifications.length})</button>
            <button onClick={() => setActiveTab('unread')} className={`${activeTab === 'unread' ? 'text-blue-500' : 'text-slate-500'} cursor-pointer`}>Não lidas ({notifications.filter(n=>!n.read).length})</button>
          </div>
          <button onClick={markAllAsRead} className={`flex items-center gap-1.5 py-1 px-1.5 text-[10.5px] font-extrabold rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-blue-400 hover:bg-slate-850' : 'text-blue-600 hover:bg-blue-50/50'}`}>
            <CheckCircle size={13} /> Marcar lidas
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div initial="hidden" animate="show" className="space-y-4 text-left">
                {Object.entries(groups).map(([groupTitle, groupItems]) => {
                  if (groupItems.length === 0) return null;
                  return (
                    <div key={groupTitle} className="space-y-2">
                      <div className={`text-[10px] font-black uppercase tracking-widest px-1 mt-3 mb-2 flex items-center gap-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span>{groupTitle}</span>
                      </div>
                      <div className="space-y-2">
                        {groupItems.map((item) => {
                          const cap = getCategoryStyles(item.category);
                          const Icon = cap.icon;
                          return (
                            <motion.div key={item.id} layout onClick={() => markAsRead(item.id)} className={`p-3.5 rounded-2xl border transition-all text-left relative flex gap-3 cursor-pointer select-none group/card ${!item.read ? isDarkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-blue-50/20 border-slate-200' : isDarkMode ? 'bg-slate-900/40 border-slate-800/40 opacity-70' : 'bg-white border-slate-100 opacity-70'}`}>
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover/card:scale-105 duration-200 ${cap.bg}`}>
                                <Icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0 pr-6">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className={`text-[9px] font-black uppercase tracking-wider ${!item.read ? 'text-blue-500' : 'text-slate-400'}`}>{cap.name}</span>
                                  <span className={`text-[9px] font-mono shrink-0 font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{getRelativeTime(item.created_at)}</span>
                                </div>
                                <h4 className={`text-xs font-bold leading-normal truncate ${!item.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{item.title}</h4>
                                <p className={`text-[10.5px] leading-snug mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.body}</p>
                              </div>
                              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                <button type="button" onClick={(e) => { e.stopPropagation(); markAsRead(item.id); }} className={`p-1.5 rounded-xl transition-all hover:scale-110 ${isDarkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}>
                                  {item.read ? <MailOpen size={14} className="opacity-40" /> : <Mail size={14} className="text-blue-500" />}
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-center p-6">
                <span className="text-3xl mb-2.5">📭</span>
                <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nenhuma notificação</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
