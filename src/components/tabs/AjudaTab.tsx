import React, { useState } from 'react';
import { HelpCircle, ChevronRight, Info, Lightbulb, MessageSquare, X, ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';
import { UserProfile } from '../profile/ProfileModal';

interface AjudaTabProps {
  user: UserProfile;
  onOpenProfile: () => void;
  isDarkMode?: boolean;
}

export function AjudaTab({ user, onOpenProfile, isDarkMode = false }: AjudaTabProps) {
  const [selectedTopic, setSelectedTopic] = useState<{ title: string; desc: string; type: string } | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<string, 'util' | 'nautil'>>({});

  const handleFeedback = (topicTitle: string, status: 'util' | 'nautil') => {
    setFeedbacks(prev => ({ ...prev, [topicTitle]: status }));
  };

  const openTopic = (title: string, desc: string, type: string) => {
    setSelectedTopic({ title, desc, type });
  };

  const closeTopic = () => setSelectedTopic(null);

  return (
    <div className={`flex flex-col min-h-screen pb-8 relative transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between">
        <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Ajuda</h1>

        {/* USER PROFILE IN HELP HEADER */}
        <button
          onClick={onOpenProfile}
          className={`w-8 h-8 rounded-full overflow-hidden border flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${isDarkMode ? 'border-slate-750 bg-slate-800' : 'border-slate-200 bg-slate-100'}`}
          aria-label="Perfil do Usuário"
          id="profile-trigger-ajuda-header"
        >
          {user.avatar ? (
            <img src={user.avatar} referrerPolicy="no-referrer" alt="User Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className={`text-[11px] font-extrabold ${isDarkMode ? 'text-slate-300' : 'text-slate-750'}`}>
              {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
            </span>
          )}
        </button>
      </div>


      <div className="px-6 space-y-8">

        {/* Main Banner */}
        <div className="bg-blue-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-md">
          <div className="relative z-10 w-2/3">
            <h2 className="text-lg font-bold mb-2">Precisa de ajuda?</h2>
            <p className="text-blue-100 text-xs leading-relaxed">Encontre guias, tutoriais e perguntas frequentes.</p>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
            <HelpCircle size={100} />
          </div>
        </div>

        {/* Tutoriais e Guias */}
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-3 px-1">Tutoriais e Guias</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
            <button
              onClick={() => openTopic('Como usar o app', 'O aplicativo Eng+ consolida todas as frentes necessárias para o aluno. Na barra inferior você encontra: Início (Resumo), Sistema (SUAP e grades), Painel Info (Eventos e Núcleos), Mensagens (Chats das turmas) e a área de Ajuda.', 'Guia rápido')}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 transition-colors group"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Info size={14} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">Como usar o app</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Guia rápido para começar</p>
              </div>
              <div className="text-slate-300 group-hover:translate-x-1 transition-transform"><ChevronRight size={18} /></div>
            </button>

            <button
              onClick={() => openTopic('Dicas de Uso', 'Conecte seu calendário nativo nas configurações para sincronizar eventos da aba "Avisos". Mantenha seu curso e período atualizados no perfil para receber avisos da coordenação corretos no feed de notícias.', 'Dicas')}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 transition-colors group"
            >
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Lightbulb size={14} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-sm group-hover:text-orange-600 transition-colors">Dicas de Uso</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Aproveite todos os recursos</p>
              </div>
              <div className="text-slate-300 group-hover:translate-x-1 transition-transform"><ChevronRight size={18} /></div>
            </button>

            <button
              onClick={() => openTopic('Perguntas Frequentes', '1. O app é oficial? \nSim, é apoiado pelo centro acadêmico.\n2. Não vejo meus horários\nRe-sincronize seus dados com o SUAP na área de sistemas.\n3. Perdi minha senha\nVocê deve solicitar a redefinição de senha diretamente no próprio site do SUAP.', 'FAQ')}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 transition-colors group"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                ?
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">Perguntas Frequentes</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Tire suas dúvidas</p>
              </div>
              <div className="text-slate-300 group-hover:translate-x-1 transition-transform"><ChevronRight size={18} /></div>
            </button>

            <button
              onClick={() => openTopic('Fale Conosco', 'A equipe de suporte técnico e institucional do campus atende pelo e-mail: suporte@unespar.edu.br. O prazo médio de resposta é de até 48 horas úteis.', 'Contato')}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 transition-colors group"
            >
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <MessageSquare size={14} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-sm group-hover:text-purple-600 transition-colors">Fale Conosco</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Entre em contato com o suporte</p>
              </div>
              <div className="text-slate-300 group-hover:translate-x-1 transition-transform"><ChevronRight size={18} /></div>
            </button>
          </div>
        </div>

        {/* Categories based on description - added briefly for completeness based on spec, though image only shows tutorials */}
        <div className="space-y-4">
           {/* Section: MONETÁRIA */}
           <div>
             <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider px-1">Monetária</h3>
             <div className="bg-green-100/80 rounded-2xl p-2 space-y-2 border border-green-200/50">
                <button
                  onClick={() => openTopic('Auxílio Permanência', 'Bolsa oferecida a estudantes em vulnerabilidade social comprovada para garantir o andamento da graduação. \n\nRequisitos: Estar devidamente matriculado, ter renda per capita de até 1,5 salário mínimo e não possuir vínculo empregatício. \n\nOs editais abrem semestralmente. Em caso de dúvidas procurar o departamento de assistência.', 'Benefício Institucional')}
                  className="w-full bg-white/90 hover:bg-white rounded-xl p-3 flex justify-between items-center text-sm font-bold text-green-900 shadow-sm border border-transparent hover:border-green-200 transition-colors"
                >
                  <span className="flex items-center gap-2"><span>💸</span> Auxílio permanência</span>
                   <ChevronRight size={16} className="text-green-700/50" />
                </button>
                <button
                  onClick={() => openTopic('Auxílio Transporte', 'Subsídio financeiro ou passes estudantis para deslocamento entre residência e campus. \n\nDeve-se comprovar a necessidade de transporte público fretado ou intermunicipal. Alunos residentes na mesma cidade têm direito à meia-tarifa garantida por lei.', 'Benefício de Deslocamento')}
                  className="w-full bg-white/90 hover:bg-white rounded-xl p-3 flex justify-between items-center text-sm font-bold text-green-900 shadow-sm border border-transparent hover:border-green-200 transition-colors"
                >
                  <span className="flex items-center gap-2"><span>🚌</span> Auxílio transporte</span>
                   <ChevronRight size={16} className="text-green-700/50" />
                </button>
             </div>
           </div>

           {/* Section: PSICOLÓGICA */}
           <div>
             <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider px-1">Psicológica</h3>
             <div className="bg-purple-100/80 rounded-2xl p-2 space-y-2 border border-purple-200/50">
                <button
                  onClick={() => openTopic('Atendimento Gratuito', 'O campus fornece serviço de escuta psicológica, acolhimento e terapias breves gratuitas para os alunos. \n\nOs agendamentos são feitos via formulário institucional e encaminhados ao profissional responsável disponível durante os dias úteis.', 'Saúde Mental')}
                  className="w-full bg-white/90 hover:bg-white rounded-xl p-3 flex justify-between items-center text-sm font-bold text-purple-900 shadow-sm border border-transparent hover:border-purple-200 transition-colors"
                >
                  <span className="flex items-center gap-2"><span className="text-purple-600/80">🧠</span> Atendimento gratuito</span>
                   <ChevronRight size={16} className="text-purple-700/50" />
                </button>
                <button
                  onClick={() => openTopic('Grupos de Apoio', 'Roda de conversas semanais para gerenciar ansiedade, pressão de provas e adaptação à universidade, coordenadas pelo departamento de psicologia.', 'Comunidade')}
                  className="w-full bg-white/90 hover:bg-white rounded-xl p-3 flex justify-between items-center text-sm font-bold text-purple-900 shadow-sm border border-transparent hover:border-purple-200 transition-colors"
                >
                  <span className="flex items-center gap-2"><span className="text-purple-600/80">👥</span> Grupos de apoio</span>
                   <ChevronRight size={16} className="text-purple-700/50" />
                </button>
             </div>
           </div>
        </div>

      </div>

      {/* Styled Interactive Detail Modal Overlay */}
      {selectedTopic && (
        <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-900/40 backdrop-blur-xs flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-12 shadow-2xl animate-slide-up border-t border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{selectedTopic.type}</span>
              <button
                onClick={closeTopic}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                aria-label="Fecar modal"
              >
                <X size={16} />
              </button>
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-3">{selectedTopic.title}</h2>
            <div className="text-sm text-slate-600 leading-relaxed max-h-[40vh] overflow-y-auto mb-4 flex flex-col gap-3">
              {selectedTopic.desc.split('\n').map((paragraph, idx) => (
                paragraph.trim() !== '' ? <p key={idx}>{paragraph}</p> : null
              ))}
            </div>

            {/* Content Helpful Feedback Section */}
            <div className="border-t border-slate-100 pt-4 mt-2 mb-6">
              <p className="text-xs font-semibold text-slate-500 mb-3">Este conteúdo ajudou você?</p>
              {feedbacks[selectedTopic.title] ? (
                <div className="bg-emerald-50/50 border border-emerald-100 text-emerald-800 rounded-xl p-3 text-center text-xs font-semibold flex items-center justify-center gap-2 animate-fade-in">
                  <span>✨</span> Obrigado pelo seu feedback! {feedbacks[selectedTopic.title] === 'util' ? 'Ficamos felizes!' : 'Iremos melhorar o conteúdo.'}
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleFeedback(selectedTopic.title, 'util')}
                    className="flex-1 py-2.5 px-3 border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/10 text-slate-700 hover:text-emerald-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <ThumbsUp size={14} className="text-emerald-500" /> Útil
                  </button>
                  <button
                    onClick={() => handleFeedback(selectedTopic.title, 'nautil')}
                    className="flex-1 py-2.5 px-3 border border-slate-200 hover:border-red-200 hover:bg-red-50/10 text-slate-700 hover:text-red-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <ThumbsDown size={14} className="text-red-500" /> Não útil
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3">
               <button
                  onClick={closeTopic}
                  className="flex-1 py-3 bg-eng-blue text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition-colors"
                >
                  Entendi
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
