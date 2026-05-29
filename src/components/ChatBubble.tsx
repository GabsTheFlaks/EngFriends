import React from 'react'
import { CheckCheck, Trash2 } from 'lucide-react'
import { Message } from '../hooks/useChat'

interface ChatBubbleProps {
  message: Message
  isMe: boolean
  isDarkMode?: boolean
  onDelete?: () => void
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isMe, isDarkMode = false, onDelete }) => {
  // Format creation time to HH:MM format
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return '00:00'
    }
  }

  // Sender name colors for other users to visually distinguish them
  const nameColors: Record<string, string> = {
    'sophie': 'text-rose-550 dark:text-rose-450',
    'joao': 'text-emerald-650 dark:text-emerald-400',
    'vitor': 'text-blue-600 dark:text-blue-400',
    'pedro': 'text-purple-650 dark:text-purple-400',
    'ana': 'text-orange-550 dark:text-orange-400',
    'lucas': 'text-teal-650 dark:text-teal-400',
  }

  const senderUsernameLower = message.sender_username.toLowerCase().replace('@', '')
  const nameColorClass = nameColors[senderUsernameLower] || 'text-blue-500'

  // Avatar path pointing to the public folder: /avatars/avatar_{index}.svg
  // Fallback to avatar_0.svg if index is out of bounds
  const avatarIndex = typeof message.sender_avatar_index === 'number' ? message.sender_avatar_index : 0
  const avatarUrl = `/avatars/avatar_${avatarIndex}.png`

  return (
    <div className={`flex gap-2.5 items-end ${isMe ? 'justify-end' : 'justify-start'} group`}>
      {/* Opção de apagar para mensagens próprias */}
      {isMe && onDelete && (
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Deseja realmente apagar esta mensagem?')) {
              onDelete()
            }
          }}
          className={`p-1.5 rounded-xl opacity-0 group-hover:opacity-100 focus:opacity-100 active:opacity-100 transition-all duration-200 cursor-pointer shrink-0 self-center ${
            isDarkMode
              ? 'text-slate-500 hover:text-red-400 hover:bg-slate-800'
              : 'text-slate-400 hover:text-red-500 hover:bg-slate-100'
          }`}
          title="Apagar mensagem"
        >
          <Trash2 size={14} />
        </button>
      )}

      {/* Sender Avatar for incoming messages */}
      {!isMe && (
        <div className={`w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-xs border ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-150 bg-white'}`}>
          <img
            src={avatarUrl}
            alt={message.sender_username}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if avatar image fails to load
              (e.target as HTMLImageElement).src = '/avatars/avatar_0.png'
            }}
          />
        </div>
      )}

      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[76%]`}>
        {/* Sender Name block */}
        {!isMe && (
          <span className={`text-[9.5px] ml-1 mb-1 font-black ${nameColorClass}`}>
            @{message.sender_username}
          </span>
        )}

        <div
          className={`px-4 py-2.5 rounded-2xl text-xs relative select-all flex flex-col justify-between ${
            isMe
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-br-2xs shadow-sm shadow-blue-500/10'
              : isDarkMode
                ? 'bg-slate-900/90 border border-slate-800/90 text-slate-100 rounded-bl-2xs'
                : 'bg-white text-slate-800 rounded-bl-2xs border border-slate-200/50 shadow-2xs'
          }`}
        >
          {message.type === 'image' ? (
            <img
              src={message.content}
              alt="Mídia enviada"
              className="rounded-lg max-w-full max-h-60 object-contain my-1 shadow-3xs"
            />
          ) : (
            <p className="leading-snug font-medium break-words whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Meta footer inside bubble */}
          <div className="flex items-center justify-end gap-1 mt-1 shrink-0 self-end">
            <span className={`text-[8.5px] ${isMe ? 'text-blue-200' : 'text-slate-400'} font-mono font-medium`}>
              {formatTime(message.created_at)}
            </span>
            {isMe && (
              <CheckCheck size={11} className="text-sky-300 dark:text-sky-200 shrink-0" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
