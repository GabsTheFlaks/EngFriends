import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, MoreVertical, Pin, BellOff, Trash2, LogOut, Paperclip, Smile, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatBubble } from '../ChatBubble';
import { uploadChatMedia } from '../../lib/uploadChatMedia';

interface RoomDetailProps {
  user: { id: string; name: string };
  activeChatData: { id: string; name: string; type: string } | undefined;
  messages: any[];
  messagesLoading: boolean;
  typingUsers: string[];
  pinnedChats: Record<string, boolean>;
  mutedChats: Record<string, boolean>;
  onBack: () => void;
  onTogglePin: () => void;
  onToggleMute: () => void;
  onClearChat: () => void;
  onLeaveChat: () => void;
  sendMessage: (content: string, type: 'text' | 'image') => Promise<void>;
  sendTyping: (userName: string) => void;
  deleteMessage: (msgId: string) => Promise<void>;
  isDarkMode?: boolean;
}

export function RoomDetail({
  user,
  activeChatData,
  messages,
  messagesLoading,
  typingUsers,
  pinnedChats,
  mutedChats,
  onBack,
  onTogglePin,
  onToggleMute,
  onClearChat,
  onLeaveChat,
  sendMessage,
  sendTyping,
  deleteMessage,
  isDarkMode = false
}: RoomDetailProps) {
  const [inputText, setInputText] = useState('');
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<{file: File, url: string} | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChatData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (user?.name) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(user.name);
      }, 500);
    }
  };

  const handleFileAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChatData) return;

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Tipo não suportado. Use JPG, PNG, WEBP ou GIF.');
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    const isGif = file.type === 'image/gif';
    const maxSize = isGif ? 5 * 1024 * 1024 : 25 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(isGif ? 'GIF muito grande (máximo 5MB).' : 'Imagem muito grande (máximo 25MB).');
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview({ file, url: previewUrl });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessageSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !imagePreview) || !activeChatData || isUploading) return;

    try {
      if (imagePreview) {
        setIsUploading(true);
        const { url } = await uploadChatMedia(imagePreview.file, activeChatData.id);
        if (!mountedRef.current) return;
        await sendMessage(url, 'image');
        URL.revokeObjectURL(imagePreview.url);
        setImagePreview(null);
        setIsUploading(false);
      }

      const text = inputText.trim();
      if (text) {
        setInputText('');
        await sendMessage(text, 'text');
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      console.error('Erro ao enviar mensagem:', err);
      setUploadError(err.message || 'Erro ao enviar mensagem');
      setIsUploading(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  if (!activeChatData) return null;

  return (
    <div className={`flex flex-col h-full z-30 relative animate-slide-left ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <div className={`px-4 py-4 flex justify-between items-center border-b transition-colors duration-300 ${isDarkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-100'} backdrop-blur-xl sticky top-0 z-40 shadow-sm`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <ChevronLeft size={20} />
          </button>
          <div className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center text-white font-black text-sm shadow-inner bg-gradient-to-tr from-emerald-500 to-teal-600`}>
            {activeChatData.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className={`font-black text-sm tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {activeChatData.name}
            </h2>
            <p className={`text-[11px] font-medium mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {typingUsers.length > 0 ? (
                <span className="text-blue-500 flex items-center gap-1">
                  <span className="flex space-x-0.5">
                    <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                  digitando...
                </span>
              ) : 'Toque para dados do canal'}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowChatOptions(!showChatOptions)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <MoreVertical size={18} />
          </button>

          <AnimatePresence>
            {showChatOptions && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowChatOptions(false)}></div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className={`absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-xl border overflow-hidden z-50 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
                >
                  <div className="p-1">
                    <button
                      onClick={onTogglePin}
                      className={`w-full text-left px-3 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Pin size={14} className={pinnedChats[activeChatData.id] ? "text-blue-500" : ""} />
                      {pinnedChats[activeChatData.id] ? 'Desafixar Conversa' : 'Fixar Conversa no Topo'}
                    </button>
                    <button
                      onClick={onToggleMute}
                      className={`w-full text-left px-3 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <BellOff size={14} className={mutedChats[activeChatData.id] ? "text-blue-500" : ""} />
                      {mutedChats[activeChatData.id] ? 'Reativar Notificações' : 'Silenciar Notificações'}
                    </button>
                    <div className={`h-px w-full my-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
                    <button
                      onClick={onClearChat}
                      className={`w-full text-left px-3 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Trash2 size={14} />
                      Limpar Conversa
                    </button>
                    <button
                      onClick={onLeaveChat}
                      className="w-full text-left px-3 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      Excluir Canal
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Upload Error Banner */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-500 text-white text-xs font-bold px-4 py-2 flex items-center justify-between"
          >
            <span>{uploadError}</span>
            <button onClick={() => setUploadError(null)} className="p-1 hover:bg-red-600 rounded">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Feed */}
      <div className={`flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        {messagesLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
            <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Sincronizando chat...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`}>
              <span className="text-3xl">👋</span>
            </div>
            <h3 className={`text-sm font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Nenhuma mensagem ainda</h3>
            <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Seja o primeiro a puxar assunto neste canal!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              isMe={msg.sender_id === user?.id}

              isDarkMode={isDarkMode}
              onDelete={() => deleteMessage(msg.id)}
            />
          ))
        )}
        <div ref={chatEndRef} className="h-2"></div>
      </div>

      {/* Image Preview Overlay */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`absolute bottom-full left-0 right-0 p-4 border-t z-20 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
          >
            <div className="relative inline-block">
              <img
                src={imagePreview.url}
                alt="Preview"
                className="h-32 object-cover rounded-xl border-2 border-blue-500/50"
              />
              <button
                onClick={() => {
                  URL.revokeObjectURL(imagePreview.url);
                  setImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className={`p-4 border-t pb-20 transition-colors duration-300 relative z-30 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`}>
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`absolute bottom-[calc(100%+10px)] left-4 p-2 rounded-2xl shadow-xl border flex gap-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
            >
              {['👍', '😂', '❤️', '🔥', '🎉', '💡', '✅', '👀'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    handleEmojiSelect(emoji);
                    setShowEmojiPicker(false);
                  }}
                  className={`text-xl p-2 rounded-xl hover:scale-110 transition-transform ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSendMessageSubmit} className="flex items-end gap-2">
          <div className="flex gap-1 items-center pb-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800' : 'text-slate-400 hover:text-blue-500 hover:bg-slate-100'}`}
            >
              <Paperclip size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileAttachmentChange}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'}`}
            >
              <Smile size={18} />
            </button>
          </div>
          <div className={`flex-1 rounded-[1.2rem] border overflow-hidden flex transition-all ${isDarkMode ? 'bg-slate-900/60 border-slate-800 focus-within:border-blue-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-blue-400 focus-within:bg-white'}`}>
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={imagePreview ? "Adicione um comentário..." : "Digite sua mensagem..."}
              className={`w-full bg-transparent px-4 py-3 text-sm outline-none font-medium placeholder:font-normal ${isDarkMode ? 'text-slate-200 placeholder:text-slate-500' : 'text-slate-700 placeholder:text-slate-400'}`}
            />
          </div>
          <button
            type="submit"
            disabled={(!inputText.trim() && !imagePreview) || isUploading}
            className={`w-[46px] h-[46px] flex items-center justify-center rounded-[1.2rem] transition-all duration-300 shadow-md ${
              (!inputText.trim() && !imagePreview) || isUploading
                ? isDarkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-200 text-slate-400'
                : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/25 hover:scale-105 active:scale-95 cursor-pointer'
            }`}
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Send size={18} className="ml-1" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
