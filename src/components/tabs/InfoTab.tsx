import React, { useState } from 'react';
import { Calendar, Megaphone, BookOpen, Users, Clock, Lightbulb, Heart, Sparkles, X, Info } from 'lucide-react';
import { UserProfile } from '../profile/ProfileModal';
import { NotificationBell } from '../NotificationBell';

type SubView = 'coletivos' | 'mural';

interface InfoTabProps {
  user: UserProfile;
  onOpenProfile: () => void;
  isDarkMode?: boolean;
}

export function InfoTab({
  user,
  onOpenProfile,
  isDarkMode = false,
}: InfoTabProps) {
  const [currentSubView, setCurrentSubView] = useState<SubView>('coletivos');
  const [selectedItem, setSelectedItem] = useState<{ title: string; content: string; type: string } | null>(null);

  const openDetail = (title: string, content: string, type: string) => {
    setSelectedItem({ title, content, type });
  };

  const closeDetail = () => setSelectedItem(null);

  return (
    <div className={`flex flex-col min-h-screen pb-8 relative transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
      {/* Header */}
      <div className="px-6 pt-12 pb-2 flex items-center justify-between shrink-0">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Informações</h1>
          <p className={`text-[11.5px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {currentSubView === 'coletivos' ? 'Núcleos, coletivos e canais oficiais' : 'Mural e novidades do curso'}
          </p>
        </div>
        <div className="flex gap-2.5 items-center">
          {/* USER PROFILE AVATAR PLACED NEXT TO THE NOTIFICATIONS BELL / QUICK SEARCH */}
          <button
            onClick={onOpenProfile}
            className={`w-8 h-8 rounded-full overflow-hidden border flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${isDarkMode ? 'border-slate-750 bg-slate-800' : 'border-slate-200 bg-slate-100'}`}
            aria-label="Perfil do Usuário"
            id="profile-trigger-info-header"
          >
            {user.avatar ? (
              <img src={user.avatar} referrerPolicy="no-referrer" alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className={`text-[11px] font-extrabold ${isDarkMode ? 'text-slate-300' : 'text-slate-750'}`}>
                {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
              </span>
            )}
          </button>

          <NotificationBell isDarkMode={isDarkMode} />
        </div>
      </div>


      {/* Interactive Segmented Control */}
      <div className="px-6 my-4 shrink-0">
        <div className="flex bg-slate-200/60 p-1 rounded-xl">
          <button
            onClick={() => setCurrentSubView('coletivos')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              currentSubView === 'coletivos'
                ? 'bg-white text-eng-blue shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Canais & Coletivos
          </button>
          <button
            onClick={() => setCurrentSubView('mural')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              currentSubView === 'mural'
                ? 'bg-white text-eng-blue shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mural / Destaques
          </button>
        </div>
      </div>

      {/* Conditionally render screens based on Segmented Control */}
      <div className="flex-1 px-6">
        {currentSubView === 'coletivos' ? (
          /* VARIANT 1: 4 Large Pastel Blocks as strictly seen in image 2 */
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">

              {/* UNESPAR CARD */}
              <button
                onClick={() => openDetail('UNESPAR', 'O núcleo oficial da Unespar promove integrações acadêmicas, editais de permanência estudantil, palestras interdisciplinares e conexões oficiais com a reitoria do campus. Acesse editais e canais oficiais de comunicação para ficar por dentro.', 'unespar')}
                className="bg-sky-100/90 hover:bg-sky-100 active:scale-98 transition-all p-5 h-44 rounded-3xl text-left flex flex-col justify-between border border-sky-200/50 relative shadow-[0_4px_12px_rgba(3,105,161,0.04)]"
              >
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-sky-600 shadow-sm">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sky-900 text-lg tracking-tight">UNESPAR</h3>
                  <p className="text-[10px] text-sky-700/80 font-medium mt-0.5">Canal Acadêmico</p>
                </div>
              </button>

              {/* LGBT+ CARD */}
              <button
                onClick={() => openDetail('LGBT+', 'O coletivo LGBT+ da Engenharia promove um ambiente inclusivo, eventos de conscientização, debates sobre diversidade na tecnologia e canais de apoio aos alunos do campus.', 'lgbt')}
                className="bg-pink-100 hover:bg-pink-100/90 active:scale-98 transition-all p-5 h-44 rounded-3xl text-left flex flex-col justify-between border border-pink-200/50 relative shadow-[0_4px_12px_rgba(190,24,93,0.04)]"
              >
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-pink-600 shadow-sm">
                  <Heart size={20} className="fill-pink-100" />
                </div>
                <div>
                  <h3 className="font-bold text-pink-900 text-lg tracking-tight">LGBT+</h3>
                  <p className="text-[10px] text-pink-700/80 font-medium mt-0.5">Diversidade & Luta</p>
                </div>
              </button>

              {/* NÚCLEOS CARD */}
              <button
                onClick={() => openDetail('Núcleos', 'Grupos focados nas diferentes ramificações e áreas das engenharias. Aqui você encontra os núcleos de engenharia civil, elétrica, mecânica, aeroespacial e mais para projetos extracurriculares.', 'nucleos')}
                className="bg-emerald-100/90 hover:bg-emerald-100 active:scale-98 transition-all p-5 h-44 rounded-3xl text-left flex flex-col justify-between border border-emerald-200/50 relative shadow-[0_4px_12px_rgba(4,120,87,0.04)]"
              >
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900 text-lg tracking-tight">Núcleos</h3>
                  <p className="text-[10px] text-emerald-700/80 font-medium mt-0.5">Estudos & Projetos</p>
                </div>
              </button>

              {/* EVENTOS CARD */}
              <button
                onClick={() => openDetail('Eventos', 'Fique por dentro das datas mais importantes: feira de ciências, simpósios de engenharia, hackathons regionais e confraternizações integradas entre todos os semestres.', 'eventos')}
                className="bg-amber-100/80 hover:bg-amber-100 active:scale-98 transition-all p-5 h-44 rounded-3xl text-left flex flex-col justify-between border border-amber-200/40 relative shadow-[0_4px_12px_rgba(180,83,9,0.04)]"
              >
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-amber-600 shadow-sm">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 text-lg tracking-tight">Eventos</h3>
                  <p className="text-[10px] text-amber-700/80 font-medium mt-0.5">Calendário Acadêmico</p>
                </div>
              </button>

            </div>

            {/* Bottom info description capsule - strictly like mockup image 2 */}
            <div className="bg-blue-50/80 rounded-2xl p-4 flex gap-3 border border-blue-100/50 shadow-sm">
              <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-blue-700 leading-snug font-medium">
                Aqui ficam os núcleos da Unespar, LGBT+ e outros coletivos.
              </p>
            </div>
          </div>
        ) : (
          /* VARIANT 2: Destaques & Notícias do Curso from Notch Image 3 */
          <div className="space-y-6 animate-fade-in pb-8">
            <div>
              <h2 className="text-sm font-bold text-slate-800 mb-3 px-1">Destaques</h2>
              <div className="grid grid-cols-2 gap-4">

                <button
                  onClick={() => openDetail('Próximos Eventos', 'Lista de eventos completos e integrados no painel de calendário acadêmico.', 'eventos_destaque')}
                  className="bg-white p-4 rounded-2xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col items-center justify-center text-center gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-sm">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs">Eventos</h3>
                    <p className="text-[10px] text-slate-400 leading-tight mt-1">Datas acadêmicas</p>
                  </div>
                </button>

                <button
                  onClick={() => openDetail('Avisos Oficiais', 'Notificações urgentes lançadas pela comissão ou coordenação do curso.', 'avisos_destaque')}
                  className="bg-white p-4 rounded-2xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col items-center justify-center text-center gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-sm">
                    <Megaphone size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs">Avisos</h3>
                    <p className="text-[10px] text-slate-400 leading-tight mt-1">Sempre atualizados</p>
                  </div>
                </button>

                <button
                  onClick={() => openDetail('Grade de Disciplinas', 'Acesse e acompanhe as grades curriculares, ementas e salas presenciais.', 'disciplinas_destaque')}
                  className="bg-white p-4 rounded-2xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col items-center justify-center text-center gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center shadow-sm">
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs">Disciplinas</h3>
                    <p className="text-[10px] text-slate-400 leading-tight mt-1">Ementas completas</p>
                  </div>
                </button>

                <button
                  onClick={() => openDetail('Grupos de Estudos', 'Vagas abertas para novos grupos de estudo presenciais na biblioteca central.', 'grupos_destaque')}
                  className="bg-white p-4 rounded-2xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col items-center justify-center text-center gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-green-50 text-emerald-500 flex items-center justify-center shadow-sm">
                    <Users size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs">Grupos</h3>
                    <p className="text-[10px] text-slate-400 leading-tight mt-1">Entre em sintonia</p>
                  </div>
                </button>

              </div>
            </div>

            {/* Notícias do Curso */}
            <div>
              <h2 className="text-sm font-bold text-slate-800 mb-3 px-1">Notícias do Curso</h2>
              <div className="space-y-3">

                <button
                  onClick={() => openDetail('Semana da Engenharia 2024', 'As inscrições oficiais começam no próximo mês. Prepare-se para palestras inspiradoras, maratonas de código, workshops práticos com profissionais de renome nacional e torneios de robótica integrados.', 'noticia')}
                  className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 text-left hover:bg-slate-50/80 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 text-sm mb-0.5 leading-snug group-hover:text-blue-600 transition-colors">Semana da Engenharia 2024</h3>
                    <p className="text-xs text-slate-500 truncate leading-normal">Inscrições abertas para palestras e workshops.</p>
                    <div className="flex items-center text-[10px] text-slate-400 font-medium mt-1.5">
                      <Clock size={12} className="mr-1" /> 2h atrás
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => openDetail('Workshop LinkedIn para Engenheiros', 'Uma sessão prática de 2 horas para melhorar seu posicionamento, atrair recrutadores, criar portfólios no GitHub ou Behance aplicados ao mercado de engenharia de software e hardware de alta performance.', 'noticia')}
                  className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 text-left hover:bg-slate-50/80 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Lightbulb size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 text-sm mb-0.5 leading-snug group-hover:text-purple-600 transition-colors">Workshop: LinkedIn para Engenheiros</h3>
                    <p className="text-xs text-slate-500 truncate leading-normal">Aprenda a destacar seu perfil profissional.</p>
                    <div className="flex items-center text-[10px] text-slate-400 font-medium mt-1.5">
                      <Clock size={12} className="mr-1" /> 1 dia atrás
                    </div>
                  </div>
                </button>

              </div>
            </div>
          </div>
        )}
      </div>

      {/* Styled Interactive Detail Modal Overlay */}
      {selectedItem && (
        <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-900/40 backdrop-blur-xs flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-12 shadow-2xl animate-slide-up border-t border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{selectedItem.type}</span>
              <button
                onClick={closeDetail}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                aria-label="Fecar modal"
              >
                <X size={16} />
              </button>
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-3">{selectedItem.title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{selectedItem.content}</p>

            <div className="mt-8 flex gap-3">
              <button
                onClick={closeDetail}
                className="flex-1 py-3 bg-eng-blue text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition-colors"
              >
                Ativar Notificações
              </button>
              <button
                onClick={closeDetail}
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
