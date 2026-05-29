import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

export interface Message {
  id: string
  room_id: string
  sender_id: string
  sender_username: string
  sender_avatar_index: number
  content: string
  type: 'text' | 'image'
  created_at: string
}

export function useChat(roomId: string | null) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  // Carregar histórico (últimas 50 mensagens)
  useEffect(() => {
    if (!roomId) return
    setLoading(true)

    supabase
      .from('messages')
      .select(`
        id, room_id, sender_id, content, type, created_at,
        profiles ( username, avatar_index )
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) console.error(error)
        if (data) {
          const formatted = data.reverse().map(msg => ({
            ...msg,
            sender_username: (msg.profiles as any)?.username ?? 'Desconhecido',
            sender_avatar_index: (msg.profiles as any)?.avatar_index ?? 0,
          }))
          setMessages(formatted)
        }
        setLoading(false)
      })
  }, [roomId])

  // Listener Realtime para novas mensagens e indicador de digitação
  useEffect(() => {
    if (!roomId || !user) return

    const channel = supabase.channel(`room:${roomId}`)

    // Novas mensagens via postgres_changes
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
      async (payload) => {
        const { data } = await supabase
          .from('profiles')
          .select('username, avatar_index')
          .eq('id', payload.new.sender_id)
          .single()

        const newMsg: Message = {
          ...(payload.new as any),
          sender_username: data?.username ?? 'Desconhecido',
          sender_avatar_index: data?.avatar_index ?? 0,
        }
        setMessages(prev => [...prev, newMsg])
      }
    )

    // Indicador de digitação via broadcast (efêmero, não persiste)
    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (payload.user_id === user.id) return
      setTypingUsers(prev => Array.from(new Set([...prev, payload.username])))
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(u => u !== payload.username))
      }, 3000)
    })

    channel.subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [roomId, user])

  // Enviar indicador de digitação
  const sendTyping = useCallback(async (username: string) => {
    if (!roomId || !user) return;
    await supabase.channel(`room:${roomId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: user.id, username },
    })
  }, [roomId, user])

  // Enviar mensagem de texto
  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' = 'text') => {
    if (!user || !roomId) return
    const { error } = await supabase.from('messages').insert({
      room_id: roomId,
      sender_id: user.id,
      content,
      type,
    })
    if (error) throw error
  }, [roomId, user])

  return { messages, loading, typingUsers, sendMessage, sendTyping }
}