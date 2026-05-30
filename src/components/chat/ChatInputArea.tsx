import React, { useState, useRef, useEffect } from 'react';
import { Smile, Paperclip, Send, X } from 'lucide-react';
import { uploadChatMedia } from '../../lib/uploadChatMedia';
import { motion, AnimatePresence } from 'motion/react';

interface ChatInputAreaProps {
  activeChat: string;
  currentUserName?: string;
  onSendMessage: (content: string, type: 'text' | 'image') => Promise<void>;
  onTyping: (userName: string) => void;
  typingUsers: string[];
  isDarkMode?: boolean;
}

export function ChatInputArea({
  activeChat,
  currentUserName,
  onSendMessage,
  onTyping,
  typingUsers,
  isDarkMode = false
}: ChatInputAreaProps) {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<{file: File, url: string} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const handleEmojiSelect = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (currentUserName) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(currentUserName);
      }, 500);
    }
  };

  const handleFileAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;

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
    if ((!inputText.trim() && !imagePreview) || !activeChat || isUploading) return;

    try {
      if (imagePreview) {
        setIsUploading(true);
        const { url } = await uploadChatMedia(imagePreview.file, activeChat);
        if (!mountedRef.current) return;
        await onSendMessage(url, 'image');
        URL.revokeObjectURL(imagePreview.url);
        setImagePreview(null);
        setIsUploading(false);
      }

      const text = inputText.trim();
      if (text) {
        setInputText('');
        await onSendMessage(text, 'text');
      }
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('Erro ao enviar mensagem:', err);
      const message = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      setUploadError(message);
      setIsUploading(false);
      setTimeout(() => setUploadError(null), 3000);
    }
  };

  const getTypingText = () => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0]} está digitando...`;
    if (typingUsers.length === 2) return `${typingUsers[0]} e ${typingUsers[1]} estão digitando...`;
    return 'Vários alunos estão digitando...';
  };

  return (
    <div className={`px-4 py-3 border-t shrink-0 z-10 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex flex-col gap-2 relative">

        {/* Debounced typing indicator display */}
        {getTypingText() && (
          <span className="text-[10px] text-blue-550 dark:text-blue-400 font-bold text-left pl-3 animate-pulse">
            {getTypingText()}
          </span>
        )}

        {/* Floating Emoji Picker Board */}
        <AnimatePresence>
          {showEmojiPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                className={`absolute bottom-full left-0 mb-3 w-60 p-3 rounded-2xl border shadow-2xl z-50 text-left ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-850 text-white'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-blue-500">Emojis Frequentes</span>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(false)}
                    className="text-slate-400 hover:text-slate-655 text-[10px] font-bold cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2 text-base max-h-36 overflow-y-auto no-scrollbar">
                  {['📚', '🎓', '📝', '💻', '📐', '🔬', '🧪', '💡', '📅', '🧠', '👍', '🙌', '🔥', '🎉', '😂', '😎', '🤔', '👀', '✅', '🚀', '⭐', '❤️', '💼', '📌'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiSelect(emoji)}
                      className="hover:scale-125 transition-transform duration-100 p-1 flex items-center justify-center cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-base border-transparent bg-transparent"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {uploadError && (
          <div className="absolute bottom-full left-0 mb-2 w-full px-4 z-50">
            <div className="bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg flex items-center justify-between">
              <span>{uploadError}</span>
              <button type="button" onClick={() => setUploadError(null)} className="cursor-pointer hover:scale-110"><X size={14} /></button>
            </div>
          </div>
        )}

        {imagePreview && (
          <div className="absolute bottom-full left-4 mb-2 z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-lg flex flex-col gap-2">
            <div className="relative">
              <img src={imagePreview.url} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(imagePreview.url);
                  setImagePreview(null);
                }}
                className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 shadow-md hover:scale-105 cursor-pointer"
              >
                <X size={12} />
              </button>
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center backdrop-blur-[1px]">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input Form Bar wrapper */}
        <form onSubmit={handleSendMessageSubmit} className="flex items-center gap-1.5 w-full">
          <div className="flex gap-1 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileAttachmentChange}
              className="hidden"
              accept="image/jpeg,image/png,image/webp,image/gif"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`p-2 rounded-full transition-all cursor-pointer disabled:opacity-50 ${
                isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Anexar imagem"
            >
              <Paperclip size={16} />
            </button>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                showEmojiPicker || isDarkMode
                  ? 'text-slate-205 bg-slate-800'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Emoji Picker"
            >
              <Smile size={16} />
            </button>
          </div>

          {/* Input wrap */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Digite sua mensagem acadêmica..."
              className={`w-full rounded-2xl py-2 px-4 text-xs font-semibold outline-none border transition-all ${
                isDarkMode
                  ? 'bg-slate-950 text-white placeholder-slate-500 border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10'
                  : 'bg-slate-100/90 text-slate-800 placeholder-slate-450 border-slate-250 focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-405/15'
              }`}
            />
          </div>

          {/* Floating send icon */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !imagePreview) || isUploading}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              (inputText.trim() || imagePreview) && !isUploading
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:scale-105 active:scale-95'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-404 dark:text-slate-600 cursor-not-allowed border-transparent'
            }`}
          >
            {isUploading ? (
              <div className="w-3.5 h-3.5 border-[1.5px] border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={13} fill={(inputText.trim() || imagePreview) ? "currentColor" : "none"} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
