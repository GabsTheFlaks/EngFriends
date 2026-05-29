import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'
import React from 'react' // For JSX in toast

export interface AppNotification {
  id: string
  user_id: string
  title: string
  body: string
  read: boolean
  created_at: string
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const unreadCount = notifications.filter(n => !n.read).length

  // Carregar notificações existentes
  useEffect(() => {
    if (!user) return

    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (data) setNotifications(data)
      })
  }, [user])

  // Listener Realtime para novas notificações
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as AppNotification
          setNotifications(prev => [newNotification, ...prev])

          // Exibir Toast
          toast(
            (t) => (
              <div className="flex flex-col gap-1 cursor-pointer" onClick={() => toast.dismiss(t.id)}>
                <div className="font-bold text-sm text-slate-800 dark:text-white">{newNotification.title}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300">{newNotification.body}</div>
              </div>
            ),
            {
              duration: 4000,
              position: 'top-right',
              style: {
                background: 'var(--toast-bg, #fff)',
                color: 'var(--toast-color, #333)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '12px 16px',
                border: '1px solid var(--toast-border, #e2e8f0)',
              },
            }
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  // Marcar uma como lida
  const markAsRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    if (!user) return
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [user])

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}
