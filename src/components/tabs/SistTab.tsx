import React, { useState, useEffect } from 'react';
import { LayoutGrid, FileText, Calendar, ScrollText, Library, FlaskConical, HeadphonesIcon, ChevronRight, ChevronLeft, X, ExternalLink, Cog, Play, Pause, RotateCcw } from 'lucide-react';
import { UserProfile } from '../profile/ProfileModal';
import toast from 'react-hot-toast';

interface SistTabProps {
  user: UserProfile;
  onOpenProfile: () => void;
  isDarkMode?: boolean;
}

export function SistTab({ user, onOpenProfile, isDarkMode = false }: SistTabProps) {
  const [activeSystem, setActiveSystem] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<{ title: string; desc: string; type: string } | null>(null);

  // Dashboard & Utilities states for LayoutGrid (4 squares)
  const [showDashboard, setShowDashboard] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [grades, setGrades] = useState({ p1: '', p2: '', p3: '', p4: '' });
  const [crResult, setCrResult] = useState<number | null>(null);
  const [activeTabUtility, setActiveTabUtility] = useState<'shortcuts' | 'calculator' | 'timer'>('shortcuts');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  const handleCalculateCR = (e: React.FormEvent) => {
    e.preventDefault();
    const values = [
      parseFloat(grades.p1),
      parseFloat(grades.p2),
      parseFloat(grades.p3),
      parseFloat(grades.p4),
    ].filter((v) => !isNaN(v));

    if (values.length === 0) {
      setCrResult(0);
      return;
    }
    const sum = values.reduce((a, b) => a + b, 0);
    const cr = sum / values.length;
    setCrResult(parseFloat(cr.toFixed(2)));
  };

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  const systems = [
    { id: 1, title: 'Solicitações no Sistema SUAP', desc: 'Abra e acompanhe suas solicitações', icon: FileText, category: 'Sistema SUAP' },
    { id: 2, title: 'Horário de Aulas', desc: 'Confira os horários das disciplinas', icon: Calendar, category: 'Acadêmico' },
    { id: 3, title: 'Notas e Frequência', desc: 'Acesse suas notas e frequência', icon: ScrollText, category: 'Acadêmico' },
    { id: 4, title: 'Biblioteca', desc: 'Catálogo e empréstimos', icon: Library, category: 'Recursos' },
    { id: 5, title: 'Laboratórios', desc: 'Agendamentos e regras', icon: FlaskConical, category: 'Infraestrutura' },
    { id: 6, title: 'Serviços de TI', desc: 'Suporte e atendimento', icon: HeadphonesIcon, category: 'Suporte' },
  ];

  const handleOptionClick = (title: string, desc: string, type: string) => {
    setSelectedOption({ title, desc, type });
  };

  const closeOptionModal = () => setSelectedOption(null);

  const activeSysData = systems.find(s => s.id === activeSystem);

  if (activeSysData) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 pb-8 relative">
        {/* Detail Header */}
        <div className="px-4 pt-12 pb-4 flex items-start flex-col">
          <div className="flex w-full items-center justify-between mb-4">
             <button
                onClick={() => setActiveSystem(null)}
                className="p-1 -ml-1 text-slate-500 hover:text-slate-900 transition-colors"
                aria-label="Voltar"
              >
                <ChevronLeft size={24} />
              </button>
              <button className="text-slate-400 opacity-0 pointer-events-none"><LayoutGrid size={24} /></button>
          </div>
          <div className="px-2">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{activeSysData.title.replace(' no Sistema SUAP', '').replace(' de Aulas', '')}</h1>
            <p className="text-xs text-slate-500 mt-1">{activeSysData.category}</p>
          </div>
        </div>

        {/* Options List */}
        <div className="px-6 space-y-3 mt-4 flex-1">

          {activeSystem === 1 ? (
             <>
              <button
                onClick={() => handleOptionClick('Como fazer', 'Acesse o portal SUAP, entre com suas credenciais, acesse o menu Estudante > Requerimentos e preencha todos os dados obrigatórios no formulário da secretaria acadêmica.', 'Guia Passo a Passo')}
                className="w-full bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between text-left hover:bg-slate-50 transition-colors active:bg-slate-100 group"
              >
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">Como fazer</h3>
                  <p className="text-[11px] text-slate-500">Passo a passo para abrir uma solicitação no SUAP.</p>
                </div>
                <div className="text-slate-300 ml-4 shrink-0 group-hover:translate-x-1 transition-transform">
                  <ChevronRight size={20} />
                </div>
              </button>

              <button
                onClick={() => handleOptionClick('Quando solicitar', 'Você pode utilizar o SUAP para trancamento de matrícula (até o 1º mês letivo), solicitação de prova substitutiva (até 48h pós-prova), validação de atividades complementares e revisão de nota.', 'Regras')}
                className="w-full bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between text-left hover:bg-slate-50 transition-colors active:bg-slate-100 group"
              >
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm mb-1 group-hover:text-amber-600 transition-colors">Quando solicitar</h3>
                  <p className="text-[11px] text-slate-500">Prazos e situações em que faz sentido pedir.</p>
                </div>
                <div className="text-slate-300 ml-4 shrink-0 group-hover:translate-x-1 transition-transform">
                  <ChevronRight size={20} />
                </div>
              </button>

              <button
                onClick={() => handleOptionClick('Links úteis', 'O SUAP fornece diversos serviços. Você será redirecionado para a plataforma oficial do Governo e do Campus. Certifique-se de estar com seu login em mãos.', 'Redirecionamento')}
                className="w-full bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between text-left hover:bg-slate-50 transition-colors active:bg-slate-100 group"
              >
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm mb-1 group-hover:text-emerald-600 transition-colors">Links úteis</h3>
                  <p className="text-[11px] text-slate-500">Atalhos diretos para os formulários do sistema.</p>
                </div>
                <div className="text-slate-300 ml-4 shrink-0 group-hover:translate-x-1 transition-transform">
                  <ChevronRight size={20} />
                </div>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center h-full opacity-60">
               <Cog size={48} className="text-slate-300 mb-4 animate-spin-slow" />
               <h3 className="text-lg font-bold text-slate-700">Módulo em Integração</h3>
               <p className="text-xs text-slate-500 mt-2 max-w-[200px]">As funções deste sistema estão sendo conectadas à API da faculdade.</p>
            </div>
          )}

        </div>

        {/* Modal Overlay for System Detail */}
        {selectedOption && (
          <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-900/40 backdrop-blur-xs flex items-end justify-center z-50">
            <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-12 shadow-2xl animate-slide-up border-t border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{selectedOption.type}</span>
                <button
                  onClick={closeOptionModal}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                  aria-label="Fecar modal"
                >
                  <X size={16} />
                </button>
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-3">{selectedOption.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed max-h-[40vh] overflow-y-auto mb-6">
                {selectedOption.desc}
              </p>

              <div className="flex gap-3">
                {selectedOption.title === 'Links úteis' ? (
                  <button
                    onClick={closeOptionModal}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Abrir no Navegador <ExternalLink size={14} />
                  </button>
                ) : (
                  <button
                    onClick={closeOptionModal}
                    className="flex-1 py-3 bg-eng-blue text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition-colors"
                  >
                    Entendido
                  </button>
                )}
                <button
                  onClick={closeOptionModal}
                  className="py-3 px-6 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen pb-8 relative transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between">
        <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Sistemas</h1>
        <div className="flex gap-3 items-center">
          {/* USER PROFILE IN SYSTEMS HEADER */}
          <button
            onClick={onOpenProfile}
            className={`w-8 h-8 rounded-full overflow-hidden border flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${isDarkMode ? 'border-slate-750 bg-slate-800' : 'border-slate-200 bg-slate-100'}`}
            aria-label="Perfil do Usuário"
            id="profile-trigger-sist-header"
          >
            {user.avatar ? (
              <img src={user.avatar} referrerPolicy="no-referrer" alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className={`text-[11px] font-extrabold ${isDarkMode ? 'text-slate-305' : 'text-slate-700'}`}>
                {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowDashboard(true)}
            className={`cursor-pointer hover:scale-110 active:scale-95 transition-transform flex items-center justify-center p-1.5 rounded-lg ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-150/65'}`}
            title="Dashboard de Recursos"
            aria-label="Minisistemas e Métricas"
          >
            <LayoutGrid size={24} />
          </button>
        </div>
      </div>

      {/* Systems List */}
      <div className="px-4 space-y-3">
        {systems.map((sys) => {
          const Icon = sys.icon;
          return (
            <button
              key={sys.id}
              onClick={() => setActiveSystem(sys.id)}
              className={`w-full p-4 rounded-2xl shadow-sm border flex items-center gap-4 text-left transition-colors active:scale-98 group cursor-pointer ${isDarkMode ? 'bg-slate-950 border-slate-800 hover:bg-slate-800/40 text-white' : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-800'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border group-hover:bg-blue-50/20 group-hover:text-blue-400 transition-colors shrink-0 ${isDarkMode ? 'bg-slate-900 border-slate-850 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                <Icon size={24} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-sm mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{sys.title}</h3>
                <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{sys.desc}</p>
              </div>
              <div className="text-slate-300">
                <ChevronRight size={20} />
              </div>
            </button>
          )
        })}
      </div>

      {/* Utilities Dashboard Drawer (4 Squares Button) */}
      {showDashboard && (
        <div className="absolute inset-x-0 bottom-0 bg-slate-950/85 backdrop-blur-xs flex items-end justify-center z-[110] h-full animate-fade-in">
          <div className={`w-full max-w-sm rounded-t-3xl border-t p-6 transition-colors duration-300 animate-slide-up ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white shadow-2xl' : 'bg-white border-slate-200 text-slate-800 shadow-xl'}`}>
            <div className="flex justify-between items-center mb-4 pb-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <LayoutGrid size={18} className="text-blue-500" />
                <h3 className="font-extrabold text-[13px] tracking-tight">Painel de Utilidades Eng+</h3>
              </div>
              <button
                onClick={() => setShowDashboard(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-150 text-slate-500'}`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Sub-tabs within Utilities Drawer */}
            <div className={`flex p-1 rounded-xl mb-4 border ${isDarkMode ? 'bg-slate-950/60 border-slate-805' : 'bg-slate-100/80 border-slate-200/55'}`}>
              <button
                onClick={() => setActiveTabUtility('shortcuts')}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeTabUtility === 'shortcuts'
                    ? isDarkMode ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50' : 'bg-white text-eng-blue shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Atalhos
              </button>
              <button
                onClick={() => setActiveTabUtility('calculator')}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeTabUtility === 'calculator'
                    ? isDarkMode ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50' : 'bg-white text-eng-blue shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Calculadora CR
              </button>
              <button
                onClick={() => setActiveTabUtility('timer')}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeTabUtility === 'timer'
                    ? isDarkMode ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50' : 'bg-white text-eng-blue shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Foco e Estudo
              </button>
            </div>

            {/* Tab 1: Shortcuts */}
            {activeTabUtility === 'shortcuts' && (
              <div className="space-y-3 animate-fade-in text-left">
                <p className={`text-[10px] leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-2`}>
                  Atalhos de sistemas e informações vitais para engenheiros:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://suap.ifsp.edu.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all hover:scale-[1.03] active:scale-95 cursor-pointer ${isDarkMode ? 'bg-slate-950 border-slate-800 hover:bg-slate-850' : 'bg-slate-50 border-slate-150 hover:bg-slate-100'}`}
                  >
                    <span className="text-xl mb-1">🔗</span>
                    <span className="text-[10px] font-bold text-blue-500">Acessar SUAP</span>
                  </a>

                  <button
                    onClick={() => {
                      toast("Prazos do Período:\n- Limite Trancamento: 15/06\n- Provas Integradas: 22/06 a 29/06\n- Encerramento do Bloco: 05/07");
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all hover:scale-[1.03] active:scale-95 cursor-pointer ${isDarkMode ? 'bg-slate-950 border-slate-805 hover:bg-slate-850' : 'bg-slate-50 border-slate-150 hover:bg-slate-100'}`}
                  >
                    <span className="text-xl mb-1">📅</span>
                    <span className="text-[10px] font-bold">Calendários</span>
                  </button>

                  <button
                    onClick={() => {
                      toast("Local das Provas e Exercícios Anteriores:\nUtilize o canal de Arquivos no Teams ou a nossa pasta de repositório de Engenharia no Drive do campus.");
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all hover:scale-[1.03] active:scale-95 cursor-pointer ${isDarkMode ? 'bg-slate-950 border-slate-805 hover:bg-slate-850' : 'bg-slate-50 border-slate-150 hover:bg-slate-100'}`}
                  >
                    <span className="text-xl mb-1">📂</span>
                    <span className="text-[10px] font-bold">Provas Antigas</span>
                  </button>

                  <button
                    onClick={() => {
                      toast("Secretaria de Engenharia:\n- Email: sec.eng@fct.edu\n- Coordenação Geral: coord.grad@fct.edu\n- WhatsApp Apoio Acadêmico: (11) 98765-4321");
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all hover:scale-[1.03] active:scale-95 cursor-pointer ${isDarkMode ? 'bg-slate-950 border-slate-805 hover:bg-slate-850' : 'bg-slate-50 border-slate-150 hover:bg-slate-100'}`}
                  >
                    <span className="text-xl mb-1">☎️</span>
                    <span className="text-[10px] font-bold">Contatos Apoio</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: CR Calculator */}
            {activeTabUtility === 'calculator' && (
              <form onSubmit={handleCalculateCR} className="space-y-3 animate-fade-in text-left">
                <p className={`text-[10px] leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-2`}>
                  Média Aritmética Preliminar (Insira suas notas parciais):
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">Nota P1</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="0.0"
                      value={grades.p1}
                      onChange={(e) => setGrades({...grades, p1: e.target.value})}
                      className={`w-full rounded-lg py-1.5 px-3 text-xs font-semibold outline-none border ${isDarkMode ? 'bg-slate-950 border-slate-805 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'}`}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">Nota P2</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="0.0"
                      value={grades.p2}
                      onChange={(e) => setGrades({...grades, p2: e.target.value})}
                      className={`w-full rounded-lg py-1.5 px-3 text-xs font-semibold outline-none border ${isDarkMode ? 'bg-slate-950 border-slate-805 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'}`}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">Nota P3</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="0.0"
                      value={grades.p3}
                      onChange={(e) => setGrades({...grades, p3: e.target.value})}
                      className={`w-full rounded-lg py-1.5 px-3 text-xs font-semibold outline-none border ${isDarkMode ? 'bg-slate-950 border-slate-805 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'}`}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">Nota P4</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="0.0"
                      value={grades.p4}
                      onChange={(e) => setGrades({...grades, p4: e.target.value})}
                      className={`w-full rounded-lg py-1.5 px-3 text-xs font-semibold outline-none border ${isDarkMode ? 'bg-slate-950 border-slate-805 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'}`}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1.5">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                  >
                    Calcular Média
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGrades({p1: '', p2: '', p3: '', p4: ''});
                      setCrResult(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${isDarkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-850' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    Reset
                  </button>
                </div>

                {crResult !== null && (
                  <div className={`p-3 rounded-lg flex items-center justify-between border mt-2 ${crResult >= 6.0 ? (isDarkMode ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700') : (isDarkMode ? 'bg-red-950/20 border-red-900/20 text-red-400' : 'bg-red-50 border-red-100 text-red-655')}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{crResult >= 6.0 ? '🎉' : '📚'}</span>
                      <div className="text-[10px] font-bold">Média Estimada:</div>
                    </div>
                    <div className="text-xs font-black text-right">{crResult} / 10</div>
                  </div>
                )}
              </form>
            )}

            {/* Tab 3: Study Stopwatch Focus Timer */}
            {activeTabUtility === 'timer' && (
              <div className="flex flex-col items-center text-center space-y-3 animate-fade-in">
                <p className={`text-[10px] leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-1`}>
                  Foco em Estudos e Laboratório: Meça suas sessões de autocontrole de forma limpa.
                </p>

                <div className={`w-36 py-2.5 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800 text-blue-400' : 'bg-slate-100 border-slate-200 text-slate-800'} font-mono text-xl font-bold tracking-wider mb-2`}>
                  {formatTime(timerSeconds)}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTimerActive(!timerActive)}
                    className={`flex items-center gap-1.5 py-1.5 px-4 rounded-lg text-xs font-bold text-white transition-all shadow-xs cursor-pointer ${timerActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  >
                    {timerActive ? (
                      <>
                        <Pause size={12} fill="currentColor" /> Pausar
                      </>
                    ) : (
                      <>
                        <Play size={12} fill="currentColor" /> Iniciar
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTimerActive(false);
                      setTimerSeconds(0);
                    }}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${isDarkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-850' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    <RotateCcw size={12} /> Reiniciar
                  </button>
                </div>

                {timerSeconds > 0 && !timerActive && (
                  <p className="text-[10px] font-semibold text-blue-500 mt-2 animate-pulse">
                    🎓 Foco mantido! Excelente progresso de estudo.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => setShowDashboard(false)}
              className="w-full py-2.5 mt-5 rounded-xl text-xs font-bold transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer"
            >
              Fechar Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
