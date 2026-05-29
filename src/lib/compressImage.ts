/**
 * Utilitário para compressão de imagem no lado do cliente e conversão para WebP.
 *
 * Mantém GIFs animados intactos (sem compressão via Canvas) para preservar a animação.
 * Otimiza imagens JPEG, PNG e WEBP redimensionando-as e aplicando compressão.
 */
export async function compressImageToWebP(
  file: File,
  maxDimension = 1200,
  quality = 0.8
): Promise<File> {
  // Se for GIF, retorna o arquivo original sem alterações para preservar a animação
  if (file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensiona proporcionalmente caso exceda maxDimension
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Não foi possível obter o contexto 2D do Canvas.'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Converte para o formato WebP com qualidade otimizada
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Falha ao gerar o blob WebP da imagem.'));
                return;
              }

              // Define o novo nome com extensão .webp
              const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
              const newName = `${originalName}.webp`;

              const compressedFile = new File([blob], newName, {
                type: 'image/webp',
                lastModified: Date.now(),
              });

              resolve(compressedFile);
            },
            'image/webp',
            quality
          );
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = (err) => reject(new Error('Erro ao carregar os dados da imagem.'));
    };
    reader.onerror = (err) => reject(new Error('Erro ao ler o arquivo de imagem.'));
  });
}
