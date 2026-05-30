import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface CreateRoomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  onRoomCreated: () => void;
  isDarkMode?: boolean;
}

export function CreateRoomDrawer({ isOpen, onClose, currentUserId, onRoomCreated, isDarkMode = false }: CreateRoomDrawerProps) {
  const [newChatName, setNewChatName] = useState('');
  const [newChatInitials, setNewChatInitials] = useState('');
  const [newChatType, setNewChatType] = useState<'grupo' | 'direto'>('grupo');
  const [newChatFirstMsg, setNewChatFirstMsg] = useState('');
  
  const [profiles, setProfiles] = useState<{ id: string; username: string | null }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Busca a lista de alunos quando o componente abrir
  useEffect(() => {
    if (isOpen) {
      const fetchProfiles = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username');
        if (data && !error) {
          // Filtra o usuário atual da lista
          const others = data.filter(p => p.id !== currentUserId);
          setProfiles(others);
          if (others.length > 0) {
            setSelectedUserId(others[0].id);
          }
        }
      };
      fetchProfiles();
    }
  }, [isOpen, currentUserId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isDirect = newChatType === 'direto';

    try {
      let newId = '';

      if (isDirect) {
        if (!selectedUserId || !currentUserId) return;
        const { data, error } = await supabase.rpc('create_dm', {
          user1_id: currentUserId,
          user2_id: selectedUserId,
        });
        
        if (error) throw error;
        // The RPC returns { id: 'dm_uuid_uuid' }
        newId = (data as { id: string }).id;
      } else {
        if (!newChatName.trim()) return;
        newId = newChatName.toLowerCase().trim().replace(/\s+/g, '-');
        const { error } = await supabase.from('rooms').insert({
          id: newId,
          name: newChatName.trim(),
          type: 'channel',
        });
        if (error) throw error;
      }

      if (newChatFirstMsg.trim() && currentUserId) {
        await supabase.from('messages').insert({
          room_id: newId,
          sender_id: currentUserId,
          content: newChatFirstMsg.trim(),
          type: 'text',
        });
      }

      onRoomCreated();
    } catch (err) {
      console.error('Erro ao criar sala:', err);
    }

    // Reset local state and close
    setNewChatName('');
    setNewChatInitials('');
    setNewChatFirstMsg('');
    setNewChatType('grupo');
    onClose();
  };

  return (
    <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 backdrop-blur-xs flex items-end justify-center z-[130] h-full animate-fade-in">
      <div className={`w-full max-w-sm rounded-t-[2.2rem] border-t p-6 transition-colors duration-300 animate-slide-up ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white shadow-2xl' : 'bg-white border-slate-205 text-slate-800 shadow-xl'}`}>
        <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-slate-800/60 border-slate-100">
          <h3 className="font-extrabold text-[13px] tracking-tight text-blue-500">Criar Novo Canal de Chat</h3>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-150 text-slate-500'}`}
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pb-3 text-left">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
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

          {newChatType === 'grupo' ? (
            <>
              <div>
                <label className={`block text-[9px] font-make font-extrabold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nome do Canal</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Engenharia de Controle"
                  value={newChatName}
                  onChange={(e) => {
                    setNewChatName(e.target.value);
                    const splitted = e.target.value.split(' ');
                    if (splitted.length > 0 && splitted[0]) {
                      const init = splitted.map((s: string) => s[0]).slice(0, 2).join('').toUpperCase();
                      setNewChatInitials(init);
                    }
                  }}
                  className={`w-full rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-slate-950 text-white border border-slate-800' : 'bg-slate-100 text-slate-705'}`}
                />
              </div>

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
            </>
          ) : (
            <div>
              <label className={`block text-[9px] font-make font-extrabold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Selecione o Aluno</label>
              <select
                required
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className={`w-full rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-slate-950 text-white border border-slate-800' : 'bg-slate-100 text-slate-705'}`}
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.username || 'Usuário ' + p.id.substring(0, 5)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={`block text-[9px] font-make font-extrabold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Mensagem Inicial (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Olá!"
              value={newChatFirstMsg}
              onChange={(e) => setNewChatFirstMsg(e.target.value)}
              className={`w-full rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-slate-950 text-white border border-slate-800' : 'bg-slate-100 text-slate-705'}`}
            />
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${isDarkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-850' : 'border-slate-200 text-slate-650 hover:bg-slate-100'}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl text-xs font-black transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer border-transparent"
            >
              {newChatType === 'grupo' ? 'Criar Grupo' : 'Iniciar Conversa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
