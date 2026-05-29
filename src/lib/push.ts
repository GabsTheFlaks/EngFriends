import { supabase } from './supabaseClient';

/**
 * Converte a string Base64URL VAPID public key para um Uint8Array (esperado pelo endpoint de inscrição).
 */
export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Solicita permissão e se inscreve nas notificações Push,
 * salvando no Supabase.
 */
export async function subscribeToPush(userId: string) {
  try {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker não é suportado pelo navegador.');
      return;
    }
    if (!('PushManager' in window)) {
      console.warn('Push Notifications não são suportadas pelo navegador.');
      return;
    }

    // Esperar pelo service worker
    const registration = await navigator.serviceWorker.ready;

    // Pedir permissão
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Permissão para Push não foi concedida pelo usuário.');
      return;
    }

    // Verificar inscrição existente
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Cria nova inscrição caso não exista
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('VITE_VAPID_PUBLIC_KEY não está definida nas variáveis de ambiente.');
        return;
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
      console.log('Inscrição Web Push realizada com sucesso no navegador.');
    } else {
      console.log('Navegador já inscrito no Web Push.');
    }

    // Salvar inscrição no Supabase `push_subscriptions`
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        subscription: subscription.toJSON(), // Salva todo o endpoint + chaves
      },
      { onConflict: 'user_id' }
    );

    if (error) {
      console.error('Erro ao salvar inscrição Push no Supabase:', error);
    } else {
      console.log('Inscrição Push salva no banco de dados com sucesso.');
    }

  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.log('Inscrição Web Push abortada ou não permitida pelo ambiente local.');
    } else {
      console.error('Erro na configuração do Push Notification:', err);
    }
  }
}
