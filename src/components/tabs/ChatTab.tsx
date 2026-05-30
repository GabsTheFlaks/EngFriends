import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { RoomList, RoomData } from '../chat/RoomList';
import { CreateRoomDrawer } from '../chat/CreateRoomDrawer';
import { RoomDetail } from '../chat/RoomDetail';
import { UserProfile } from '../profile/ProfileModal';


interface ChatTabProps {
  user: UserProfile;
  onOpenProfile: () => void;
  isDarkMode?: boolean;
}

export function ChatTab({ user, onOpenProfile, isDarkMode = false }: ChatTabProps) {
  const { session } = useAuth();
  const currentUserId = session?.user?.id;
  // Initialize activeChat from URL parameter to survive page reloads (F5)
  const [activeChat, setActiveChat] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('chat');
  });

  // Sync activeChat state changes to the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentParam = params.get('chat');
    
    if (activeChat) {
      if (currentParam !== activeChat) {
        params.set('chat', activeChat);
        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
      }
    } else {
      if (params.has('chat')) {
        params.delete('chat');
        const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
        window.history.pushState({}, '', newUrl);
      }
    }
  }, [activeChat]);

  // Listen to browser Back/Forward buttons to update the activeChat state
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveChat(params.get('chat'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Supabase rooms state
  const [roomsList, setRoomsList] = useState<RoomData[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  // Pin & Mute — Persisted in Supabase profiles
  const [pinnedChats, setPinnedChats] = useState<Record<string, boolean>>({});
  const [mutedChats, setMutedChats] = useState<Record<string, boolean>>({});

  // Carrega preferências do Supabase
  useEffect(() => {
    if (!currentUserId) return;

    const loadPreferences = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('pinned_chats, muted_chats')
        .eq('id', currentUserId)
        .maybeSingle();

      const supabasePinned = profile?.pinned_chats ?? [];
      const supabaseMuted = profile?.muted_chats ?? [];

      // Converter string[] → Record<string, boolean>
      const toRecord = (arr: string[]): Record<string, boolean> =>
        Object.fromEntries(arr.map(id => [id, true]));

      setPinnedChats(toRecord(supabasePinned));
      setMutedChats(toRecord(supabaseMuted));
    };

    loadPreferences();
  }, [currentUserId]);

  // Helpers: salva preferências diretamente no Supabase profiles
  const savePinned = (updated: Record<string, boolean>) => {
    if (currentUserId) {
      const arr = Object.entries(updated).filter(([, v]) => v).map(([k]) => k);
      supabase.from('profiles').update({ pinned_chats: arr }).eq('id', currentUserId).then();
    }
  };

  const saveMuted = (updated: Record<string, boolean>) => {
    if (currentUserId) {
      const arr = Object.entries(updated).filter(([, v]) => v).map(([k]) => k);
      supabase.from('profiles').update({ muted_chats: arr }).eq('id', currentUserId).then();
    }
  };

  const [showCreateChat, setShowCreateChat] = useState(false);

  const fetchRooms = async () => {
    const { data } = await supabase
      .from('rooms')
      .select('*, room_participants(user_id, profiles(username, avatar_index))');
    if (data) {
      setRoomsList(data as RoomData[]);
    }
  };

  // Fetch rooms from Supabase + Realtime subscription para sincronizar novos canais
  useEffect(() => {
    fetchRooms().then(() => setRoomsLoading(false));

    const roomsChannel = supabase
      .channel('rooms-list-sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rooms' }, () => {
        fetchRooms();
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'rooms' }, (payload) => {
        const oldRecord = payload.old as { id?: string };
        if (oldRecord.id) setRoomsList(prev => prev.filter(r => r.id !== oldRecord.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(roomsChannel); };
  }, []);

  // Option actions
  const handleTogglePinChat = () => {
    if (!activeChat) return;
    setPinnedChats(prev => {
      const up = { ...prev, [activeChat]: !prev[activeChat] };
      savePinned(up);
      return up;
    });
  };

  const handleToggleMuteChat = () => {
    if (!activeChat) return;
    setMutedChats(prev => {
      const up = { ...prev, [activeChat]: !prev[activeChat] };
      saveMuted(up);
      return up;
    });
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

  let activeChatData: RoomData | undefined = roomsList.find(c => c.id === activeChat);

  if (activeChatData && activeChatData.type === 'dm' && activeChatData.room_participants) {
    const other = activeChatData.room_participants.find(p => p.user_id !== currentUserId);
    if (other && other.profiles) {
      activeChatData = { ...activeChatData, name: other.profiles.username || 'Usuário ' + other.user_id.substring(0, 5) };
    }
  }

  if (activeChatData) {
    return (
      <RoomDetail
        activeChatData={activeChatData}
        currentUserId={currentUserId}
        currentUserName={user?.name}
        isDarkMode={isDarkMode}
        isPinned={!!pinnedChats[activeChatData.id]}
        isMuted={!!mutedChats[activeChatData.id]}
        onBack={() => setActiveChat(null)}
        onTogglePin={handleTogglePinChat}
        onToggleMute={handleToggleMuteChat}
        onLeaveChat={handleLeaveCurrentChat}
      />
    );
  }

  return (
    <>
      <RoomList
        roomsList={roomsList}
        roomsLoading={roomsLoading}
        pinnedChats={pinnedChats}
        mutedChats={mutedChats}
        onSelectRoom={setActiveChat}
        user={user}
        currentUserId={currentUserId}
        onOpenProfile={onOpenProfile}
        onCreateChatTrigger={() => setShowCreateChat(true)}
        isDarkMode={isDarkMode}
      />

      <CreateRoomDrawer
        isOpen={showCreateChat}
        onClose={() => setShowCreateChat(false)}
        currentUserId={currentUserId}
        onRoomCreated={fetchRooms}
        isDarkMode={isDarkMode}
      />
    </>
  );
}
