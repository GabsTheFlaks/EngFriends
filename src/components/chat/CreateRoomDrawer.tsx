import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateRoomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, initials: string, type: 'grupo' | 'direto', firstMsg: string) => void;
  isDarkMode?: boolean;
}

export function CreateRoomDrawer({
  isOpen,
  onClose,
  onSubmit,
  isDarkMode = false
}: CreateRoomDrawerProps) {
  const [newChatName, setNewChatName] = useState('');
  const [newChatInitials, setNewChatInitials] = useState('');
  const [newChatType, setNewChatType] = useState<'grupo' | 'direto'>('grupo');
  const [newChatFirstMsg, setNewChatFirstMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newChatName, newChatInitials, newChatType, newChatFirstMsg);
    // Reset form
    setNewChatName('');
    setNewChatInitials('');
    setNewChatType('grupo');
    setNewChatFirstMsg('');
  };

  return (
    <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 backdrop-blur-xs flex items-end justify-center z-[130] h-full animate-fade-in">
      <div className={`w-full max-w-sm rounded-t-[2.2rem] border-t p-6 transition-colors duration-300 animate-slide-up ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white shadow-2xl' : 'bg-white border-slate-205 text-slate-800 shadow-xl'}`}>
        <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-slate-800/60 border-slate-100">
          <h3 className="font-extrabold text-[13px] tracking-tight text-blue-500">Criar Novo Canal de Chat</h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-150 text-slate-500'}`}
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pb-3 text-left">
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
              onClick={onClose}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${isDarkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-850' : 'border-slate-200 text-slate-650 hover:bg-slate-100'}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl text-xs font-black transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer border-transparent"
            >
              Criar canal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
