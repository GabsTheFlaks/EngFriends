// =========================================================================
// index.ts — Cloudflare Worker: Push Notification Dispatcher
// Recebe POST /notify com { user_id, title, body, url? }
// Busca subscriptions no Supabase e envia push criptografado via Web Crypto.
// =========================================================================

import { buildVapidHeaders, encryptPayload } from './vapid'

interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  VAPID_PUBLIC_KEY: string
  VAPID_PRIVATE_KEY: string
  VAPID_SUBJECT: string
}

interface NotifyPayload {
  user_id: string
  title: string
  body: string
  url?: string
}

interface PushSubscriptionRow {
  id: string
  subscription: {
    endpoint: string
    keys: { p256dh: string; auth: string }
  }
}

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  
  // Whitelist of allowed origins:
  // - localhost and local network IPs (e.g. http://192.168.100.6:3000) for development
  // - Any official production domain (e.g. engfriends, equipexprojeto, etc.)
  const isAllowed = 
    origin.startsWith('http://localhost:') || 
    origin.startsWith('http://127.0.0.1:') ||
    origin.startsWith('http://192.168.') || // local Wi-Fi development
    origin.includes('engfriends') || 
    origin.includes('equipexprojeto') ||
    origin === ''; // allow server-to-server triggers like Supabase pg_net

  return {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : 'https://engfriends-push-worker.equipexprojeto.workers.dev',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = getCorsHeaders(request);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
    }

    // Parse do payload da requisição
    let payload: NotifyPayload
    try {
      payload = await request.json() as NotifyPayload
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    const { user_id, title, body, url = '/' } = payload
    if (!user_id || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, title, body' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Validar formato UUID do user_id (Garante imunidade contra injeção REST API)
    if (!UUID_REGEX.test(user_id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid user_id format. Must be a valid UUID.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Buscar subscriptions do usuário via Supabase REST API (service role)
    const supabaseRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${user_id}&select=id,subscription`,
      {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )

    if (!supabaseRes.ok) {
      const errorText = await supabaseRes.text()
      return new Response(
        JSON.stringify({ error: `Supabase error: ${errorText}` }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    const rows = (await supabaseRes.json()) as PushSubscriptionRow[]

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, failed: 0, expired_removed: 0, message: 'No subscriptions found for this user' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Preparar payload de notificação
    const notificationPayload = JSON.stringify({ title, body, url })
    const expiredIds: string[] = []
    let sent = 0
    let failed = 0

    // Enviar push para cada subscription registrada
    for (const row of rows) {
      try {
        // Criptografar o payload com as chaves do cliente (RFC 8291)
        const { ciphertext, salt, serverPublicKey } = await encryptPayload(
          notificationPayload,
          row.subscription.keys
        )

        // Gerar headers VAPID de autorização
        const vapidHeaders = await buildVapidHeaders(
          row.subscription.endpoint,
          env.VAPID_SUBJECT,
          env.VAPID_PUBLIC_KEY,
          env.VAPID_PRIVATE_KEY
        )

        // Converter salt e serverPublicKey para base64url para os headers HTTP
        const saltBase64Url = btoa(String.fromCharCode(...salt))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '')
        const serverKeyBase64Url = btoa(String.fromCharCode(...serverPublicKey))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '')

        // Enviar a requisição push criptografada ao endpoint do navegador
        const pushRes = await fetch(row.subscription.endpoint, {
          method: 'POST',
          headers: {
            ...vapidHeaders,
            'Content-Type': 'application/octet-stream',
            'Content-Encoding': 'aesgcm',
            'Encryption': `salt=${saltBase64Url}`,
            'Crypto-Key': `${vapidHeaders['Crypto-Key']};dh=${serverKeyBase64Url}`,
            'TTL': '86400',
          },
          body: ciphertext,
        })

        if (pushRes.status === 410 || pushRes.status === 404) {
          // Subscription expirada ou inválida — marcar para remoção
          expiredIds.push(row.id)
          failed++
        } else if (pushRes.ok || pushRes.status === 201) {
          sent++
        } else {
          console.error(`Push failed for ${row.id}: ${pushRes.status} ${await pushRes.text()}`)
          failed++
        }
      } catch (err) {
        console.error(`Push error for ${row.id}:`, err)
        failed++
      }
    }

    // Remover subscriptions expiradas do Supabase de forma automática
    if (expiredIds.length > 0) {
      try {
        await fetch(
          `${env.SUPABASE_URL}/rest/v1/push_subscriptions?id=in.(${expiredIds.join(',')})`,
          {
            method: 'DELETE',
            headers: {
              apikey: env.SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
          }
        )
      } catch (cleanupErr) {
        console.error('Failed to clean up expired subscriptions:', cleanupErr)
      }
    }

    return new Response(
      JSON.stringify({ sent, failed, expired_removed: expiredIds.length }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  },
}
