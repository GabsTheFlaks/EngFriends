import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Eye, EyeOff, Moon, Sun, ShieldAlert, CheckCircle, GraduationCap, Award, BookOpen, Clock, Trash2, LogOut, Loader2, HelpCircle } from 'lucide-react';

export interface UserProfile {
  name: string;
  ra: string;
  course: string;
  period: string;
  avatar: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onDeleteAccount: () => void;
  onLogout: () => void;
}

const sessionStartTime = Date.now();

export function ProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  isDarkMode,
  onToggleDarkMode,
  onDeleteAccount,
  onLogout
}: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'stats' | 'danger'>('info');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Session Active Duration state
  const [sessionTime, setSessionTime] = useState('00:00');

  useEffect(() => {
    const updateTime = () => {
      const diffMs = Date.now() - sessionStartTime;
      const totalSecs = Math.floor(diffMs / 1000);
      const minutes = Math.floor(totalSecs / 60);
      const seconds = totalSecs % 60;
      const hours = Math.floor(minutes / 60);

      const formattedMins = (minutes % 60).toString().padStart(2, '0');
      const formattedSecs = seconds.toString().padStart(2, '0');

      if (hours > 0) {
        setSessionTime(`${hours}:${formattedMins}:${formattedSecs}`);
      } else {
        setSessionTime(`${formattedMins}:${formattedSecs}`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Edit fields
  const [editName, setEditName] = useState(user.name);
  const [editRa, setEditRa] = useState(user.ra);
  const [editCourse, setEditCourse] = useState(user.course);
  const [editPeriod, setEditPeriod] = useState(user.period);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Delete Confirmation Check
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInputRA, setDeleteInputRA] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Info success states
  const [infoSuccess, setInfoSuccess] = useState(false);

  // Logout state controls
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleExecuteLogout = () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);
    setTimeout(() => {
      onLogout();
      setIsLoggingOut(false);
    }, 1500);
  };

  // Notifications setting toggle
  const [notifications, setNotifications] = useState({
    academic: true,
    chat: true,
    events: false,
  });

  if (!isOpen) return null;

  // Handle avatar upload via base64 DataURL
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({
          ...user,
          avatar: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setInfoSuccess(false);
    onUpdateUser({
      ...user,
      name: editName,
      ra: editRa,
      course: editCourse,
      period: editPeriod
    });
    setInfoSuccess(true);
    setTimeout(() => {
      setInfoSuccess(false);
    }, 4000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError('Por favor, informe a senha atual.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setPasswordSuccess(false);
    }, 4000);
  };

  const handleDeleteConfirm = () => {
    setDeleteError('');
    if (deleteInputRA !== user.ra) {
      setDeleteError('O R.A. digitado está incorreto. Digite seu R.A. para confirmar.');
      return;
    }
    onDeleteAccount();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'} rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh] max-h-[720px] transition-colors duration-300 relative border ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>

        {/* Modal Close & TitleHeader */}
        <div className={`px-6 py-5 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-100 bg-slate-50/50'} shrink-0`}>
          <div className="flex items-center gap-2">
            <GraduationCap className={isDarkMode ? 'text-blue-400' : 'text-eng-blue'} size={24} />
            <h2 className="font-bold text-lg tracking-tight">Perfil do Aluno</h2>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800'}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Avatar Section & Basic Info Capsule */}
          <div className={`p-5 rounded-2xl flex items-center gap-5 relative border overflow-hidden ${isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50/80 border-slate-100'}`}>
            <div className="relative group shrink-0">
              <div className={`w-20 h-20 rounded-full overflow-hidden border-4 shadow-md ${isDarkMode ? 'border-slate-800 bg-slate-850' : 'border-white bg-slate-200'} flex items-center justify-center`}>
                {user.avatar ? (
                  <img src={user.avatar} referrerPolicy="no-referrer" alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className={`text-2xl font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`absolute bottom-0 right-0 w-8 h-8 rounded-full border shadow-md flex items-center justify-center transition-transform hover:scale-105 ${isDarkMode ? 'bg-blue-600 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-700'}`}
                title="Subir foto de perfil"
                id="upload-avatar-trigger"
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-file-input"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base truncate">{user.name}</h3>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5 font-mono`}>RA: {user.ra}</p>
              <p className={`text-xs font-semibold ${isDarkMode ? 'text-sky-400' : 'text-sky-600'} mt-1 truncate`}>{user.course}</p>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} font-medium mt-0.5`}>{user.period}</p>
            </div>
          </div>

          {/* Quick Config Row - Dark Mode Switch */}
          <div className={`p-4 rounded-xl flex items-center justify-between border ${isDarkMode ? 'bg-slate-950/30 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
            <div className="flex items-center gap-3">
              <span className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-sky-400' : 'bg-white text-amber-500 shadow-sm border border-slate-100'}`}>
                {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
              </span>
              <div>
                <p className="text-xs font-bold leading-tight">Tema Escuro</p>
                <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Melhora a visualização noturna</p>
              </div>
            </div>

            {/* Custom Interactive Toggle Switch */}
            <button
              onClick={onToggleDarkMode}
              className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200'}`}
              aria-label="Toggle dark mode"
              id="theme-toggle-switch"
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 shadow-sm ${isDarkMode ? 'translate-x-5.5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Segmented Section Tabs */}
          <div className={`flex p-1 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100/80 border-slate-200/50'}`}>
            {(['info', 'password', 'stats', 'danger'] as const).map((tab) => {
              const label = { info: 'Identidade', password: 'Senha', stats: 'Status', danger: 'Perigo' }[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${
                    activeTab === tab
                      ? isDarkMode
                        ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50'
                        : 'bg-white text-eng-blue shadow-sm border border-slate-200/20'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id={`profile-tab-${tab}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Tab Subviews */}
          <div className="min-h-[220px]">
            {activeTab === 'info' && (
              <form onSubmit={handleSaveInfo} className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-1.5`}>Nome Completo</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`w-full rounded-xl py-2.5 px-4 text-xs font-semibold outline-none border transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-white' : 'bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-800'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-1.5`}>Registro Acadêmico (R.A.)</label>
                    <input
                      type="text"
                      value={editRa}
                      onChange={(e) => setEditRa(e.target.value)}
                      className={`w-full rounded-xl py-2.5 px-4 text-xs font-mono font-bold outline-none border transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-white' : 'bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-800'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-1.5`}>Curso Acadêmico</label>
                    <input
                      type="text"
                      value={editCourse}
                      onChange={(e) => setEditCourse(e.target.value)}
                      className={`w-full rounded-xl py-2.5 px-4 text-xs font-semibold outline-none border transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-white' : 'bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-800'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-1.5`}>Período / Turma</label>
                    <input
                      type="text"
                      value={editPeriod}
                      onChange={(e) => setEditPeriod(e.target.value)}
                      className={`w-full rounded-xl py-2.5 px-4 text-xs font-semibold outline-none border transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-white' : 'bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-800'}`}
                      required
                    />
                  </div>
                </div>

                {/* Compact Notification preferences toggle inside identity tab */}
                <div className="pt-4 border-t border-slate-200/20">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Preferências de Alerta</h4>
                  <div className="space-y-2">
                    {Object.entries(notifications).map(([key, val]) => (
                      <label key={key} className="flex items-center justify-between cursor-pointer">
                        <span className="text-xs font-semibold capitalize">{key === 'academic' ? 'Avisos SUAP' : key === 'chat' ? 'Novas Mensagens' : 'Eventos e Copas'}</span>
                        <input
                          type="checkbox"
                          checked={val}
                          onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="rounded text-eng-blue focus:ring-eng-blue w-4 h-4 border-slate-300"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {infoSuccess && (
                  <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3 flex gap-2.5 mt-2 text-emerald-500 animate-fade-in">
                    <CheckCircle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold leading-none">Perfil Atualizado!</p>
                      <p className="text-[10px] mt-0.5 opacity-80">Seus dados acadêmicos foram salvos com sucesso.</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all mt-4 shadow-md"
                >
                  Salvar Alterações
                </button>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-4 animate-fade-in">
                <div className="space-y-3">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-1.5`}>Senha Atual</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={`w-full rounded-xl py-2.5 pl-4 pr-10 text-xs font-semibold outline-none border transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-white' : 'bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-800'}`}
                        placeholder="Informe a senha atual"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-1.5`}>Nova Senha</label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full rounded-xl py-2.5 px-4 text-xs font-semibold outline-none border transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-white' : 'bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-800'}`}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-1.5`}>Confirmar Nova Senha</label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full rounded-xl py-2.5 px-4 text-xs font-semibold outline-none border transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-white' : 'bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-800'}`}
                      placeholder="Repita a nova senha"
                    />
                  </div>
                </div>

                {passwordError && (
                  <p className="text-[11px] font-bold text-red-500 mt-2 flex items-center gap-1.5 animate-pulse">
                    ⚠️ {passwordError}
                  </p>
                )}

                {passwordSuccess && (
                  <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3 flex gap-2.5 mt-2 text-emerald-500 animate-fade-in">
                    <CheckCircle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold leading-none">Senha Redefinida!</p>
                      <p className="text-[10px] mt-0.5 opacity-80">Sua nova credencial foi registrada com segurança.</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all mt-4 shadow-md"
                >
                  Alterar Senha do App
                </button>
              </form>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rendimento e Histórico</h4>
                <div className="grid grid-cols-2 gap-3">

                  <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-2 text-blue-500 mb-1">
                      <Award size={16} />
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Média Geral (CR)</span>
                    </div>
                    <p className="text-2xl font-black mt-1">8.9</p>
                    <p className="text-[9px] text-slate-400 mt-1 font-medium">Top 5% da turma</p>
                  </div>

                  <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-2 text-emerald-500 mb-1">
                      <BookOpen size={16} />
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Materiais Concluídos</span>
                    </div>
                    <p className="text-2xl font-black mt-1">74%</p>
                    <p className="text-[9px] text-slate-400 mt-1 font-medium">32 matérias listadas</p>
                  </div>

                  <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-2 text-pink-500 mb-1">
                      <Clock size={16} />
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Progresso de Carga</span>
                    </div>
                    <p className="text-2xl font-black mt-1">1,240h</p>
                    <p className="text-[9px] text-slate-400 mt-1 font-medium">De 3,200h totais</p>
                  </div>

                  <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-2 text-purple-500 mb-1">
                      <Award size={16} />
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Atividades Extras</span>
                    </div>
                    <p className="text-2xl font-black mt-1">120h</p>
                    <p className="text-[9px] text-slate-400 mt-1 font-medium">Suficiente para formatura</p>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="space-y-4 animate-fade-in text-left">
                {!confirmDelete ? (
                  <>
                    <div className={`p-4 border rounded-xl flex gap-3 ${isDarkMode ? 'bg-red-950/20 border-red-900/40 text-red-400' : 'bg-red-50 border-red-100 text-red-700'}`}>
                      <ShieldAlert className="shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="text-xs font-bold leading-none">Zona de Extrema Cautela</h4>
                        <p className="text-[10px] mt-1.5 leading-relaxed opacity-90">
                          Ao deletar sua conta acadêmica do aplicativo Eng+, todos os seus dados de progresso local e preferências de sistemas serão imediatamente revogados de forma irreversível.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="w-full py-3 border border-red-500 hover:bg-red-500 hover:text-white text-red-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Trash2 size={14} /> Quero Deletar Minha Conta
                    </button>
                  </>
                ) : (
                  <div className="space-y-4 animate-slide-up">
                    <div className={`p-4 border rounded-xl flex flex-col gap-2 ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-100'}`}>
                      <p className="text-xs font-bold">Confirmação de segurança</p>
                      <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Para prosseguir, digite exatamente o seu R.A. (<span className="font-mono font-bold text-red-500">{user.ra}</span>) abaixo:
                      </p>
                      <input
                        type="text"
                        value={deleteInputRA}
                        onChange={(e) => setDeleteInputRA(e.target.value)}
                        placeholder="Digite o seu R.A. aqui"
                        className={`w-full rounded-xl py-2 px-3 mt-1 text-xs font-mono font-bold outline-none border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-red-500' : 'bg-white border-slate-200 text-slate-800 focus:border-red-500'}`}
                      />
                    </div>

                    {deleteError && (
                      <p className="text-[11px] font-bold text-red-500 mt-2 flex items-center gap-1.5 animate-pulse">
                        ⚠️ {deleteError}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteConfirm}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                      >
                        Confirmar Exclusão
                      </button>
                      <button
                        onClick={() => {
                          setConfirmDelete(false);
                          setDeleteInputRA('');
                        }}
                        className={`px-4 py-3 border rounded-xl text-xs font-bold transition-all ${isDarkMode ? 'border-slate-800 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer (Logout Action) */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        <div className={`px-6 py-4 flex items-center justify-between shrink-0 ${isDarkMode ? 'bg-slate-950/40' : 'bg-slate-50/50'}`}>
          <div className="flex flex-col gap-1.5 items-start">
            <button
              onClick={() => {
                if (!isLoggingOut) {
                  setShowLogoutConfirm(true);
                }
              }}
              disabled={isLoggingOut}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all duration-300 ${
                isLoggingOut
                  ? isDarkMode
                    ? 'opacity-60 cursor-not-allowed bg-slate-850 text-slate-400 animate-pulse'
                    : 'opacity-60 cursor-not-allowed bg-slate-200 text-slate-500 animate-pulse'
                  : showLogoutConfirm
                    ? 'bg-red-500 text-white animate-pulse shadow-md hover:scale-105 active:scale-95 cursor-pointer'
                    : isDarkMode
                      ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 hover:scale-105 active:scale-95 cursor-pointer shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 hover:scale-105 active:scale-95 cursor-pointer shadow-xs'
              }`}
              id="profile-logout-button"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 size={14} className="animate-spin text-blue-600 dark:text-blue-400 shrink-0" /> Saindo...
                </>
              ) : (
                <>
                  <LogOut size={14} className="shrink-0" /> Sair do Aplicativo
                </>
              )}
            </button>

            {/* Session duration & safe cache disclaimer tooltip icon */}
            <div className="flex items-center gap-1.5 mt-1 pl-1">
              <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-555' : 'text-slate-400'}`}>
                Sessão Ativa: <span className="font-mono font-bold">{sessionTime}</span>
              </span>

              <div className="relative group flex items-center">
                <HelpCircle size={12} className={`cursor-help transition-colors ${isDarkMode ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`} />
                <div className={`absolute bottom-full left-0 mb-2 w-48 p-2.5 rounded-xl text-[9px] font-medium leading-tight shadow-lg border pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-250 z-[120] ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-800 border-slate-750 text-white'}`}>
                  Todo o progresso local de projetos será armazenado em cache com segurança antes de encerrar sua sessão.
                </div>
              </div>
            </div>
          </div>

          <span className={`text-[9px] font-mono ${isDarkMode ? 'text-slate-600' : 'text-slate-400'} font-bold`}>
            ENG+ v2.4.0
          </span>
        </div>

        {/* Custom Logout Confirmation Overlay */}
        {showLogoutConfirm && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-[100] p-6 animate-fade-in animate-duration-200">
            <div className={`w-full max-w-xs p-6 rounded-2xl border transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white shadow-2xl' : 'bg-white border-slate-200 text-slate-800 shadow-xl'} flex flex-col gap-4 text-center`}>
              <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${isDarkMode ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-500'}`}>
                <LogOut size={22} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Deseja realmente sair?</h3>
                <p className={`text-[11px] leading-relaxed mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Sua sessão será finalizada com segurança e você retornará para a tela de login.
                </p>
              </div>
              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${isDarkMode ? 'border-slate-800 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'} disabled:opacity-50`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  id="profile-logout-confirm-button"
                  disabled={isLoggingOut}
                  onClick={handleExecuteLogout}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white shadow-md disabled:bg-red-700/60"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Saindo...
                    </>
                  ) : (
                    <>
                      <LogOut size={12} /> Sair
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
