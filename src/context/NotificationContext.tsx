import React, { createContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

interface NotificationContextProps {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Carregar notificações existentes
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (data) setNotifications(data);
      });
  }, [user]);

  // Listener Realtime único para novas notificações
  useEffect(() => {
    if (!user) return;

    // Canal único por usuário logado para evitar conexões duplicadas
    const channelId = `notifications:${user.id}-shared`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as AppNotification;
          setNotifications(prev => [newNotif, ...prev]);

          // Dispara um toast visual bonito e fluido
          toast(
            `${newNotif.title}\n${newNotif.body}`,
            {
              duration: 4000,
              icon: '🔔',
              style: {
                borderRadius: '16px',
                background: '#1E293B',
                color: '#FFF',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '12px 16px',
              },
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Marcar uma notificação como lida
  const markAsRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Marcar todas as notificações como lidas
  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [user]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}
