import React, { useState, useEffect } from 'react';
import { CheckCheck, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Message } from '../hooks/useChat';

interface ChatBubbleProps {
  message: Message;
  key?: React.Key;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const { user } = useAuth();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    if (lightboxOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [lightboxOpen]);

  // Since user from useAuth might be undefined during initial load,
  // we do a safe check.
  const isMe = user?.id === message.sender_id;

  // Format time (ex: 2024-05-28T14:32:00.000Z to 14:32)
  const time = new Date(message.created_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div data-testid="chat-bubble" className={`flex gap-2.5 items-end ${isMe ? 'justify-end' : 'justify-start'}`}>
      {/* Sender Avatar for incoming group messages */}
      {!isMe && (
        <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-xs border border-slate-150 dark:border-slate-800 overflow-hidden bg-slate-100">
          <img
            src={`/avatars/avatar_${message.sender_avatar_index}.svg`}
            alt={message.sender_username}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/avatars/avatar_1.svg';
            }}
          />
        </div>
      )}

      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[76%]`}>
        {/* Sender Name block */}
        {!isMe && (
          <span className="text-[9.5px] ml-1 mb-1 font-black text-blue-500">
            {message.sender_username}
          </span>
        )}

        <div
          className={`px-4 py-2.5 rounded-2xl text-xs relative select-all flex flex-col justify-between ${
            isMe
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-br-2xs shadow-sm shadow-blue-500/10'
              : 'bg-white text-slate-800 rounded-bl-2xs border border-slate-200/50 shadow-2xs dark:bg-slate-900/90 dark:border-slate-800/90 dark:text-slate-100'
          }`}
        >
          {message.type === 'image' ? (
            <div className="max-w-xs">
              <img
                src={message.content}
                alt="Imagem enviada"
                className="rounded-lg max-w-full max-h-64 object-cover cursor-pointer mb-1"
                onClick={() => setLightboxOpen(true)}
                loading="lazy"
              />
            </div>
          ) : (
            <p className="leading-snug font-medium break-words whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Meta footer inside bubble */}
          <div className="flex items-center justify-end gap-1 mt-1 shrink-0 self-end">
            <span className={`text-[8.5px] ${isMe ? 'text-blue-200' : 'text-slate-400'} font-mono font-medium`}>
              {time}
            </span>
            {isMe && (
              <CheckCheck size={11} className="text-sky-300 dark:text-sky-200 shrink-0" />
            )}
          </div>
        </div>
      </div>

      {lightboxOpen && message.type === 'image' && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center animate-fade-in" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-all cursor-pointer">
            <X size={24} />
          </button>
          <img
            src={message.content}
            alt="Imagem ampliada"
            className="max-w-full max-h-full object-contain cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}