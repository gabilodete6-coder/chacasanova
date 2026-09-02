/**
 * Utility functions for client-side image resizing and compression
 * Converts large camera photos to lightweight WebP (or JPEG fallback)
 * Max width: 1200px, quality: ~0.82
 */

export interface ProcessedImageResult {
  blob: Blob;
  fileName: string;
  contentType: string;
  previewUrl: string;
}

/**
 * Resizes and compresses an image File in the browser using HTML5 Canvas.
 * Keeps aspect ratio intact, restricts max dimension to maxWidth (default 1200px),
 * and encodes to WebP with 0.82 quality.
 */
export async function compressImageForUpload(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<ProcessedImageResult> {
  // SVG files are vector - do not compress via canvas
  if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
    return {
      blob: file,
      fileName: file.name,
      contentType: 'image/svg+xml',
      previewUrl: URL.createObjectURL(file),
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original file if canvas context unavailable
          return resolve({
            blob: file,
            fileName: file.name,
            contentType: file.type || 'image/jpeg',
            previewUrl: URL.createObjectURL(file),
          });
        }

        // Fill with white background in case of transparent pngs being converted to jpeg/webp
        ctx.drawImage(img, 0, 0, width, height);

        // Try converting to webp first
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size > 0) {
              const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'imagem';
              const cleanBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
              const previewUrl = URL.createObjectURL(blob);
              resolve({
                blob,
                fileName: `${cleanBaseName}.webp`,
                contentType: 'image/webp',
                previewUrl,
              });
            } else {
              // Fallback to JPEG
              canvas.toBlob(
                (jpegBlob) => {
                  if (jpegBlob) {
                    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'imagem';
                    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
                    const previewUrl = URL.createObjectURL(jpegBlob);
                    resolve({
                      blob: jpegBlob,
                      fileName: `${cleanBaseName}.jpg`,
                      contentType: 'image/jpeg',
                      previewUrl,
                    });
                  } else {
                    resolve({
                      blob: file,
                      fileName: file.name,
                      contentType: file.type || 'image/jpeg',
                      previewUrl: URL.createObjectURL(file),
                    });
                  }
                },
                'image/jpeg',
                quality
              );
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => {
        // Fallback to original
        resolve({
          blob: file,
          fileName: file.name,
          contentType: file.type || 'image/jpeg',
          previewUrl: URL.createObjectURL(file),
        });
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
