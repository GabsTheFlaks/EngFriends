import React, { useState } from 'react';
import { X, Trash2, CheckCircle, Bell, Megaphone, MessageSquare, Briefcase, Sparkles, Send, Mail, MailOpen, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  category: 'academic' | 'chat' | 'project' | 'general';
  timestamp: Date;
}

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onToggleRead: (id: string) => void;
  onTriggerTestPush: () => void;
  isDarkMode: boolean;
  isPeriodicPushEnabled: boolean;
  onTogglePeriodicPush: () => void;
}

export function NotificationsDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onToggleRead,
  onTriggerTestPush,
  isDarkMode,
  isPeriodicPushEnabled,
  onTogglePeriodicPush
}: NotificationsDrawerProps) {
  // Enhanced filtering schema
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'academic' | 'chat' | 'project' | 'general'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  if (!isOpen) return null;

  // Filter logic based on tab as well as keyword search
  const filtered = notifications.filter((n) => {
    // Tab filter
    let matchesTab = true;
    if (activeTab === 'unread') matchesTab = !n.read;
    else if (activeTab !== 'all') matchesTab = n.category === activeTab;

    // Search query filter (title or description keywords)
    let matchesSearch = true;
    if (searchQuery.trim() !== '') {
      const queryStr = searchQuery.toLowerCase();
      matchesSearch =
        n.title.toLowerCase().includes(queryStr) ||
        n.description.toLowerCase().includes(queryStr);
    }

    return matchesTab && matchesSearch;
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
    const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
    return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
  });

  // Helper to categorize a timestamp into groups: 'Hoje' (Today), 'Ontem' (Yesterday) or 'Anteriores' (Earlier)
  const getGroupHeader = (dateInput: Date) => {
    const today = new Date();
    const checkDate = dateInput instanceof Date ? dateInput : new Date(dateInput);

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(today, checkDate)) {
      return 'Hoje';
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(yesterday, checkDate)) {
      return 'Ontem';
    }

    return 'Anteriores';
  };

  // Build grouped listings (preserving sorted layout)
  const groups: Record<string, typeof sorted> = {
    'Hoje': [],
    'Ontem': [],
    'Anteriores': []
  };

  sorted.forEach(item => {
    const gr = getGroupHeader(item.timestamp);
    if (groups[gr]) {
      groups[gr].push(item);
    } else {
      groups['Anteriores'].push(item);
    }
  });

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'academic':
        return {
          bg: isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-55 text-emerald-700 border border-emerald-100',
          icon: Megaphone,
          name: 'Acadêmico'
        };
      case 'chat':
        return {
          bg: isDarkMode ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-purple-55 text-purple-700 border border-purple-100',
          icon: MessageSquare,
          name: 'Membros / Chat'
        };
      case 'project':
        return {
          bg: isDarkMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-55 text-amber-700 border border-amber-100',
          icon: Briefcase,
          name: 'Projetos / SAE'
        };
      default:
        return {
          bg: isDarkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-55 text-blue-700 border border-blue-100',
          icon: Bell,
          name: 'Geral'
        };
    }
  };

  const categoryFilters = [
    { id: 'all', label: 'Todas', emoji: '📂', count: notifications.length },
    { id: 'unread', label: 'Não lidas', emoji: '✉️', count: notifications.filter(n => !n.read).length },
    { id: 'academic', label: 'Acadêmico', emoji: '📢', count: notifications.filter(n => n.category === 'academic').length },
    { id: 'chat', label: 'Chat', emoji: '💬', count: notifications.filter(n => n.category === 'chat').length },
    { id: 'project', label: 'Projetos', emoji: '💼', count: notifications.filter(n => n.category === 'project').length },
    { id: 'general', label: 'Geral', emoji: '✨', count: notifications.filter(n => n.category === 'general').length },
  ] as const;

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.97 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 350, damping: 28 }
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-950/80 backdrop-blur-xs flex items-end justify-center z-[130] animate-fade-in">
      {/* Sliding Dialog Wrapper */}
      <div className={`w-full max-w-md h-[92%] rounded-t-[2.5rem] border-t flex flex-col transition-all duration-300 shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>

        {/* Decorative Handle Indicator */}
        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 shrink-0" />

        {/* Header Section */}
        <div className="px-6 pt-3 pb-3 flex items-center justify-between border-b shrink-0 dark:border-slate-800/60 border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-500">
              <Bell size={18} className="animate-pulse" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-[15px] tracking-tight">Painel de Notificações</h3>
              <p className={`text-[10px] font-medium leading-normal ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Acompanhe atualizações em tempo real
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'}`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search & Sort Panel */}
        <div className="px-6 py-2.5 pb-3 shrink-0 flex items-center gap-2 border-b dark:border-slate-800/60 border-slate-100">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por palavra-chave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-2xl py-1.5 pl-8 pr-7 text-xs font-semibold outline-none border transition-all ${
                isDarkMode
                  ? 'bg-slate-950 text-white placeholder-slate-550 border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10'
                  : 'bg-slate-100/90 text-slate-705 placeholder-slate-405 border border-slate-200/50 focus:bg-white focus:border-blue-400'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-705 dark:hover:text-white"
              >
                <X size={11} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className={`rounded-2xl py-1.5 px-3 text-xs font-bold outline-none border cursor-pointer select-none transition-all ${
                isDarkMode
                  ? 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 focus:border-blue-500'
                  : 'bg-white text-slate-655 border-slate-200 hover:bg-slate-50 focus:border-blue-400'
              }`}
            >
              <option value="newest">⏰ Novas</option>
              <option value="oldest">⏳ Antigas</option>
            </select>
          </div>
        </div>

        {/* Categories Horizontal Tabs Row */}
        <div className="px-6 py-2.5 border-b shrink-0 dark:border-slate-800/40 border-slate-50 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 pb-1">
            {categoryFilters.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10.5px] font-bold tracking-tight transition-all cursor-pointer whitespace-nowrap border ${
                    isActive
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-550/20'
                      : isDarkMode
                        ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                        : 'bg-slate-100 border-slate-200/55 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold font-mono leading-none ${isActive ? 'bg-white/25 text-white' : isDarkMode ? 'bg-slate-800 text-slate-450' : 'bg-slate-200 text-slate-500'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Tool Header (Actions) */}
        <div className="px-6 py-2 flex items-center justify-between shrink-0 dark:bg-slate-950/20 bg-slate-50/40 border-b dark:border-slate-800/30 border-slate-100">
          <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Exibindo {filtered.length} de {notifications.length} itens
          </span>

          <div className="flex gap-3 text-[10.5px] font-extrabold">
            <button
              onClick={onMarkAllAsRead}
              className={`flex items-center gap-1.5 py-1 px-1.5 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-blue-400 hover:bg-slate-850' : 'text-blue-600 hover:bg-blue-50/50'}`}
              title="Marcar todas como lidas"
            >
              <CheckCircle size={13} /> Marcar todas
            </button>
            <button
              onClick={onClearAll}
              className={`flex items-center gap-1.5 py-1 px-1.5 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-red-400 hover:bg-slate-850' : 'text-red-500 hover:bg-red-50/50'}`}
              title="Limpar histórico"
            >
              <Trash2 size={13} /> Limpar tudo
            </button>
          </div>
        </div>

        {/* Notifications list with Stagger animation */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-4 text-left"
              >
                {Object.entries(groups).map(([groupTitle, groupItems]) => {
                  if (groupItems.length === 0) return null;
                  return (
                    <div key={groupTitle} className="space-y-2">
                      {/* Section Header */}
                      <div className={`text-[10px] font-make font-black uppercase tracking-widest px-1 mt-3 mb-2 flex items-center gap-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span>{groupTitle === 'Hoje' ? '📅 Hoje' : groupTitle === 'Ontem' ? '⏳ Ontem' : '🗂️ Anteriores'}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="text-[9px] font-mono normal-case text-slate-450 dark:text-slate-500">
                          {groupItems.length} {groupItems.length === 1 ? 'notificação' : 'notificações'}
                        </span>
                      </div>

                      {/* Items loop */}
                      <div className="space-y-2">
                        {groupItems.map((item) => {
                          const cap = getCategoryStyles(item.category);
                          const Icon = cap.icon;
                          return (
                            <motion.div
                              key={item.id}
                              variants={itemVariants}
                              layout
                              onClick={() => onToggleRead(item.id)}
                              className={`p-3.5 rounded-2xl border transition-all duration-250 text-left relative flex gap-3 cursor-pointer select-none group/card ${
                                !item.read
                                  ? isDarkMode
                                    ? 'bg-slate-950/90 border-slate-800 hover:border-slate-700/80 shadow-sm'
                                    : 'bg-blue-50/20 border-slate-150 hover:border-slate-200 shadow-xs'
                                  : isDarkMode
                                    ? 'bg-slate-900/40 border-slate-800/40 opacity-65 hover:opacity-100 hover:border-slate-800/85'
                                    : 'bg-white border-slate-100 opacity-65 hover:opacity-100 hover:shadow-xs'
                              }`}
                            >
                              {/* Left Side Styled Icon Panel */}
                              <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center transition-transform group-hover/card:scale-105 duration-200 ${cap.bg}`}>
                                <Icon size={16} />
                              </div>

                              {/* Middle Right Information */}
                              <div className="flex-1 min-w-0 pr-6">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className={`text-[9px] font-black uppercase tracking-wider ${!item.read ? 'text-blue-500' : 'text-slate-400'}`}>
                                    {cap.name}
                                  </span>
                                  <span className={`text-[9px] font-mono shrink-0 font-medium ${isDarkMode ? 'text-slate-550' : 'text-slate-400'}`}>
                                    {item.time}
                                  </span>
                                </div>
                                <h4 className={`text-xs font-bold leading-normal truncate ${!item.read ? 'text-slate-900 dark:text-white font-extrabold' : isDarkMode ? 'text-slate-350 font-semibold' : 'text-slate-700 font-semibold'}`}>
                                  {item.title}
                                </h4>
                                <p className={`text-[10.5px] leading-snug mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-505'}`}>
                                  {item.description}
                                </p>
                              </div>

                              {/* Right Action Trigger Icons (Mark As Read/Unread) */}
                              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center z-10">
                                {/* Bullet / Toggle Indicator Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleRead(item.id);
                                  }}
                                  className={`p-1.5 rounded-xl transition-all hover:scale-110 active:scale-90 ${
                                    isDarkMode
                                      ? 'hover:bg-slate-800 text-slate-500 hover:text-white'
                                      : 'hover:bg-slate-100 text-slate-400 hover:text-slate-800'
                                  }`}
                                  title={item.read ? 'Marcar como não lida' : 'Marcar como lida'}
                                >
                                  {item.read ? (
                                    <MailOpen size={14} className="opacity-40 group-hover/card:opacity-100 transition-opacity" />
                                  ) : (
                                    <Mail size={14} className="text-blue-500" />
                                  )}
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
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-56 flex flex-col items-center justify-center text-center p-6"
              >
                <span className="text-3xl mb-2.5">📭</span>
                <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-505'}`}>
                  Nenhuma notificação filtrada
                </p>
                <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Muito bem, sua área acadêmica está atualizada!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
