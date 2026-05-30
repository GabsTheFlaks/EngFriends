import { supabase } from './supabaseClient'
import { compressImageToWebP } from './compressImage'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export interface UploadResult {
  url: string
}

export async function uploadChatMedia(file: File, roomId: string): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo de arquivo não suportado. Use JPG, PNG, WEBP ou GIF.')
  }

  let fileToUpload = file

  if (file.type === 'image/gif') {
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error('O GIF deve ter no máximo 5MB.')
    }
  } else {
    try {
      // Compress JPEG/PNG/WEBP to optimized WebP format
      fileToUpload = await compressImageToWebP(file)
    } catch (compressErr) {
      console.warn('Erro ao otimizar imagem, tentando enviar original:', compressErr)
      // Se falhar na compressão por algum motivo, valida o tamanho original antes do envio
      if (file.size > MAX_SIZE_BYTES) {
        throw new Error('A imagem deve ter no máximo 5MB (falha ao otimizar).', { cause: compressErr })
      }
    }
  }

  // Deriva a extensão do tipo MIME real (não do nome do arquivo) para evitar inconsistência
  const mimeExt: Record<string, string> = {
    'image/webp': 'webp',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
  }
  const fileExt = mimeExt[fileToUpload.type] ?? 'webp'
  // Usa crypto.randomUUID() se disponível, senão usa fallback (necessário para HTTP local no celular)
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
  const fileName = `${roomId}/${Date.now()}_${uuid}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('chat-media')
    .upload(fileName, fileToUpload, { upsert: false })

  if (uploadError) {
    throw new Error(`Erro no upload: ${uploadError.message}`)
  }

  const { data } = supabase.storage
    .from('chat-media')
    .getPublicUrl(fileName)

  return { url: data.publicUrl }
}
