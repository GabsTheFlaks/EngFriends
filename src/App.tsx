import React, { useState, useEffect } from 'react';
import { InstallPrompt } from './components/ui/InstallPrompt';
import { AuthLayout } from './components/auth/AuthLayout';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { MobileLayout } from './components/layout/MobileLayout';
import { ChatTab } from './components/tabs/ChatTab';
import { InfoTab } from './components/tabs/InfoTab';
import { ProjTab } from './components/tabs/ProjTab';
import { SistTab } from './components/tabs/SistTab';
import { AjudaTab } from './components/tabs/AjudaTab';
import { ProfileModal, UserProfile } from './components/profile/ProfileModal';
import toast from 'react-hot-toast';
import { NotificationsDrawer, NotificationItem } from './components/layout/NotificationsDrawer';
import { TabType } from './types';
import { Bell, X, Info } from 'lucide-react';
import { registerPushSubscription } from './lib/push';

type ViewState = 'login' | 'register' | 'app';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Real-time Push Notifications States
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);
  const [isPeriodicPushEnabled, setIsPeriodicPushEnabled] = useState(false);

  // Local Storage Hook for persistent notification items
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>(() => {
    const cached = localStorage.getItem('engplus_notifications');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return parsed.map((item: any) => ({
          ...item,
          timestamp: item.timestamp ? new Date(item.timestamp) : new Date()
        }));
      } catch (err) {
        console.error('Falha ao recuperar notificações do localStorage', err);
      }
    }
    return [
      {
        id: 'init-1',
        title: 'Boas-vindas ao Eng+!',
        description: 'Explore os canais acadêmicos e gerencie seus projetos com facilidade.',
        time: 'Ontem',
        read: true,
        category: 'general',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000)
      },
      {
        id: 'init-2',
        title: 'Aula Prática no Laboratório',
        description: 'O laboratório de fluidos está liberado para testes de viscosidade amanhã na sala 402 a partir das 14h.',
        time: '5h atrás',
        read: false,
        category: 'academic',
        timestamp: new Date(Date.now() - 5 * 3600 * 1000)
      },
      {
        id: 'init-1.5',
        title: 'Destaque: Coletivos Campus',
        description: 'Não esqueça de passar na nossa aba de Coletivos para marcar presença.',
        time: '6h atrás',
        read: false,
        category: 'general',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000)
      },
      {
        id: 'init-3',
        title: 'AeroDesign SAE • Novo Membro',
        description: 'Rodrigo Costa solicitou ingresso na equipe de aerodinâmica.',
        time: '1d atrás',
        read: false,
        category: 'project',
        timestamp: new Date(Date.now() - 25 * 3600 * 1000)
      }
    ];
  });

  // Persist state to localstorage when modified
  useEffect(() => {
    localStorage.setItem('engplus_notifications', JSON.stringify(notificationsList));
  }, [notificationsList]);

  const triggerPushNotification = (title: string, description: string, category: NotificationItem['category']) => {
    const newNotif: NotificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      description,
      time: 'Agora mesmo',
      read: false,
      category,
      timestamp: new Date()
    };
    setNotificationsList(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);

    // Auto clear toast after 4.5 seconds
    setTimeout(() => {
      setActiveToast(prev => prev?.id === newNotif.id ? null : prev);
    }, 4505);
  };

  const handleMarkAllAsRead = () => {
    setNotificationsList(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('engplus_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearAll = () => {
    setNotificationsList([]);
    localStorage.setItem('engplus_notifications', JSON.stringify([]));
  };

  const handleToggleRead = (id: string) => {
    setNotificationsList(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: !n.read } : n);
      localStorage.setItem('engplus_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  // Background emitter that periodically fires simulated pushes if enabled
  useEffect(() => {
    if (!isPeriodicPushEnabled || currentView !== 'app') return;

    const pushSamples = [
      { title: 'Professor de Cálculo III', desc: 'Acaba de lançar as notas da P1 no SUAP. Média geral do curso de Engenharia foi 7.2.', cat: 'academic' },
      { title: 'Mensagem de Gabriel Silva', desc: '"Alguém tem o relatório de mecânica dos sólidos pronto para nos basearmos?"', cat: 'chat' },
      { title: 'Equipe de AeroDesign SAE', desc: 'Amanda Silveira editou o progresso do projeto "Baja SAE Aero" para 85%.', cat: 'project' },
      { title: 'Oportunidade de Voluntariado', desc: 'IFSP divulga novas vagas de iniciação científica para o segundo semestre de Engenharia.', cat: 'academic' },
      { title: 'Grupo de Estudos de Física II', desc: 'Sessão prática urgente agendada na biblioteca amanhã às 10:00.', cat: 'chat' },
      { title: 'Hackathon do Campus 2026', desc: 'Inscrições abertas para o Hackathon de IoT do Centro Acadêmico.', cat: 'general' }
    ] as const;

    const interval = setInterval(() => {
      const sample = pushSamples[Math.floor(Math.random() * pushSamples.length)];
      triggerPushNotification(sample.title, sample.desc, sample.cat);
    }, 32000); // 32 seconds timer

    return () => clearInterval(interval);
  }, [isPeriodicPushEnabled, currentView]);

  const [user, setUser] = useState<UserProfile>({
    name: 'Amanda Silveira',
    ra: '2024.12039.04',
    course: 'Engenharia de Software',
    period: '5º Período • Integral',
    avatar: ''
  });

  const handleLogin = () => {
    setCurrentView('app');
    registerPushSubscription().catch(err => console.error("Push registration failed", err));
  };
  const handleRegister = () => {
    setCurrentView('app');
    registerPushSubscription().catch(err => console.error("Push registration failed", err));
  };

  const handleDeleteAccount = () => {
    toast.success('Sua conta foi excluída com sucesso da base de dados local do Eng+.');
    setIsProfileOpen(false);
    setCurrentView('register');
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    setCurrentView('login');
  };

  if (currentView === 'login') {
    return (
      <AuthLayout>
        <Login
          onNavigateRegister={() => setCurrentView('register')}
          onLogin={handleLogin}
        />
      </AuthLayout>
    );
  }

  if (currentView === 'register') {
    return (
      <AuthLayout>
        <Register
          onNavigateLogin={() => setCurrentView('login')}
          onRegister={handleRegister}
        />
      </AuthLayout>
    );
  }

  // App View
  return (
    <div className="relative overflow-hidden w-full h-[100dvh]">
      <MobileLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDarkMode={isDarkMode}
      >
        {activeTab === 'chat' && (
          <ChatTab
            user={user}
            onOpenProfile={() => setIsProfileOpen(true)}
            isDarkMode={isDarkMode}
          />
        )}
        <InstallPrompt />
        {activeTab === 'info' && (
          <InfoTab
            user={user}
            onOpenProfile={() => setIsProfileOpen(true)}
            isDarkMode={isDarkMode}
            unreadNotificationsCount={notificationsList.filter(n => !n.read).length}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
          />
        )}
        {activeTab === 'proj' && (
          <ProjTab
            user={user}
            onOpenProfile={() => setIsProfileOpen(true)}
            isDarkMode={isDarkMode}
          />
        )}
        {activeTab === 'sist' && (
          <SistTab
            user={user}
            onOpenProfile={() => setIsProfileOpen(true)}
            isDarkMode={isDarkMode}
          />
        )}
        {activeTab === 'ajuda' && (
          <AjudaTab
            user={user}
            onOpenProfile={() => setIsProfileOpen(true)}
            isDarkMode={isDarkMode}
          />
        )}
      </MobileLayout>

      {/* Real-time Slide-down Push Notification Toast */}
      {activeToast && (
        <div
          onClick={() => {
            setIsNotificationsOpen(true);
            setActiveToast(null);
          }}
          className={`absolute top-4 left-4 right-4 z-[999] p-4 rounded-2xl border transition-all duration-300 shadow-2xl cursor-pointer flex gap-3 animate-slide-down ${
            isDarkMode
              ? 'bg-slate-900/95 border-slate-800 text-white backdrop-blur-md'
              : 'bg-white/95 border-slate-200/80 text-slate-800 backdrop-blur-md shadow-lg shadow-slate-200/50'
          }`}
        >
          {/* Glowing pulse ring indicator */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Bell size={20} className="animate-wiggle" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex justify-between items-baseline">
              <span className="text-[9px] font-black uppercase tracking-wider text-blue-500">
                Push Real-time • Eng+
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveToast(null);
                }}
                className={`p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                  isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <X size={12} />
              </button>
            </div>
            <h4 className="text-xs font-bold leading-none mt-1.5 text-slate-900 dark:text-white truncate">
              {activeToast.title}
            </h4>
            <p className="text-[10.5px] font-semibold leading-snug mt-1 text-slate-500 dark:text-slate-400">
              {activeToast.description}
            </p>
          </div>
        </div>
      )}

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateUser={setUser}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onDeleteAccount={handleDeleteAccount}
        onLogout={handleLogout}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notificationsList}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAll}
        onToggleRead={handleToggleRead}
        onTriggerTestPush={() => {
          const titles = [
            'Push Instantâneo de Teste',
            'Nova Mensagem do Grupo',
            'SUAP: Alerta Acadêmico',
            'Inovação & Extensão'
          ];
          const descs = [
            'Seu sistema de push notifications em tempo real está configurado e pronto para produção!',
            ' Amanda Silveira: "Reunião de Engenharia de Software agendada para sexta, tragam os notebooks!"',
            'Lembrete: Prazo final para envio dos relatórios parciais de laboratório encerra hoje às 23:59.',
            'O coordenador de Engenharia aprovou o seu projeto de iniciação científica para o edital 2026.'
          ];
          const cats = ['general', 'chat', 'academic', 'project'] as const;

          const idx = Math.floor(Math.random() * titles.length);
          triggerPushNotification(titles[idx], descs[idx], cats[idx]);
        }}
        isDarkMode={isDarkMode}
        isPeriodicPushEnabled={isPeriodicPushEnabled}
        onTogglePeriodicPush={() => setIsPeriodicPushEnabled(!isPeriodicPushEnabled)}
      />
    </div>
  );
}
