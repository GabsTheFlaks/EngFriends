import React, { useEffect, useRef, useState } from 'react';
import { ChatBubble } from '../ChatBubble';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface MessageData {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image';
  created_at: string;
  sender_username: string;
  sender_avatar_index: number;
}

interface MessageFeedProps {
  messages: MessageData[];
  messagesLoading: boolean;
  currentUserId?: string;
  isDarkMode: boolean;
  onDeleteMessage: (id: string) => Promise<void>;
  activeChat: string;
}

export function MessageFeed({
  messages,
  messagesLoading,
  currentUserId,
  isDarkMode,
  onDeleteMessage,
  activeChat
}: MessageFeedProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Scroll to bottom helper when messages load or room changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-left">
      <div className="text-center my-2 select-none">
        <span className={`px-3 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wider border ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-500' : 'bg-white border-slate-200/60 text-slate-404 shadow-3xs'}`}>
          🔒 Conexão segura com Supabase (TLS)
        </span>
      </div>

      {messagesLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : messages.length > 0 ? (
        messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            isMe={msg.sender_id === currentUserId}
            isDarkMode={isDarkMode}
            onDelete={() => onDeleteMessage(msg.id)}
            onImageClick={(url) => setSelectedImage(url)}
          />
        ))
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <span className="text-3xl mb-2.5">👋</span>
          <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Diga olá neste grupo!</p>
          <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Participe das discussões com seus colegas de engenharia.</p>
        </div>
      )}
      <div ref={chatEndRef} />

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedImage}
              alt="Imagem ampliada"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
