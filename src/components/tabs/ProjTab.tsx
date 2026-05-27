import React, { useState, useRef } from 'react';
import { Search, Plus, MoreHorizontal, X } from 'lucide-react';
import { UserProfile } from '../profile/ProfileModal';

interface ProjTabProps {
  user: UserProfile;
  onOpenProfile: () => void;
  isDarkMode?: boolean;
}

export function ProjTab({ user, onOpenProfile, isDarkMode = false }: ProjTabProps) {
  const [activeSegment, setActiveSegment] = useState<'andamento' | 'concluidos'>('andamento');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const initialProjects = [
    {
      id: 1,
      title: 'BAJA SAE',
      team: 'Equipe • 12 membros',
      desc: 'Desenvolvimento do protótipo para a competição Baja SAE.',
      progress: 60,
      imagePlaceholderColor: isDarkMode ? 'bg-slate-850' : 'bg-slate-800',
    },
    {
      id: 2,
      title: 'Ponte de Palitos',
      team: 'Grupo • 5 membros',
      desc: 'Projeto de resistência de materiais com palitos.',
      progress: 30,
      imagePlaceholderColor: isDarkMode ? 'bg-slate-750' : 'bg-slate-350',
    },
    {
      id: 3,
      title: 'Sistema de Irrigação',
      team: 'Equipe • 4 membros',
      desc: 'Automatização de irrigação com Arduino.',
      progress: 75,
      imagePlaceholderColor: isDarkMode ? 'bg-green-950/40' : 'bg-green-100',
    },
    {
      id: 4,
      title: 'Robô Seguidor de Linha',
      team: 'Grupo • 3 membros',
      desc: 'Competição interna de robótica. Campeão da edição de 2025!',
      progress: 100,
      imagePlaceholderColor: isDarkMode ? 'bg-purple-950/40' : 'bg-purple-100',
    }
  ];

  const [projectsList, setProjectsList] = useState(initialProjects);
  const [showCreateProj, setShowCreateProj] = useState(false);

  // Form fields
  const [newTitle, setNewTitle] = useState('');
  const [newTeam, setNewTeam] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProgress, setNewProgress] = useState(0);

  const handleSearchClick = () => {
    searchInputRef.current?.focus();
  };

  const handleCreateProjSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newId = projectsList.length > 0 ? Math.max(...projectsList.map(p => p.id)) + 1 : 1;
    const teamLabel = newTeam.trim() ? newTeam.trim() : 'Grupo • 1 membro';

    // Choose color dynamically
    const colors = ['bg-slate-700', 'bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-rose-600'];
    const randomColor = colors[newId % colors.length];

    const newProject = {
      id: newId,
      title: newTitle.trim(),
      team: teamLabel,
      desc: newDesc.trim() || 'Sem descrição fornecida.',
      progress: Math.min(100, Math.max(0, newProgress)),
      imagePlaceholderColor: randomColor
    };

    setProjectsList([newProject, ...projectsList]);
    setShowCreateProj(false);

    setNewTitle('');
    setNewTeam('');
    setNewDesc('');
    setNewProgress(0);
  };

  const filteredProjects = projectsList.filter((proj) => {
    // 1. Segment status filtering
    const isCompleted = proj.progress === 100;
    if (activeSegment === 'andamento' && isCompleted) return false;
    if (activeSegment === 'concluidos' && !isCompleted) return false;

    // 2. Search query filtering
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        proj.title.toLowerCase().includes(q) ||
        proj.team.toLowerCase().includes(q) ||
        proj.desc.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className={`flex flex-col min-h-full transition-colors duration-300 pb-8 relative ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white'}`}>
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between z-10">
        <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Projetos</h1>
        <div className="flex gap-3.5 items-center">
          {/* USER PROFILE AVATAR PLACED NEXT TO THE SEARCH LAYOUT SECTION */}
          <button
            onClick={onOpenProfile}
            className={`w-8 h-8 rounded-full overflow-hidden border flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${isDarkMode ? 'border-slate-750 bg-slate-800' : 'border-slate-200 bg-slate-100'}`}
            aria-label="Perfil do Usuário"
            id="profile-trigger-proj-header"
          >
            {user.avatar ? (
              <img src={user.avatar} referrerPolicy="no-referrer" alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className={`text-[11px] font-extrabold ${isDarkMode ? 'text-slate-350' : 'text-slate-650'}`}>
                {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowCreateProj(true)}
            className={`cursor-pointer hover:scale-105 transition-transform active:scale-95 ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
            aria-label="Criar Projeto"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 mb-6">
        <div className="relative">
          <button
            onClick={handleSearchClick}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 cursor-pointer flex items-center justify-center"
          >
            <Search size={18} />
          </button>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar projetos"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium ${isDarkMode ? 'bg-slate-950 text-white border border-slate-800 placeholder-slate-500' : 'bg-slate-100/80 text-slate-700'}`}
          />
        </div>
      </div>

      {/* Segmented Control / Tabs */}
      <div className="px-6 mb-6">
        <div className={`flex border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            onClick={() => setActiveSegment('andamento')}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
              activeSegment === 'andamento'
                ? isDarkMode ? 'text-blue-400' : 'text-eng-blue'
                : isDarkMode ? 'text-slate-500 hover:text-slate-350' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Em andamento
            {activeSegment === 'andamento' && (
              <div className={`absolute bottom-0 left-0 w-full h-0.5 rounded-t-full ${isDarkMode ? 'bg-blue-400' : 'bg-eng-blue'}`}></div>
            )}
          </button>
          <button
            onClick={() => setActiveSegment('concluidos')}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
              activeSegment === 'concluidos'
                ? isDarkMode ? 'text-blue-400' : 'text-eng-blue'
                : isDarkMode ? 'text-slate-500 hover:text-slate-350' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Concluídos
            {activeSegment === 'concluidos' && (
              <div className={`absolute bottom-0 left-0 w-full h-0.5 rounded-t-full ${isDarkMode ? 'bg-blue-400' : 'bg-eng-blue'}`}></div>
            )}
          </button>
        </div>
      </div>

      {/* Project Cards List */}
      <div className="px-6 space-y-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((proj) => (
            <div key={proj.id} className={`rounded-2xl p-5 shadow-sm border transition-colors ${isDarkMode ? 'bg-slate-950/40 border-slate-800/80' : 'bg-white border-slate-100'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-4">
                  <h3 className={`font-bold mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{proj.title}</h3>
                  <p className={`text-[11px] font-semibold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{proj.team}</p>
                  <p className={`text-xs leading-snug ${isDarkMode ? 'text-slate-300' : 'text-slate-650'}`}>{proj.desc}</p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button className={`transition-colors ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-300 hover:text-slate-500'}`}><MoreHorizontal size={18}/></button>
                  <div className={`w-16 h-16 rounded-xl ${proj.imagePlaceholderColor} flex items-center justify-center overflow-hidden font-extrabold text-white text-base shadow-xs`}>
                     {/* Fallback emoji dynamically chosen */}
                     <span>{proj.title.toLowerCase().includes('baja') ? '🏎️' : proj.title.toLowerCase().includes('ponte') ? '🌉' : proj.title.toLowerCase().includes('irrig') ? '🌱' : proj.title.toLowerCase().includes('robô') ? '🤖' : '📂'}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 flex items-center gap-3">
                <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${proj.progress}%` }}
                  ></div>
                </div>
                <span className={`text-[10px] font-bold w-8 text-right ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>{proj.progress}%</span>
              </div>
            </div>
          ))
        ) : (
          <div className="h-44 flex flex-col items-center justify-center text-center px-6">
            <span className="text-3xl mb-2">📂</span>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nenhum projeto encontrado</p>
          </div>
        )}
      </div>

      {/* Create Project Modal Dialog Drawer */}
      {showCreateProj && (
        <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 backdrop-blur-xs flex items-end justify-center z-[110] h-full animate-fade-in">
          <div className={`w-full max-w-sm rounded-t-3xl border-t p-6 transition-colors duration-300 animate-slide-up ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white shadow-2xl' : 'bg-white border-slate-200 text-slate-800 shadow-xl'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm font-sans">Cadastrar Novo Projeto</h3>
              <button
                onClick={() => setShowCreateProj(false)}
                className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-150 text-slate-500'}`}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProjSubmit} className="space-y-4 pb-6">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Título do Projeto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aerodesign SAE"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-slate-950 text-white border border-slate-800' : 'bg-slate-100 text-slate-700'}`}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Equipe / Grupo</label>
                <input
                  type="text"
                  placeholder="Ex: Equipe • 15 membros"
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value)}
                  className={`w-full rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-slate-950 text-white border border-slate-800' : 'bg-slate-100 text-slate-700'}`}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Insira detalhes rápidos sobre os objetivos do projeto..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className={`w-full rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none ${isDarkMode ? 'bg-slate-950 text-white border border-slate-800' : 'bg-slate-100 text-slate-700'}`}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`block text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Progresso Inicial</label>
                  <span className="text-[11px] font-bold text-blue-650">{newProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newProgress}
                  onChange={(e) => setNewProgress(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateProj(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${isDarkMode ? 'border-slate-850 text-slate-350 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-md font-sans"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
