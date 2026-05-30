import React, { useState, useRef } from 'react';
import { Search, Plus, MessagesSquare, Pin, BellOff } from 'lucide-react';
import { UserProfile } from '../profile/ProfileModal';
import { NotificationBell } from '../NotificationBell';

export interface RoomParticipant {
  user_id: string;
  profiles?: {
    username: string | null;
    avatar_index: number | null;
  };
}

export interface RoomData {
  id: string;
  name: string;
  type: string;
  created_by: string | null;
  created_at: string;
  room_participants?: RoomParticipant[];
}

interface RoomListProps {
  roomsList: RoomData[];
  roomsLoading: boolean;
  pinnedChats: Record<string, boolean>;
  mutedChats: Record<string, boolean>;
  onSelectRoom: (roomId: string) => void;
  user: UserProfile;
  currentUserId?: string;
  onOpenProfile: () => void;
  onCreateChatTrigger: () => void;
  isDarkMode?: boolean;
}

export function RoomList({
  roomsList,
  roomsLoading,
  pinnedChats,
  mutedChats,
  onSelectRoom,
  user,
  currentUserId,
  onOpenProfile,
  onCreateChatTrigger,
  isDarkMode = false
}: RoomListProps) {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filters = ['Todos', 'Grupos', 'Diretos', 'Salvos'];

  const handleSearchClick = () => {
    searchInputRef.current?.focus();
  };

  const getRoomStyles = (roomName: string) => {
    const name = roomName.toLowerCase();
    if (name.includes('alunos')) return { color: 'bg-gradient-to-tr from-blue-600 to-indigo-600', initials: 'AE' };
    if (name.includes('estruturas')) return { color: 'bg-gradient-to-tr from-slate-700 to-slate-900', initials: 'E' };
    if (name.includes('calculo')) return { color: 'bg-gradient-to-tr from-purple-500 to-indigo-500', initials: 'C' };
    if (name.includes('projetos') || name.includes('projeto')) return { color: 'bg-gradient-to-tr from-orange-500 to-amber-600', initials: 'P' };
    return { color: 'bg-gradient-to-tr from-emerald-500 to-teal-600', initials: roomName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() };
  };

  const getRoomMessage = (roomName: string) => {
    const name = roomName.toLowerCase();
    if (name.includes('alunos')) return 'João: Bora! 18h no auditório.';
    if (name.includes('estruturas')) return 'João: Upload de arquivo';
    if (name.includes('calculo')) return 'Beatriz: Obrigada!';
    if (name.includes('projetos') || name.includes('projeto')) return 'Você: Perfeito!';
    return 'Conversa iniciada.';
  };

  // Filtering
  const filteredRooms = roomsList.filter((room) => {
    if (activeFilter === 'Grupos' && room.type !== 'channel') return false;
    if (activeFilter === 'Diretos' && room.type !== 'dm') return false;
    if (activeFilter === 'Salvos' && room.id !== 'projetos') return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return room.name.toLowerCase().includes(q);
    }
    return true;
  });

  // Pin sorting
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    const isAPinned = pinnedChats[a.id] ? 1 : 0;
    const isBPinned = pinnedChats[b.id] ? 1 : 0;
    return isBPinned - isAPinned;
  });

  return (
    <div className={`flex flex-col h-full transition-colors duration-305 relative ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-[#F4F6F9] text-slate-800'}`}>
      
      {/* Header */}
      <div className="px-6 pt-11 pb-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600 text-white shadow-sm">
            <MessagesSquare size={16} />
          </div>
          <h1 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Chat
          </h1>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={handleSearchClick}
            className={`p-2 rounded-xl cursor-pointer transition-all hover:scale-105 active:scale-95 duration-200 ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'}`}
            aria-label="Pesquisar"
          >
            <Search size={18} />
          </button>

          <NotificationBell isDarkMode={isDarkMode} />

          <button
            onClick={onOpenProfile}
            className={`w-8 h-8 rounded-xl overflow-hidden border flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${isDarkMode ? 'border-slate-800 bg-slate-800' : 'border-slate-200 bg-slate-100'}`}
            aria-label="Perfil do Usuário"
            id="profile-trigger-chat-header"
          >
            {user.avatar ? (
              <img src={user.avatar} referrerPolicy="no-referrer" alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className={`text-[10px] font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-650'}`}>
                {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
              </span>
            )}
          </button>

          <button
            onClick={onCreateChatTrigger}
            className={`p-2 rounded-xl cursor-pointer transition-all hover:scale-105 active:scale-95 duration-200 ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'}`}
            aria-label="Criar Chat"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 mb-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar canais..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-2xl py-2 pl-10 pr-4 text-xs font-semibold outline-none border transition-all ${
              isDarkMode
                ? 'bg-slate-900 text-white placeholder-slate-550 border-slate-800 focus:border-blue-500'
                : 'bg-white text-slate-700 placeholder-slate-450 border border-slate-200 focus:border-blue-400 focus:bg-white shadow-3xs'
            }`}
          />
        </div>
      </div>

      {/* Segment Filter Pills */}
      <div className="px-6 mb-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-1.5 pb-1">
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10.5px] font-bold border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/15'
                    : isDarkMode
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                      : 'bg-white border-slate-205 text-slate-600 hover:bg-slate-100 hover:text-slate-850 shadow-3xs'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat List Card View */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {roomsLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sortedRooms.length > 0 ? (
          sortedRooms.map((room) => {
            let displayName = room.name;
            const isDM = room.type === 'dm';
            
            if (isDM && room.room_participants && currentUserId) {
              const other = room.room_participants.find(p => p.user_id !== currentUserId);
              if (other && other.profiles) {
                displayName = other.profiles.username || 'Usuário ' + other.user_id.substring(0, 5);
              }
            }

            const styles = getRoomStyles(displayName);
            const previewMsg = getRoomMessage(displayName);
            
            return (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`flex items-center gap-3.5 p-3.5 rounded-3xl border transition-all cursor-pointer hover:-translate-y-0.5 relative ${
                  isDarkMode
                    ? 'bg-slate-900 hover:bg-slate-850/80 border-slate-800 hover:border-slate-700 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-50/60 border-slate-200 hover:border-slate-300 text-slate-800 shadow-3xs hover:shadow-2xs'
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl ${styles.color} flex items-center justify-center text-white font-extrabold text-base shrink-0 shadow-sm relative`}>
                  {styles.initials}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0 pr-2">
                      {pinnedChats[room.id] && (
                        <Pin size={10} className="text-blue-550 shrink-0 rotate-45 fill-current" />
                      )}
                      <h3 className={`text-xs font-black tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {displayName}
                      </h3>
                    </div>
                    <span className={`text-[9.5px] font-mono shrink-0 font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-404'}`}>
                      {room.type === 'channel' ? 'Canal' : 'DM'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-[11.5px] font-medium truncate pr-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {previewMsg}
                    </p>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {mutedChats[room.id] && (
                        <BellOff size={11} className="text-slate-450 dark:text-slate-500 shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
