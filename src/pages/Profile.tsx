import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  LogOut, 
  Check, 
  Loader2, 
  Award, 
  BookOpen, 
  Clock, 
  GraduationCap, 
  ShieldAlert, 
  Trash2, 
  Sun, 
  Moon, 
  KeyRound, 
  User, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { AvatarPicker } from '../components/AvatarPicker';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'motion/react';

interface ProfilePageProps {
  user: import('@supabase/supabase-js').User | null;
  signOut: () => void;
  onBack: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onProfileUpdate?: (updatedData: {
    username: string;
    avatar_index: number;
    ra: string;
    course: string;
    period: string;
  }) => void;
}

type TabType = 'identidade' | 'senha' | 'status' | 'perigo';

export function Profile({ 
  user, 
  signOut, 
  onBack, 
  isDarkMode = false,
  onToggleDarkMode,
  onProfileUpdate
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('identidade');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [usernameInput, setUsernameInput] = useState('');
  const [raInput, setRaInput] = useState('');
  const [courseInput, setCourseInput] = useState('');
  const [periodInput, setPeriodInput] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchProfileData = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('username, avatar_index, ra, course, period')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          setSelectedIndex(data.avatar_index ?? 0);
          setUsernameInput(data.username || '');
          setRaInput(data.ra || '2026.0000.01');
          setCourseInput(data.course || 'Engenharia de Software');
          setPeriodInput(data.period || '1º Período • Integral');
        } else {
          // Fallback initial insert
          const defaultProfile = {
            id: user.id,
            username: user.user_metadata?.username || user.email?.split('@')[0] || 'Aluno',
            avatar_index: 0,
            ra: '2026.0000.01',
            course: 'Engenharia de Software',
            period: '1º Período • Integral'
          };
          await supabase.from('profiles').insert(defaultProfile);
          setSelectedIndex(0);
          setUsernameInput(defaultProfile.username);
          setRaInput(defaultProfile.ra);
          setCourseInput(defaultProfile.course);
          setPeriodInput(defaultProfile.period);
        }
      } catch (err) {
        console.error('Falha ao carregar perfil Supabase', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      // Removendo upsert e voltando para update clássico para isolar a política de INSERT
      const { error } = await supabase
        .from('profiles')
        .update({
          username: usernameInput,
          avatar_index: selectedIndex,
          ra: raInput,
          course: courseInput,
          period: periodInput
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Perfil salvo com sucesso!');
      
      const updatedProfile = {
        username: usernameInput,
        avatar_index: selectedIndex,
        ra: raInput,
        course: courseInput,
        period: periodInput
      };

      // Trigger instant parent state synchronization
      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }
    } catch (err) {
      console.error('Erro no Supabase ao salvar:', err);
      toast.error('Erro ao salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      toast.error('A nova senha e a confirmação não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      toast.success('Senha atualizada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      const friendlyErr = err instanceof Error ? err.message : 'Erro ao alterar a senha.';
      toast.error(friendlyErr);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      setShowLogoutConfirm(false);
      await signOut();
      toast.success('Sessão encerrada.');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao sair.');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'}`}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold tracking-tight opacity-75">Carregando dados do Supabase...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-[100dvh] w-full transition-colors duration-300 flex justify-center ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'}`}>
      <div className={`w-full max-w-md relative flex flex-col h-full transition-colors duration-300 shadow-2xl ${isDarkMode ? 'bg-slate-900 border-x border-slate-800' : 'bg-white border-x border-slate-100'}`}>
        
        {/* Profile Header */}
        <div className={`px-4 pt-11 pb-4 flex items-center justify-between border-b shrink-0 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-150'}`}>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'}`}
              aria-label="Voltar"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="flex items-center gap-2">
              <GraduationCap className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} size={22} />
              <h1 className={`text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Perfil</h1>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'text-red-400 hover:bg-red-950/20' : 'text-red-500 hover:bg-red-50'}`}
            title="Sair da Conta"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Sub-tabs Navigation */}
        <div className={`flex p-1 mx-4 mt-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/50 border-slate-800/80' : 'bg-slate-100/70 border-slate-200/50'}`}>
          {(['identidade', 'senha', 'status', 'perigo'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-center py-2 text-[10.5px] font-black rounded-lg capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? isDarkMode
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-white text-slate-900 shadow-sm border border-slate-200/40'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-24 text-left">
          
          {/* TAB 1: IDENTIDADE */}
          {activeTab === 'identidade' && (
            <div className="space-y-5">
              {/* Dark Theme Toggle Card */}
              {onToggleDarkMode && (
                <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-none">Tema Escuro</h4>
                      <span className={`text-[9.5px] mt-1 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Melhora a visualização noturna</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleDarkMode}
                    className={`w-11 h-6 rounded-full p-1 transition-all duration-200 outline-none cursor-pointer ${
                      isDarkMode ? 'bg-blue-600 flex-row-reverse' : 'bg-slate-200 dark:bg-slate-800 flex-row'
                    } flex items-center`}
                  >
                    <span className="w-4 h-4 bg-white rounded-full shadow-md transition-all" />
                  </button>
                </div>
              )}

              {/* Avatar Section & Current Profile Preview */}
              <div className={`p-4 rounded-2xl flex items-center gap-4 border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 shadow-sm border-white dark:border-slate-800 bg-slate-100 flex items-center justify-center shrink-0">
                  <img
                    src={`/avatars/avatar_${selectedIndex}.png`}
                    alt="Avatar atual"
                    className="w-full h-full object-cover select-none"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-black text-sm truncate">{usernameInput || 'Nome do Aluno'}</h2>
                  <p className={`text-[10px] font-mono mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>RA: {raInput || '2026.0000.01'}</p>
                  <p className={`text-xs font-semibold mt-1 truncate ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>{courseInput || 'Engenharia de Software'}</p>
                  <p className={`text-[9.5px] mt-0.5 font-bold ${isDarkMode ? 'text-slate-550' : 'text-slate-500'}`}>{periodInput || '1º Período'}</p>
                </div>
              </div>

              {/* Form de Dados */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <AvatarPicker
                  selectedIndex={selectedIndex}
                  onSelect={setSelectedIndex}
                  isDarkMode={isDarkMode}
                />

                <div className={`border-t my-4 pt-4 ${isDarkMode ? 'border-slate-800/80' : 'border-slate-100'}`} />

                <div className="space-y-3.5">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>NOME COMPLETO</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Seu nome no aplicativo"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        className={`w-full rounded-xl py-2.5 px-4 text-xs font-semibold outline-none border transition-all ${
                          isDarkMode 
                            ? 'bg-slate-950 border-slate-800 focus:border-blue-500 text-white' 
                            : 'bg-white border-slate-200 focus:border-blue-500 text-slate-800'
                        }`}
                      />
                      <User size={14} className="absolute right-3.5 top-3.5 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>R.A.</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 2024.12039.04"
                      value={raInput}
                      onChange={(e) => setRaInput(e.target.value)}
                      className={`w-full rounded-xl py-2.5 px-4 text-xs font-mono font-semibold outline-none border transition-all ${
                        isDarkMode 
                          ? 'bg-slate-950 border-slate-800 focus:border-blue-500 text-white' 
                          : 'bg-white border-slate-200 focus:border-blue-500 text-slate-800'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Curso</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Engenharia de Software"
                      value={courseInput}
                      onChange={(e) => setCourseInput(e.target.value)}
                      className={`w-full rounded-xl py-2.5 px-4 text-xs font-semibold outline-none border transition-all ${
                        isDarkMode 
                          ? 'bg-slate-950 border-slate-800 focus:border-blue-500 text-white' 
                          : 'bg-white border-slate-200 focus:border-blue-500 text-slate-800'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Período</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 5º Período • Integral"
                      value={periodInput}
                      onChange={(e) => setPeriodInput(e.target.value)}
                      className={`w-full rounded-xl py-2.5 px-4 text-xs font-semibold outline-none border transition-all ${
                        isDarkMode 
                          ? 'bg-slate-950 border-slate-800 focus:border-blue-500 text-white' 
                          : 'bg-white border-slate-200 focus:border-blue-500 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" fullWidth disabled={saving} className="group">
                    {saving ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-1.5" /> Salvando...
                      </>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        <Check size={14} />
                        <span>Confirmar Alterações</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SENHA */}
          {activeTab === 'senha' && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>SENHA ATUAL</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    placeholder="Informe a senha atual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`w-full rounded-xl py-2.5 px-4 pr-10 text-xs font-semibold outline-none border transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 focus:border-blue-500 text-white' 
                        : 'bg-white border-slate-200 focus:border-blue-500 text-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>NOVA SENHA</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full rounded-xl py-2.5 px-4 pr-10 text-xs font-semibold outline-none border transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 focus:border-blue-500 text-white' 
                        : 'bg-white border-slate-200 focus:border-blue-500 text-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>CONFIRMAR NOVA SENHA</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full rounded-xl py-2.5 px-4 pr-10 text-xs font-semibold outline-none border transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 focus:border-blue-500 text-white' 
                        : 'bg-white border-slate-200 focus:border-blue-500 text-slate-800'
                    }`}
                  />
                  <KeyRound size={14} className="absolute right-3.5 top-3.5 text-slate-400" />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" fullWidth disabled={changingPassword}>
                  {changingPassword ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-1.5" /> Atualizando...
                    </>
                  ) : (
                    <span>Alterar Senha do App</span>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 3: STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <span className={`block text-[10.5px] font-extrabold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>RENDIMENTO E HISTÓRICO</span>
              
              {/* TODO: substituir por dados reais do banco quando disponível */}
              <div className="grid grid-cols-2 gap-3.5">
                
                {/* CR Geral */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[110px] ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800/80 shadow-md' : 'bg-slate-50/80 border-slate-100 shadow-sm'
                }`}>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Award size={16} className="text-blue-500 shrink-0" />
                    <span className="text-[8px] uppercase tracking-wider font-extrabold">MÉDIA GERAL (CR)</span>
                  </div>
                  <p className="text-2xl font-black mt-2 leading-none text-slate-900 dark:text-white">8.9</p>
                  <span className="text-[8.5px] font-bold text-slate-400 mt-2 truncate">Top 5% da turma</span>
                </div>

                {/* Materiais Concluídos */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[110px] ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800/80 shadow-md' : 'bg-slate-50/80 border-slate-100 shadow-sm'
                }`}>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <BookOpen size={16} className="text-emerald-500 shrink-0" />
                    <span className="text-[8px] uppercase tracking-wider font-extrabold">MATÉRIAS CONCLUÍDAS</span>
                  </div>
                  <p className="text-2xl font-black mt-2 leading-none text-slate-900 dark:text-white">74%</p>
                  <span className="text-[8.5px] font-bold text-slate-400 mt-2 truncate">32 matérias listadas</span>
                </div>

                {/* Progresso de Carga */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[110px] ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800/80 shadow-md' : 'bg-slate-50/80 border-slate-100 shadow-sm'
                }`}>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={16} className="text-pink-500 shrink-0" />
                    <span className="text-[8px] uppercase tracking-wider font-extrabold">PROGRESSO DE CARGA</span>
                  </div>
                  <p className="text-2xl font-black mt-2 leading-none text-slate-900 dark:text-white">1,240h</p>
                  <span className="text-[8.5px] font-bold text-slate-400 mt-2 truncate">De 3,200h totais</span>
                </div>

                {/* Atividades Extras */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[110px] ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800/80 shadow-md' : 'bg-slate-50/80 border-slate-100 shadow-sm'
                }`}>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <GraduationCap size={16} className="text-purple-500 shrink-0" />
                    <span className="text-[8px] uppercase tracking-wider font-extrabold">ATIVIDADES EXTRAS</span>
                  </div>
                  <p className="text-2xl font-black mt-2 leading-none text-slate-900 dark:text-white">120h</p>
                  <span className="text-[8.5px] font-bold text-slate-400 mt-2 truncate">Suficiente para formatura</span>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: PERIGO */}
          {activeTab === 'perigo' && (
            <div className="space-y-4">
              <div className={`p-5 rounded-2xl border flex gap-3 text-left ${
                isDarkMode ? 'bg-red-950/20 border-red-900/60' : 'bg-red-50 border-red-100'
              }`}>
                <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-red-700 dark:text-red-400 font-extrabold text-xs">Zona de Extrema Cautela</h3>
                  <p className={`text-[10px] leading-relaxed mt-1.5 font-semibold ${
                    isDarkMode ? 'text-red-400/85' : 'text-red-650/90'
                  }`}>
                    Ao deletar sua conta acadêmica do aplicativo Eng+, todos os seus dados de progresso local e preferências de sistemas serão imediatamente revogados de forma irreversível.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-2.5">
                <button
                  disabled
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-red-100/50 dark:bg-red-950/20 text-red-400/70 dark:text-red-900/50 border border-red-200/10 flex items-center justify-center gap-1.5 cursor-not-allowed"
                >
                  <Trash2 size={14} />
                  Quero Deletar Minha Conta
                </button>
                <span className={`text-[9.5px] block text-center font-bold tracking-tight ${
                  isDarkMode ? 'text-slate-500' : 'text-slate-450'
                }`}>
                  * Funcionalidade desabilitada no protótipo (requer privilégios administrativos).
                </span>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Elegant Centered LogOut Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div 
              className={`w-full max-w-[320px] p-6 rounded-3xl border text-center shadow-2xl animate-fade-in ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white shadow-slate-950/80' 
                  : 'bg-white border-slate-100 text-slate-800'
              }`}
            >
              {/* Circular Glowing Icon Ring */}
              <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
                <LogOut size={22} className="ml-0.5" />
              </div>

              <h3 className="font-extrabold text-sm leading-tight text-slate-900 dark:text-white">Deseja realmente sair?</h3>
              <p className={`text-xs font-semibold mt-2.5 leading-relaxed ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Sua sessão será finalizada com segurança e você retornará para a tela de login.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                    isDarkMode 
                      ? 'border-slate-800 hover:bg-slate-800 text-slate-300' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
