import { supabase } from './supabaseClient'

export async function registerPushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

  const registration = await navigator.serviceWorker.ready
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!vapidPublicKey) return

  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Salvar subscription no banco (upsert para evitar duplicatas)
  await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    subscription: subscription.toJSON(),
  }, { onConflict: 'user_id' })
}

// Converter VAPID key de base64 para Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
}
