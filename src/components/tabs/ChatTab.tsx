import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../profile/ProfileModal';
import { supabase } from '../../lib/supabaseClient';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { RoomList } from '../chat/RoomList';
import { RoomDetail } from '../chat/RoomDetail';
import { CreateRoomDrawer } from '../chat/CreateRoomDrawer';

interface ChatTabProps {
  user: UserProfile;
  onOpenProfile: () => void;
  isDarkMode?: boolean;
}

export function ChatTab({ user, onOpenProfile, isDarkMode = false }: ChatTabProps) {
  const { session } = useAuth();
  const currentUserId = session?.user?.id;

  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Supabase rooms state
  const [roomsList, setRoomsList] = useState<Array<{ id: string; name: string; type: string; created_by: string | null; created_at: string }>>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  // Pin & Mute persistence from localStorage
  const [pinnedChats, setPinnedChats] = useState<Record<string, boolean>>(() => {
    const cached = localStorage.getItem('engplus_pinned_chats');
    return cached ? JSON.parse(cached) : {};
  });
  const [mutedChats, setMutedChats] = useState<Record<string, boolean>>(() => {
    const cached = localStorage.getItem('engplus_muted_chats');
    return cached ? JSON.parse(cached) : {};
  });

  const [showCreateChat, setShowCreateChat] = useState(false);

  // Fetch rooms from Supabase + Realtime subscription para sincronizar novos canais
  useEffect(() => {
    supabase
      .from('rooms')
      .select('*')
      .then(({ data, error }) => {
        if (error) console.error(error);
        if (data) setRoomsList(data);
        setRoomsLoading(false);
      });

    const roomsChannel = supabase
      .channel('rooms-list-sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rooms' }, (payload) => {
        setRoomsList(prev => {
          const newRoom = payload.new as { id: string; name: string; type: string; created_by: string | null; created_at: string };
          if (prev.some(r => r.id === newRoom.id)) return prev;
          return [...prev, newRoom];
        });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'rooms' }, (payload) => {
        setRoomsList(prev => prev.filter(r => r.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(roomsChannel); };
  }, []);

  // Connect useChat hook to the active room
  const { messages, loading: messagesLoading, typingUsers, sendMessage, sendTyping, deleteMessage, clearChat } = useChat(activeChat ?? '');

  const handleSearchClick = () => {
    searchInputRef.current?.focus();
  };

  // Aesthetic mapping helper for channels
  const getRoomStyles = (roomName: string) => {
    const name = roomName.toLowerCase();
    if (name.includes('alunos')) return { color: 'bg-gradient-to-tr from-blue-600 to-indigo-600', initials: 'AE' };
    if (name.includes('estruturas')) return { color: 'bg-gradient-to-tr from-slate-700 to-slate-900', initials: 'E' };
    if (name.includes('calculo')) return { color: 'bg-gradient-to-tr from-purple-500 to-indigo-500', initials: 'C' };
    if (name.includes('projetos') || name.includes('projeto')) return { color: 'bg-gradient-to-tr from-orange-500 to-amber-600', initials: 'P' };
    return { color: 'bg-gradient-to-tr from-emerald-500 to-teal-600', initials: roomName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() };
  };

  const getRoomMessage = (roomName: string) => {
    const name = roomName.toLowerCase();
    if (name.includes('alunos')) return 'João: Bora! 18h no auditório.';
    if (name.includes('estruturas')) return 'João: Upload de arquivo';
    if (name.includes('calculo')) return 'Beatriz: Obrigada!';
    if (name.includes('projetos') || name.includes('projeto')) return 'Você: Perfeito!';
    return 'Conversa iniciada.';
  };

  // Option actions
  const handleTogglePinChat = () => {
    if (!activeChat) return;
    setPinnedChats(prev => {
      const up = { ...prev, [activeChat]: !prev[activeChat] };
      localStorage.setItem('engplus_pinned_chats', JSON.stringify(up));
      return up;
    });
  };

  const handleToggleMuteChat = () => {
    if (!activeChat) return;
    setMutedChats(prev => {
      const up = { ...prev, [activeChat]: !prev[activeChat] };
      localStorage.setItem('engplus_muted_chats', JSON.stringify(up));
      return up;
    });
  };

  const handleClearCurrentChat = async () => {
    if (!activeChat) return;
    if (window.confirm('Deseja limpar as mensagens desta conversa apenas para você? As novas mensagens voltarão a aparecer.')) {
      try {
        await clearChat();
      } catch (e) {
        console.error('Erro ao limpar conversa:', e);
        alert('Falha ao limpar a conversa.');
      }
    }
  };

  const handleLeaveCurrentChat = async () => {
    if (!activeChat) return;
    try {
      const { error } = await supabase.from('rooms').delete().eq('id', activeChat);
      if (error) console.error(error);
      else {
        setRoomsList(prev => prev.filter(r => r.id !== activeChat));
        setActiveChat(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateChatSubmit = async (name: string, initials: string, type: 'grupo' | 'direto', firstMsg: string) => {
    if (!name.trim()) return;

    try {
      const { data: room, error } = await supabase
        .from('rooms')
        .insert({
          id: crypto.randomUUID(),
          name: name,
          type: type,
          created_by: currentUserId || null
        })
        .select()
        .single();

      if (error) throw error;

      if (firstMsg.trim() && room) {
        await supabase
          .from('messages')
          .insert({
            id: crypto.randomUUID(),
            room_id: room.id,
            content: firstMsg,
            sender_id: currentUserId || '',
            type: 'text'
          });
      }

      setShowCreateChat(false);

      // Select the new room if it's already in the list via broadcast,
      // or we manually set it after a brief timeout
      setTimeout(() => {
        if (room) setActiveChat(room.id);
      }, 500);

    } catch (e) {
      console.error('Erro ao criar sala:', e);
      alert('Erro ao criar sala. Verifique sua conexão e tente novamente.');
    }
  };

  // Filter and sort rooms list
  const filteredRooms = roomsList.filter(room => {
    if (activeFilter === 'Grupos') return room.type === 'grupo';
    if (activeFilter === 'Diretos') return room.type === 'direto';
    if (activeFilter === 'Salvos') return pinnedChats[room.id];
    return true; // Todos
  });

  const searchFilteredRooms = filteredRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedRooms = [...searchFilteredRooms].sort((a, b) => {
    const aPinned = pinnedChats[a.id] ? 1 : 0;
    const bPinned = pinnedChats[b.id] ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const activeChatData = roomsList.find(r => r.id === activeChat);

  return (
    <div className={`h-[calc(100vh-80px)] relative overflow-hidden flex flex-col ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>

      {/* View Switching Logic */}
      {activeChat && activeChatData ? (
        <RoomDetail
          user={user as any}
          activeChatData={activeChatData}
          messages={messages}
          messagesLoading={messagesLoading}
          typingUsers={typingUsers}
          pinnedChats={pinnedChats}
          mutedChats={mutedChats}
          onBack={() => setActiveChat(null)}
          onTogglePin={handleTogglePinChat}
          onToggleMute={handleToggleMuteChat}
          onClearChat={handleClearCurrentChat}
          onLeaveChat={handleLeaveCurrentChat}
          sendMessage={sendMessage}
          sendTyping={sendTyping}
          deleteMessage={deleteMessage}
          isDarkMode={isDarkMode}
        />
      ) : (
        <RoomList
          user={user}
          roomsLoading={roomsLoading}
          sortedRooms={sortedRooms}
          pinnedChats={pinnedChats}
          mutedChats={mutedChats}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onSelectRoom={setActiveChat}
          onOpenProfile={onOpenProfile}
          onCreateChatTrigger={() => setShowCreateChat(true)}
          isDarkMode={isDarkMode}
          getRoomStyles={getRoomStyles}
          getRoomMessage={getRoomMessage}
          searchInputRef={searchInputRef}
          handleSearchClick={handleSearchClick}
        />
      )}

      {/* Drawer */}
      <CreateRoomDrawer
        isOpen={showCreateChat}
        onClose={() => setShowCreateChat(false)}
        onSubmit={handleCreateChatSubmit}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
