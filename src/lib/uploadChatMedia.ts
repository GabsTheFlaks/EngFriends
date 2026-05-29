import { supabase } from './supabaseClient'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export interface UploadResult {
  url: string
}

export async function uploadChatMedia(
  file: File,
  roomId: string
): Promise<UploadResult> {
  // Validações no client — nunca chegam ao servidor
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo de arquivo não suportado. Use JPG, PNG, WebP ou GIF.')
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Arquivo muito grande. O limite é 5MB.')
  }

  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${roomId}/${timestamp}_${safeName}`

  const { error } = await supabase.storage
    .from('chat-media')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw new Error(`Falha no upload: ${error.message}`)

  const { data } = supabase.storage.from('chat-media').getPublicUrl(path)
  return { url: data.publicUrl }
}
