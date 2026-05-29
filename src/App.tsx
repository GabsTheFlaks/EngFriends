import React, { useState, useEffect } from 'react';
import { InstallPrompt } from './components/ui/InstallPrompt';
import { Login } from './pages/Login';
import { MobileLayout } from './components/layout/MobileLayout';
import { ChatTab } from './components/tabs/ChatTab';
import { InfoTab } from './components/tabs/InfoTab';
import { ProjTab } from './components/tabs/ProjTab';
import { SistTab } from './components/tabs/SistTab';
import { AjudaTab } from './components/tabs/AjudaTab';
import { UserProfile } from './components/profile/ProfileModal';
import { Profile } from './pages/Profile';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabaseClient';
import { NotificationsDrawer } from './components/layout/NotificationsDrawer';
import { TabType } from './types';
import { Loader2 } from 'lucide-react';
import { NotificationProvider } from './context/NotificationContext';

type ViewState = 'login' | 'register' | 'app' | 'profile';

export default function App() {
  const { session, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('engfriends-dark-mode') === 'true';
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const nextValue = !prev;
      localStorage.setItem('engfriends-dark-mode', String(nextValue));
      return nextValue;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);


  // Auth guards and Service Worker registration
  useEffect(() => {
    if (!loading) {
      if (!session) {
        if (currentView !== 'login' && currentView !== 'register') {
          setCurrentView('login');
        }
      } else {
        if (currentView === 'login' || currentView === 'register') {
          setCurrentView('app');
        }

        // Register Service Worker — push subscription is handled inside useAuth.ts
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('Service Worker Registrado.'))
            .catch((err) => console.error('Erro ao registrar Service Worker:', err));
        }
      }
    }
  }, [session, loading, currentView]);

  const [user, setUser] = useState<UserProfile>({
    name: 'Carregando...',
    ra: '0000.00000.00',
    course: 'Engenharia',
    period: 'Carregando',
    avatar: ''
  });

  // Load and sync real user profile from Supabase
  useEffect(() => {
    if (!session?.user) return;

    const fetchProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('username, avatar_index, ra, course, period')
          .eq('id', session.user.id)
          .maybeSingle();

        if (data) {
          setUser({
            name: data.username || session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Aluno',
            avatar: `/avatars/avatar_${data.avatar_index ?? 0}.png`,
            ra: data.ra || '2026.0000.01',
            course: data.course || 'Engenharia de Software',
            period: data.period || '1º Período • Integral'
          });
        }
      } catch (err) {
        console.error('Falha ao ler perfil Supabase no App:', err);
      }
    };

    fetchProfile();

    // Channel ID fixo por user — sem Math.random() para evitar canais duplicados
    const profileChannelId = `profile_changes_${session.user.id}`;
    const profileChannel = supabase
      .channel(profileChannelId)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
        (payload) => {
          const updated = payload.new as any;
          setUser({
            name: updated.username || session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Aluno',
            avatar: `/avatars/avatar_${updated.avatar_index ?? 0}.png`,
            ra: updated.ra || '2026.0000.01',
            course: updated.course || 'Engenharia de Software',
            period: updated.period || '1º Período • Integral'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [session]);

  if (loading) {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'}`}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold tracking-tight opacity-75">Sincronizando com Supabase...</span>
        </div>
      </div>
    );
  }

  if (currentView === 'login' || currentView === 'register') {
    return <Login />;
  }

  if (currentView === 'profile') {
    return (
      <Profile
        user={session?.user}
        signOut={signOut}
        onBack={() => setCurrentView('app')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onProfileUpdate={(updated) => {
          setUser({
            name: updated.username,
            avatar: `/avatars/avatar_${updated.avatar_index}.svg`,
            ra: updated.ra,
            course: updated.course,
            period: updated.period
          });
        }}
      />
    );
  }

  return (
    <NotificationProvider>
      <div className="relative overflow-hidden w-full h-[100dvh]">
        <MobileLayout
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isDarkMode={isDarkMode}
        >
          {activeTab === 'chat' && (
            <ChatTab
              user={user}
              onOpenProfile={() => setCurrentView('profile')}
              isDarkMode={isDarkMode}
            />
          )}
          <InstallPrompt />
          {activeTab === 'info' && (
            <InfoTab
              user={user}
              onOpenProfile={() => setCurrentView('profile')}
              isDarkMode={isDarkMode}
              unreadNotificationsCount={0}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
            />
          )}
          {activeTab === 'proj' && (
            <ProjTab
              user={user}
              onOpenProfile={() => setCurrentView('profile')}
              isDarkMode={isDarkMode}
            />
          )}
          {activeTab === 'sist' && (
            <SistTab
              user={user}
              onOpenProfile={() => setCurrentView('profile')}
              isDarkMode={isDarkMode}
            />
          )}
          {activeTab === 'ajuda' && (
            <AjudaTab
              user={user}
              onOpenProfile={() => setCurrentView('profile')}
              isDarkMode={isDarkMode}
            />
          )}
        </MobileLayout>

        <NotificationsDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          isDarkMode={isDarkMode}
        />
      </div>
    </NotificationProvider>
  );
}
