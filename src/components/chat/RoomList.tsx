import React from 'react';
import { Search, Plus, Pin, BellOff, LogOut } from 'lucide-react';
import { UserProfile } from '../profile/ProfileModal';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationBell } from '../NotificationBell';

interface Room {
  id: string;
  name: string;
  type: string;
  created_by: string | null;
  created_at: string;
}

interface RoomListProps {
  user: UserProfile;
  roomsLoading: boolean;
  sortedRooms: Room[];
  pinnedChats: Record<string, boolean>;
  mutedChats: Record<string, boolean>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  onSelectRoom: (roomId: string) => void;
  onOpenProfile: () => void;
  onCreateChatTrigger: () => void;
  isDarkMode?: boolean;
  getRoomStyles: (roomName: string) => { color: string; initials: string };
  getRoomMessage: (roomName: string) => string;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  handleSearchClick: () => void;
}

export function RoomList({
  user,
  roomsLoading,
  sortedRooms,
  pinnedChats,
  mutedChats,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  onSelectRoom,
  onOpenProfile,
  onCreateChatTrigger,
  isDarkMode = false,
  getRoomStyles,
  getRoomMessage,
  searchInputRef,
  handleSearchClick
}: RoomListProps) {
  const filters = ['Todos', 'Grupos', 'Diretos', 'Salvos'];

  return (
    <div className={`flex flex-col h-full animate-fade-in ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header and Profile */}
      <div className={`px-6 pt-8 pb-4 flex justify-between items-center transition-colors duration-300 ${isDarkMode ? 'bg-slate-950/90' : 'bg-white/90'} backdrop-blur-xl sticky top-0 z-20`}>
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={onOpenProfile}>
            <div className={`absolute -inset-0.5 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500 ${isDarkMode ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-blue-400 to-indigo-400'}`}></div>
            <div className={`relative h-[42px] w-[42px] rounded-full border-2 overflow-hidden shadow-sm flex items-center justify-center ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-white bg-slate-100'}`}>
              <img src={`/avatars/avatar_${user.avatar}.svg`} alt="Avatar" className="w-[30px] h-[30px]" />
            </div>
          </div>
          <div>
            <h1 className={`text-xl font-black tracking-tight leading-none mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Chats<span className="text-blue-500">.</span>
            </h1>
            <p className={`text-[11px] font-medium flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
              Conectado
            </p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <NotificationBell isDarkMode={isDarkMode} />
          <button
            onClick={onCreateChatTrigger}
            className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/20' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-6 py-2 z-10 relative">
        <div
          onClick={handleSearchClick}
          className={`group flex items-center gap-3 px-4 py-3 rounded-[1.2rem] border transition-all duration-300 shadow-sm cursor-text ${isDarkMode ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900' : 'bg-white border-slate-200/60 hover:border-blue-200 hover:shadow-md'}`}
        >
          <Search size={16} className={`transition-colors ${isDarkMode ? 'text-slate-500 group-hover:text-blue-400' : 'text-slate-400 group-hover:text-blue-500'}`} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar canais ou mensagens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-transparent text-[13px] font-medium outline-none placeholder:font-normal ${isDarkMode ? 'text-slate-200 placeholder:text-slate-500' : 'text-slate-700 placeholder:text-slate-400'}`}
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="px-6 py-3 overflow-x-auto no-scrollbar flex gap-2.5 items-center z-10 relative">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all duration-300 cursor-pointer border ${activeFilter === filter ? (isDarkMode ? 'bg-blue-600/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-slate-900 text-white border-slate-900 shadow-md') : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700')}`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-3 relative custom-scrollbar mt-1">
        {roomsLoading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className={`h-[72px] rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}></div>
          ))
        ) : sortedRooms.length > 0 ? (
          sortedRooms.map((room) => {
            const styles = getRoomStyles(room.name);
            const isPinned = pinnedChats[room.id];
            const isMuted = mutedChats[room.id];

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`group flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 cursor-pointer border ${isDarkMode ? 'bg-slate-900/50 hover:bg-slate-800/80 border-slate-800/50 hover:border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200 hover:shadow-sm'}`}
              >
                <div className={`w-[46px] h-[46px] rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-inner shrink-0 relative ${styles.color}`}>
                  {styles.initials}
                  {room.type === 'grupo' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-900 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`font-bold text-sm truncate pr-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      {room.name}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isPinned && <Pin size={10} className={isDarkMode ? "text-blue-400" : "text-blue-500"} />}
                      {isMuted && <BellOff size={10} className={isDarkMode ? "text-slate-500" : "text-slate-400"} />}
                      <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Agora</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} max-w-[85%]`}>
                      {getRoomMessage(room.name)}
                    </p>
                    <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                      1
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="h-44 flex flex-col items-center justify-center text-center px-6">
            <span className="text-2xl mb-1.5">💬</span>
            <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nenhuma conversa no filtro anterior</p>
            <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Use os filtros acima ou inicie um novo canal acadêmico.</p>
          </div>
        )}
      </div>
    </div>
  );
}
