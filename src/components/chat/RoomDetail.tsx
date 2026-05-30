import React from 'react';
import { useChat } from '../../hooks/useChat';
import { ChatHeader } from './ChatHeader';
import { MessageFeed } from './MessageFeed';
import { ChatInputArea } from './ChatInputArea';

interface RoomDetailProps {
  activeChatData: { id: string; name: string; type: string };
  currentUserId?: string;
  currentUserName?: string;
  isDarkMode: boolean;
  isPinned: boolean;
  isMuted: boolean;
  onBack: () => void;
  onTogglePin: () => void;
  onToggleMute: () => void;
  onLeaveChat: () => Promise<void>;
}

export function RoomDetail({
  activeChatData,
  currentUserId,
  currentUserName,
  isDarkMode,
  isPinned,
  isMuted,
  onBack,
  onTogglePin,
  onToggleMute,
  onLeaveChat,
}: RoomDetailProps) {
  const { messages, loading: messagesLoading, typingUsers, sendMessage, sendTyping, deleteMessage, clearChat } = useChat(activeChatData.id);

  const handleClearCurrentChat = async () => {
    if (window.confirm('Deseja limpar as mensagens desta conversa apenas para você? As novas mensagens voltarão a aparecer.')) {
      try {
        await clearChat();
      } catch (e) {
        console.error('Erro ao limpar conversa:', e);
        alert('Falha ao limpar a conversa.');
      }
    }
  };

  return (
    <div className={`flex flex-col h-full transition-colors duration-300 relative ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-[#F4F6F9] text-slate-800'}`}>
      <ChatHeader
        activeChatData={activeChatData}
        isDarkMode={isDarkMode}
        isPinned={isPinned}
        isMuted={isMuted}
        onBack={onBack}
        onTogglePin={onTogglePin}
        onToggleMute={onToggleMute}
        onClearChat={handleClearCurrentChat}
        onLeaveChat={onLeaveChat}
      />

      <MessageFeed
        messages={messages}
        messagesLoading={messagesLoading}
        currentUserId={currentUserId}
        isDarkMode={isDarkMode}
        onDeleteMessage={deleteMessage}
        activeChat={activeChatData.id}
      />

      <ChatInputArea
        activeChat={activeChatData.id}
        currentUserName={currentUserName}
        onSendMessage={sendMessage}
        onTyping={sendTyping}
        typingUsers={typingUsers}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
