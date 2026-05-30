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

export function useChat(roomId: string) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
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
          const storageKey = user ? `engplus_cleared_${user.id}` : ''
          const cached = storageKey ? localStorage.getItem(storageKey) : null
          const clearedRecords = cached ? JSON.parse(cached) : {}
          const clearedAtStr = clearedRecords[roomId]
          const clearedAtTime = clearedAtStr ? new Date(clearedAtStr).getTime() : null

          let formatted = data.reverse().map(msg => ({
            id: msg.id,
            room_id: msg.room_id ?? '',
            sender_id: msg.sender_id ?? '',
            content: msg.content,
            type: (msg.type as 'text' | 'image') ?? 'text',
            created_at: msg.created_at,
            sender_username: Array.isArray(msg.profiles) 
              ? (msg.profiles[0] as { username?: string | null })?.username ?? 'Desconhecido'
              : (msg.profiles as { username?: string | null } | null)?.username ?? 'Desconhecido',
            sender_avatar_index: Array.isArray(msg.profiles)
              ? (msg.profiles[0] as { avatar_index?: number | null })?.avatar_index ?? 0
              : (msg.profiles as { avatar_index?: number | null } | null)?.avatar_index ?? 0,
          }))

          if (clearedAtTime) {
            formatted = formatted.filter(msg => new Date(msg.created_at).getTime() > clearedAtTime)
          }

          setMessages(formatted)
        }
        setLoading(false)
      })
  }, [roomId, user])

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
          id: payload.new.id,
          room_id: payload.new.room_id ?? '',
          sender_id: payload.new.sender_id ?? '',
          content: payload.new.content,
          type: (payload.new.type as 'text' | 'image') ?? 'text',
          created_at: payload.new.created_at,
          sender_username: data?.username ?? 'Desconhecido',
          sender_avatar_index: data?.avatar_index ?? 0,
        }

        const storageKey = user ? `engplus_cleared_${user.id}` : ''
        const cached = storageKey ? localStorage.getItem(storageKey) : null
        const clearedRecords = cached ? JSON.parse(cached) : {}
        const clearedAtStr = clearedRecords[roomId]
        const clearedAtTime = clearedAtStr ? new Date(clearedAtStr).getTime() : null

        if (clearedAtTime && new Date(newMsg.created_at).getTime() <= clearedAtTime) {
          return // Ignora mensagens anteriores à data de limpeza
        }

        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
      }
    )

    // Remoção de mensagens via postgres_changes
    channel.on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
      (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id))
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
    if (!user) return
    await supabase.channel(`room:${roomId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: user.id, username },
    })
  }, [roomId, user])

  // Enviar mensagem de texto e disparar notificações para os demais membros
  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' = 'text') => {
    if (!user) return
    
    // 1. Inserir a mensagem
    const { error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        sender_id: user.id,
        content,
        type,
      })

    if (error) throw error

    try {
      // 2. Buscar o username do remetente
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
      const username = profile?.username ?? 'Colega'

      // 3. Buscar todos os outros usuários do canal (proxy de "membros")
      const { data: senders } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('room_id', roomId)
        .neq('sender_id', user.id)

      const uniqueSenderIds = [...new Set(senders?.map(s => s.sender_id).filter(Boolean) ?? [])] as string[]

      // 4. Inserir notificações para os outros membros do canal
      if (uniqueSenderIds.length > 0) {
        let displayContent = content.slice(0, 80);
        if (type === 'image') displayContent = '📷 Foto';

        await supabase.from('notifications').insert(
          uniqueSenderIds.map(recipientId => ({
            user_id: recipientId,
            title: roomId.startsWith('dm_') ? 'Nova mensagem direta' : `Nova mensagem em #${roomId}`,
            body: `${username}: ${displayContent}`,
            read: false,
          }))
        )
      }
    } catch (notifErr) {
      console.error('Falha ao disparar notificações de mensagens:', notifErr)
    }
  }, [roomId, user])

  // Apagar uma mensagem (apenas o próprio remetente)
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user) return
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', user.id)

    if (error) throw error

    // Atualiza otimistamente a interface
    setMessages(prev => prev.filter(m => m.id !== messageId))
  }, [user])

  // Limpar a conversa inteira do canal (APENAS LOCALMENTE PARA O USUÁRIO)
  const clearChat = useCallback(async () => {
    if (!user || !roomId) return
    
    const now = new Date().toISOString()
    const storageKey = `engplus_cleared_${user.id}`
    const cached = localStorage.getItem(storageKey)
    const clearedRecords = cached ? JSON.parse(cached) : {}
    clearedRecords[roomId] = now
    localStorage.setItem(storageKey, JSON.stringify(clearedRecords))

    // Atualiza otimistamente a interface limpando tudo
    setMessages([])
  }, [user, roomId])

  return { messages, loading, typingUsers, sendMessage, sendTyping, deleteMessage, clearChat }
}
