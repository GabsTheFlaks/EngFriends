import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, ChevronLeft, Send, X, MoreVertical, Image, Paperclip, Smile, CheckCheck, MessagesSquare, Pin, BellOff, Trash2, LogOut } from 'lucide-react';
import { UserProfile } from '../profile/ProfileModal';
import { motion, AnimatePresence } from 'motion/react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { ChatBubble } from '../ChatBubble';
import { supabase } from '../../lib/supabaseClient';

interface ChatTabProps {
  user: UserProfile;
  onOpenProfile: () => void;
  isDarkMode?: boolean;
}

export function ChatTab({ user, onOpenProfile, isDarkMode = false }: ChatTabProps) {
  const { user: authUser } = useAuth();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filters = ['Todos', 'Grupos', 'Diretos', 'Salvos'];

  // Custom states for options & picks
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Load persistence for pins & mutes
  const [pinnedChats, setPinnedChats] = useState<Record<number, boolean>>(() => {
    const cached = localStorage.getItem('engplus_pinned_chats');
    return cached ? JSON.parse(cached) : {};
  });
  const [mutedChats, setMutedChats] = useState<Record<string, boolean>>(() => {
    const cached = localStorage.getItem('engplus_muted_chats');
    return cached ? JSON.parse(cached) : {};
  });

  const [chatsList, setChatsList] = useState<any[]>([]);

  // Fetch rooms from Supabase
  useEffect(() => {
    supabase
      .from('rooms')
      .select('*')
      .eq('type', 'channel')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching rooms:', error);
          return;
        }
        if (data) {
          const mapped = data.map((room) => ({
            id: room.id,
            name: room.name,
            message: room.description || 'Nenhuma mensagem',
            time: '',
            unread: 0,
            color: 'bg-gradient-to-tr from-blue-600 to-indigo-600', // default fallback
            initials: room.name.substring(0, 2).toUpperCase(),
            members: 0,
          }));
          setChatsList(mapped);
        }
      });
  }, []);

  const [showCreateChat, setShowCreateChat] = useState(false);

  // Create chat modal inputs
  const [newChatName, setNewChatName] = useState('');
  const [newChatInitials, setNewChatInitials] = useState('');
  const [newChatType, setNewChatType] = useState<'grupo' | 'direto'>('grupo');
  const [newChatColor, setNewChatColor] = useState('bg-gradient-to-tr from-blue-500 to-indigo-550');
  const [newChatFirstMsg, setNewChatFirstMsg] = useState('');

  const onlineMembers = [
    { name: 'Sophie', handle: '@sophie', color: 'bg-gradient-to-tr from-rose-400 to-pink-500', initials: 'S', active: true },
    { name: 'João', handle: '@joao', color: 'bg-gradient-to-tr from-emerald-400 to-green-600', initials: 'J', active: true },
    { name: 'Vitor', handle: '@vitor', color: 'bg-gradient-to-tr from-blue-400 to-sky-600', initials: 'V', active: true },
    { name: 'Pedro', handle: '@pedro', color: 'bg-gradient-to-tr from-purple-400 to-indigo-600', initials: 'P', active: true },
    { name: 'Ana', handle: '@ana', color: 'bg-gradient-to-tr from-amber-400 to-orange-500', initials: 'A', active: true },
    { name: 'Lucas', handle: '@lucas', color: 'bg-gradient-to-tr from-teal-400 to-emerald-600', initials: 'L', active: true },
  ];

  const activeChatData = chatsList.find((c: any) => c.id === activeChat);

  const { messages, loading, typingUsers, sendMessage, sendTyping } = useChat(activeChat);

  // Clear preview URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
    };
  }, [attachmentPreview]);

  // Scroll to bottom helper
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  const handleSearchClick = () => {
    searchInputRef.current?.focus();
  };

  // Sender specific avatar colors for better visual grouping
  const getSenderMeta = (sender: string) => {
    const matched = onlineMembers.find(m => m.handle === sender);
    if (matched) return { color: matched.color, initials: matched.initials };
    return { color: 'bg-gradient-to-tr from-slate-400 to-slate-500', initials: '?' };
  };

  const nameColors: Record<string, string> = {
    '@sophie': 'text-rose-550 dark:text-rose-450',
    '@joao': 'text-emerald-600 dark:text-emerald-400',
    '@vitor': 'text-blue-600 dark:text-blue-400',
    '@pedro': 'text-purple-650 dark:text-purple-400',
    '@ana': 'text-orange-550 dark:text-orange-400',
    '@lucas': 'text-teal-600 dark:text-teal-400',
  };

  // "3 Dots" active chat actions handlers
  const handleTogglePinChat = () => {
    if (!activeChat) return;
    setPinnedChats(prev => {
      const up = { ...prev, [activeChat]: !prev[activeChat] };
      localStorage.setItem('engplus_pinned_chats', JSON.stringify(up));
      return up;
    });
    setShowChatOptions(false);
  };

  const handleToggleMuteChat = () => {
    if (!activeChat) return;
    setMutedChats(prev => {
      const up = { ...prev, [activeChat]: !prev[activeChat] };
      localStorage.setItem('engplus_muted_chats', JSON.stringify(up));
      return up;
    });
    setShowChatOptions(false);
  };

  const handleClearCurrentChat = () => {
    if (!activeChat) return;
    setChatsList((prev: any[]) => prev.map(c => c.id === activeChat ? { ...c, message: 'Nenhuma mensagem.', time: 'Limpo' } : c));
    setShowChatOptions(false);
  };

  const handleLeaveCurrentChat = () => {
    if (!activeChat) return;
    setChatsList((prev: any[]) => prev.filter(c => c.id !== activeChat));
    setActiveChat(null);
    setShowChatOptions(false);
  };

  // File attachments handlers
  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

    if (!ALLOWED_TYPES.includes(file.type)) {
      import('react-hot-toast').then(({ toast }) => {
        toast.error('Tipo de arquivo não suportado. Use JPG, PNG, WebP ou GIF.', { position: 'bottom-center' });
      });
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      import('react-hot-toast').then(({ toast }) => {
        toast.error('Arquivo muito grande. O limite é 5MB.', { position: 'bottom-center' });
      });
      return;
    }

    setAttachment(file);
    setAttachmentPreview(URL.createObjectURL(file));

    // Reset native input to support repeating same file
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Emoji picker handler
  const handleEmojiSelect = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachment) || !activeChat || isUploading) return;

    if (attachment) {
      setIsUploading(true);
      try {
        const { uploadChatMedia } = await import('../../lib/uploadChatMedia');
        const { url } = await uploadChatMedia(attachment, activeChat);
        await sendMessage(url, 'image');

        setAttachment(null);
        if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
        setAttachmentPreview(null);
      } catch (err: any) {
        import('react-hot-toast').then(({ toast }) => {
          toast.error(err.message || 'Falha no upload. Tente novamente.', { position: 'bottom-center' });
        });
        setIsUploading(false);
        return; // Stop if upload fails
      }
      setIsUploading(false);
    } else {
      await sendMessage(inputText.trim(), 'text');
    }

    setInputText('');

    // Update active row text in chat list overview
    setChatsList((prev: any[]) => prev.map(c =>
      c.id === activeChat
        ? { ...c, message: `Você enviou uma mensagem`, time: 'Agora', unread: 0 }
        : c
    ));
  };

  const handleCreateChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatName.trim()) return;

    const newId = chatsList.length > 0 ? Math.max(...chatsList.map((c: any) => c.id)) + 1 : 1;
    const isDirect = newChatType === 'direto';
    const init = newChatInitials.trim() || newChatName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    const newChatObj = {
      id: newId,
      name: newChatName.trim(),
      message: newChatFirstMsg.trim() ? newChatFirstMsg.trim() : 'Conversa iniciada.',
      time: 'Agora',
      unread: 0,
      color: newChatColor,
      initials: init.substring(0, 3),
      members: isDirect ? 0 : 4
    };

    setChatsList([newChatObj, ...chatsList]);
    setShowCreateChat(false);

    // Clear fields
    setNewChatName('');
    setNewChatInitials('');
    setNewChatFirstMsg('');
    setNewChatType('grupo');
    setNewChatColor('bg-gradient-to-tr from-blue-500 to-indigo-550');
  };

  if (activeChatData) {
    return (
      <div className={`flex flex-col h-full transition-colors duration-300 relative ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-[#F4F6F9] text-slate-800'}`}>

        {/* Chat Detail Header */}
        <div className={`px-4 pt-11 pb-3 flex items-center justify-between border-b shrink-0 z-10 ${isDarkMode ? 'bg-slate-900/90 border-slate-800/80 backdrop-blur-md' : 'bg-white/95 border-slate-200/60 backdrop-blur-sm shadow-xs'}`}>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                // Clear unreads
                setChatsList((prev: any[]) => prev.map(c => c.id === activeChat ? { ...c, unread: 0 } : c));
                setActiveChat(null);
                setShowChatOptions(false);
              }}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-655 hover:text-slate-950 hover:bg-slate-100'}`}
            >
              <ChevronLeft size={22} />
            </button>

            <div className={`w-10 h-10 rounded-2xl ${activeChatData.color} flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-md shadow-blue-500/10`}>
              {activeChatData.initials}
            </div>

            <div className="text-left">
              <div className="flex items-center gap-1">
                <h1 className={`text-xs font-black tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-805'}`}>
                  {activeChatData.name}
                </h1>
                {pinnedChats[activeChatData.id] && (
                  <Pin size={10} className="text-blue-550 dark:text-blue-400 rotate-45 fill-current shrink-0" />
                )}
                {mutedChats[activeChatData.id] && (
                  <BellOff size={10} className="text-slate-450 dark:text-slate-550 shrink-0" />
                )}
              </div>
              <p className={`text-[9.5px] font-bold mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {activeChatData.members > 0 ? `${activeChatData.members} online` : 'Mensagens diretas'}
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowChatOptions(!showChatOptions)}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                showChatOptions
                  ? isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-105 text-slate-950'
                  : isDarkMode ? 'text-slate-405 hover:text-white hover:bg-slate-800' : 'text-slate-555 hover:text-slate-805 hover:bg-slate-100'
              }`}
            >
              <MoreVertical size={18} />
            </button>

            {/* "3 Dots" Options popover with robust interactive links */}
            <AnimatePresence>
              {showChatOptions && (
                <>
                  <div className="fixed inset-0 z-[110]" onClick={() => setShowChatOptions(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 mt-2 w-48 rounded-2xl border p-1 rounded-t-lg shadow-xl z-[120] text-left ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-800 text-white shadow-slate-950/80'
                        : 'bg-white border-slate-200/80 text-slate-800 shadow-slate-205/40'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={handleTogglePinChat}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent text-left cursor-pointer`}
                    >
                      <Pin size={13} className={pinnedChats[activeChat] ? "text-blue-500 fill-current" : ""} />
                      {pinnedChats[activeChat] ? 'Desafixar topo' : 'Fixar no topo'}
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleMuteChat}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent text-left cursor-pointer`}
                    >
                      <BellOff size={13} className={mutedChats[activeChat] ? "text-amber-500" : ""} />
                      {mutedChats[activeChat] ? 'Ativar notificações' : 'Silenciar canal'}
                    </button>

                    <div className="border-t dark:border-slate-800 my-1" />

                    <button
                      type="button"
                      onClick={handleClearCurrentChat}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 hover:text-red-650 cursor-pointer`}
                    >
                      <Trash2 size={13} />
                      Limpar conversa
                    </button>

                    <button
                      type="button"
                      onClick={handleLeaveCurrentChat}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 hover:text-red-650 cursor-pointer`}
                    >
                      <LogOut size={13} />
                      Sair do canal
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Online Members Row (Only for group chats) */}
        {activeChatData.members > 0 && (
          <div className={`px-5 py-3.5 flex items-center justify-between shrink-0 gap-2 border-b overflow-x-auto no-scrollbar ${isDarkMode ? 'bg-slate-900/40 border-slate-800/60' : 'bg-white border-slate-150'}`}>
            {onlineMembers.map((member, i) => (
              <div
                key={i}
                onClick={() => {
                  setInputText(`@${member.name.toLowerCase()} `);
                }}
                className="flex flex-col items-center gap-1.5 cursor-pointer relative group shrink-0"
              >
                {/* Micro active green pulse indicator */}
                <div className="relative">
                  <div className={`w-9 h-9 rounded-full ${member.color} shadow-sm flex items-center justify-center text-white font-black text-xs transition-transform group-hover:scale-110 duration-200 border-2 ${isDarkMode ? 'border-slate-950' : 'border-white'}`}>
                    {member.initials}
                  </div>
                  {member.active && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                  )}
                </div>
                <span className={`text-[9px] font-bold ${isDarkMode ? 'text-slate-400 group-hover:text-blue-400' : 'text-slate-500 group-hover:text-blue-600'} transition-colors`}>
                  {member.handle}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Message Bubble Feed */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-left">
          <div className="text-center my-2 select-none">
            <span className={`px-3 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wider border ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-500' : 'bg-white border-slate-200/60 text-slate-400 shadow-3xs'}`}>
              🛡️ Criptografia Segura ponta-a-ponta
            </span>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <span className="text-slate-400 animate-pulse text-sm font-bold">Carregando histórico...</span>
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <span className="text-3xl mb-2.5">👋</span>
              <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Diga olá neste grupo!</p>
              <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-404'}`}>Anexe arquivos acadêmicos tocando no menu inferior de envelopes.</p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input Bottom Panel with Embedded Emoji Popover & Hidden native file inputs */}
        <div className={`px-4 py-3 border-t shrink-0 z-10 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          {typingUsers.length > 0 && (
            <div className="absolute -top-6 left-4 text-[10px] font-bold text-blue-500 animate-fade-in bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-t-lg backdrop-blur-sm border border-b-0 border-slate-200 dark:border-slate-800">
              {typingUsers.length === 1 ? `${typingUsers[0]} está digitando...` : `${typingUsers.join(' e ')} estão digitando...`}
            </div>
          )}
          {attachmentPreview && (
            <div className="absolute -top-16 left-4 animate-slide-up">
              <div className="relative group shadow-lg rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1">
                <img src={attachmentPreview} alt="Preview" className="h-12 w-auto max-w-[8rem] object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => {
                    setAttachment(null);
                    setAttachmentPreview(null);
                  }}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2 relative">

            {/* Interactive Custom Floating Emoji Picker Board */}
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
                        className="text-slate-400 hover:text-slate-600 text-[10px] font-bold"
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
                          className="hover:scale-125 transition-transform duration-100 p-1 flex items-center justify-center cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-base"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Input Form Bar wrapper */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 w-full">
              {/* Action attachments icon buttons */}
              <div className="flex gap-1 shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileAttachmentChange}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />
                <button
                  type="button"
                  data-testid="chat-attach-button"
                  onClick={handlePaperclipClick}
                  className={`p-2 rounded-full transition-all cursor-pointer ${
                    isDarkMode
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Anexar arquivo acadêmico"
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
                  data-testid="chat-input"
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => {
                      if (authUser?.username) {
                        sendTyping(authUser.username);
                      }
                    }, 500);
                  }}
                  placeholder="Digite sua mensagem acadêmica..."
                  className={`w-full rounded-2xl py-2 px-4 text-xs font-semibold outline-none border transition-all ${
                    isDarkMode
                      ? 'bg-slate-950 text-white placeholder-slate-500 border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10'
                      : 'bg-slate-100/90 text-slate-800 placeholder-slate-450 border-slate-250 focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-405/15'
                  }`}
                />
              </div>

              {/* Floating absolute send icon */}
              <button
                type="submit"
                data-testid="chat-send-button"
                disabled={(!inputText.trim() && !attachment) || isUploading}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  (inputText.trim() || attachment) && !isUploading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:scale-105 active:scale-95'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
              >
                {isUploading ? (
                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send size={13} fill={inputText.trim() || attachment ? "currentColor" : "none"} />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Chats filtering block
  const filteredChats = chatsList.filter((chat: any) => {
    // 1. Filter by active category filter pill
    if (activeFilter === 'Grupos' && chat.members === 0) return false;
    if (activeFilter === 'Diretos' && chat.members > 0) return false;
    if (activeFilter === 'Salvos' && chat.id !== 5) return false; // Simulated saving 'Projeto SAE'

    // 2. Filter by search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return chat.name.toLowerCase().includes(q) || chat.message.toLowerCase().includes(q);
    }
    return true;
  });

  // Pin priority sorting
  const sortedChats = [...filteredChats].sort((a: any, b: any) => {
    const isAPinned = pinnedChats[a.id] ? 1 : 0;
    const isBPinned = pinnedChats[b.id] ? 1 : 0;
    return isBPinned - isAPinned;
  });

  return (
    <div className={`flex flex-col h-full transition-colors duration-305 relative ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-[#F4F6F9] text-slate-800'}`}>

      {/* Header renamed from Canais de Comunicação to Chat */}
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

          {/* USER PROFILE AVATAR PLACED EXACTLY NEXT TO THE SEARCH MAGNIFYING GLASS */}
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
            onClick={() => setShowCreateChat(true)}
            className={`p-2 rounded-xl cursor-pointer transition-all hover:scale-105 active:scale-95 duration-200 ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'}`}
            aria-label="Criar Chat"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Modern Search Bar */}
      <div className="px-6 mb-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar canais ou mensagens..."
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

      {/* Chat List Card View with explicit Pin & Mute decorations */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {sortedChats.length > 0 ? (
          sortedChats.map((chat: any) => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              data-testid="chat-room-item"
              className={`flex items-center gap-3.5 p-3.5 rounded-3xl border transition-all cursor-pointer hover:-translate-y-0.5 relative ${
                isDarkMode
                  ? 'bg-slate-900 hover:bg-slate-850/80 border-slate-800 hover:border-slate-700 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-50/60 border-slate-200 hover:border-slate-300 text-slate-800 shadow-3xs hover:shadow-2xs'
              }`}
            >
              {/* Avatar Icon Panel */}
              <div className={`w-11 h-11 rounded-2xl ${chat.color} flex items-center justify-center text-white font-extrabold text-base shrink-0 shadow-sm relative`}>
                {chat.initials}
                {chat.unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-slate-900 animate-pulse"></span>
                )}
              </div>

              {/* Content text */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-baseline mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0 pr-2">
                    {pinnedChats[chat.id] && (
                      <Pin size={10} className="text-blue-500 shrink-0 rotate-45 fill-current" />
                    )}
                    <h3 className={`text-xs font-black tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {chat.name}
                    </h3>
                  </div>
                  <span className={`text-[9.5px] font-mono shrink-0 font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {chat.time}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-[11.5px] font-medium truncate pr-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {chat.message}
                  </p>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {mutedChats[chat.id] && (
                      <BellOff size={11} className="text-slate-450 dark:text-slate-500 shrink-0" />
                    )}
                    {chat.unread > 0 && (
                      <div className="px-1.5 py-0.5 rounded-full text-white text-[8.5px] font-mono font-black shrink-0 bg-red-500 leading-none">
                        {chat.unread}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-44 flex flex-col items-center justify-center text-center px-6">
            <span className="text-2xl mb-1.5">💬</span>
            <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nenhuma conversa no filtro anterior</p>
            <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Use os filtros acima ou inicie um novo canal acadêmico.</p>
          </div>
        )}
      </div>

      {/* Create Chat Modal Drawer */}
      {showCreateChat && (
        <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 backdrop-blur-xs flex items-end justify-center z-[130] h-full animate-fade-in">
          <div className={`w-full max-w-sm rounded-t-[2.2rem] border-t p-6 transition-colors duration-300 animate-slide-up ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white shadow-2xl' : 'bg-white border-slate-205 text-slate-800 shadow-xl'}`}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-slate-800/60 border-slate-100">
              <h3 className="font-extrabold text-[13px] tracking-tight text-blue-500">Criar Novo Canal de Chat</h3>
              <button
                onClick={() => setShowCreateChat(false)}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-150 text-slate-500'}`}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateChatSubmit} className="space-y-4 pb-3 text-left">
              <div>
                <label className={`block text-[9px] font-make font-extrabold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nome do Canal ou Usuário</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Engenharia de Controle"
                  value={newChatName}
                  onChange={(e) => {
                    setNewChatName(e.target.value);
                    const splitted = e.target.value.split(' ');
                    if (splitted.length > 0 && splitted[0]) {
                      const init = splitted.map(s => s[0]).slice(0, 2).join('').toUpperCase();
                      setNewChatInitials(init);
                    }
                  }}
                  className={`w-full rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-slate-950 text-white border border-slate-800' : 'bg-slate-100 text-slate-705'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[9px] font-make font-extrabold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Iniciais (Max 3)</label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="Ex: EC"
                    value={newChatInitials}
                    onChange={(e) => setNewChatInitials(e.target.value.toUpperCase())}
                    className={`w-full rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-slate-950 text-white border border-slate-800' : 'bg-slate-100 text-slate-705'}`}
                  />
                </div>
                <div>
                  <label className={`block text-[9px] font-make font-extrabold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tipo de Canal</label>
                  <select
                    value={newChatType}
                    onChange={(e) => setNewChatType(e.target.value as 'grupo' | 'direto')}
                    className={`w-full rounded-xl py-2 px-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-slate-950 text-white border border-slate-800' : 'bg-slate-100 text-slate-705'}`}
                  >
                    <option value="grupo">Grupo Acadêmico</option>
                    <option value="direto">Conversa Direta (1:1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-[9px] font-make font-extrabold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Escolha uma paleta visual</label>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  {[
                    'bg-gradient-to-tr from-blue-500 to-indigo-550',
                    'bg-gradient-to-tr from-rose-500 to-pink-500',
                    'bg-gradient-to-tr from-emerald-500 to-teal-600',
                    'bg-gradient-to-tr from-purple-500 to-indigo-505',
                    'bg-gradient-to-tr from-orange-500 to-amber-600',
                    'bg-gradient-to-tr from-indigo-900 to-slate-950'
                  ].map((colorClass) => (
                    <button
                      key={colorClass}
                      type="button"
                      onClick={() => setNewChatColor(colorClass)}
                      className={`w-6 h-6 rounded-lg ${colorClass} transition-all relative cursor-pointer ${newChatColor === colorClass ? 'ring-2 ring-offset-2 ring-blue-550 scale-110 shadow-xs' : 'scale-100'}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-[9px] font-make font-extrabold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Mensagem Inicial</label>
                <input
                  type="text"
                  placeholder="Ex: Sejam bem vindos ao canal!"
                  value={newChatFirstMsg}
                  onChange={(e) => setNewChatFirstMsg(e.target.value)}
                  className={`w-full rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-slate-950 text-white border border-slate-800' : 'bg-slate-100 text-slate-705'}`}
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateChat(false)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${isDarkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-850' : 'border-slate-200 text-slate-650 hover:bg-slate-100'}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-black transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer"
                >
                  Criar canal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
