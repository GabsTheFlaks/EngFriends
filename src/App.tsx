import React, { useState, useEffect } from 'react';
import { useNotifications, AppNotification } from './hooks/useNotifications';

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

type ViewState = 'login' | 'register' | 'app';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Real-time Push Notifications States
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isPeriodicPushEnabled, setIsPeriodicPushEnabled] = useState(false);

  // Local Storage Hook for persistent notification items

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Mapping new notifications to old format temporarily if needed, though we will just pass them.
  const notificationsList: NotificationItem[] = notifications.map((n: AppNotification) => ({
    id: n.id,
    title: n.title,
    description: n.body,
    time: 'Agora',
    read: n.read,
    category: 'general',
    timestamp: new Date(n.created_at || Date.now())
  }));

  const handleMarkAllAsRead = markAllAsRead;
  const handleClearAll = () => {};
  const handleToggleRead = (id: string) => { markAsRead(id); };

  const [user, setUser] = useState<UserProfile>({
    name: 'Amanda Silveira',
    ra: '2024.12039.04',
    course: 'Engenharia de Software',
    period: '5º Período • Integral',
    avatar: ''
  });

  const handleLogin = () => setCurrentView('app');
  const handleRegister = () => setCurrentView('app');

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
          // triggerPushNotification(titles[idx], descs[idx], cats[idx]);
        }}
        isDarkMode={isDarkMode}
        isPeriodicPushEnabled={isPeriodicPushEnabled}
        onTogglePeriodicPush={() => setIsPeriodicPushEnabled(!isPeriodicPushEnabled)}
      />
    </div>
  );
}
