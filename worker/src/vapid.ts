// =========================================================================
// vapid.ts — VAPID Authentication & Web Push Encryption (RFC 8291)
// Implementação 100% nativa usando Web Crypto API do Cloudflare Workers.
// Sem dependências externas.
// =========================================================================

// Converte base64url para Uint8Array
function base64UrlToUint8Array(base64url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4)
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

// Converte Uint8Array para base64url
function uint8ArrayToBase64Url(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Gera o JWT de autorização VAPID (ES256 / P-256)
async function generateVapidJwt(
  audience: string,
  subject: string,
  publicKeyBase64Url: string,
  privateKeyBase64Url: string
): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    aud: audience,
    exp: now + 12 * 3600, // expira em 12 horas
    sub: subject,
  }

  const encodedHeader = uint8ArrayToBase64Url(
    new TextEncoder().encode(JSON.stringify(header))
  )
  const encodedPayload = uint8ArrayToBase64Url(
    new TextEncoder().encode(JSON.stringify(payload))
  )
  const signingInput = `${encodedHeader}.${encodedPayload}`

  // Importar chave privada VAPID (formato PKCS8 / ES256 / P-256)
  const privateKeyBytes = base64UrlToUint8Array(privateKeyBase64Url)
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    new TextEncoder().encode(signingInput)
  )

  const encodedSignature = uint8ArrayToBase64Url(new Uint8Array(signature))
  return `${signingInput}.${encodedSignature}`
}

export interface VapidHeaders {
  Authorization: string
  'Crypto-Key': string
}

// Gera os headers de autorização VAPID para a requisição push
export async function buildVapidHeaders(
  endpoint: string,
  subject: string,
  publicKeyBase64Url: string,
  privateKeyBase64Url: string
): Promise<VapidHeaders> {
  const url = new URL(endpoint)
  const audience = `${url.protocol}//${url.host}`

  const jwt = await generateVapidJwt(
    audience,
    subject,
    publicKeyBase64Url,
    privateKeyBase64Url
  )

  return {
    Authorization: `vapid t=${jwt},k=${publicKeyBase64Url}`,
    'Crypto-Key': `p256ecdh=${publicKeyBase64Url}`,
  }
}

// Criptografa o payload da notificação (RFC 8291 — Web Push Message Encryption)
export async function encryptPayload(
  payload: string,
  subscriptionKeys: { p256dh: string; auth: string }
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const clientPublicKey = base64UrlToUint8Array(subscriptionKeys.p256dh)
  const authSecret = base64UrlToUint8Array(subscriptionKeys.auth)
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // Gerar par de chaves efêmero do servidor
  const serverKeyPair = (await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey', 'deriveBits']
  )) as CryptoKeyPair

  const serverPublicKeyRaw = new Uint8Array(
    (await crypto.subtle.exportKey('raw', serverKeyPair.publicKey)) as ArrayBuffer
  )

  // Importar chave pública do cliente
  const clientKey = await crypto.subtle.importKey(
    'raw',
    clientPublicKey,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  )

  // Derivar segredo compartilhado via ECDH
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'ECDH', public: clientKey } as unknown as SubtleCryptoDeriveKeyAlgorithm,
      serverKeyPair.privateKey,
      256
    )
  )

  // PRK via HMAC-SHA256
  const encoder = new TextEncoder()
  const authInfo = encoder.encode('Content-Encoding: auth\0')
  const prkHmac = await crypto.subtle.importKey(
    'raw',
    authSecret,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const ikmHmac = new Uint8Array(
    await crypto.subtle.sign(
      'HMAC',
      prkHmac,
      new Uint8Array([...sharedSecret, ...authInfo])
    )
  )

  // CEK e nonce via HKDF
  const keyInfo = new Uint8Array([
    ...encoder.encode('Content-Encoding: aesgcm\0'),
    0x00,
    ...serverPublicKeyRaw,
    ...clientPublicKey,
  ])
  const nonceInfo = new Uint8Array([
    ...encoder.encode('Content-Encoding: nonce\0'),
    0x00,
    ...serverPublicKeyRaw,
    ...clientPublicKey,
  ])

  const hkdfKey = await crypto.subtle.importKey(
    'raw',
    ikmHmac,
    { name: 'HKDF' },
    false,
    ['deriveBits']
  )

  const cekBits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: keyInfo },
    hkdfKey,
    128
  )
  const nonceBits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: nonceInfo },
    hkdfKey,
    96
  )

  const cek = await crypto.subtle.importKey(
    'raw',
    cekBits,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  )
  const nonce = new Uint8Array(nonceBits)

  // Criptografar payload com padding de 2 bytes (RFC 8291)
  const paddedPayload = new Uint8Array([0, 0, ...encoder.encode(payload)])
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce },
      cek,
      paddedPayload
    )
  )

  return { ciphertext, salt, serverPublicKey: serverPublicKeyRaw }
}
