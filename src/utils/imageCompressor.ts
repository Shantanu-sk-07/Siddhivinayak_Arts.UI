export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.6,
  maxSizeKB: 200,
};

export const compressImage = async (
  file: File,
  options: CompressionOptions = DEFAULT_OPTIONS
): Promise<File> => {
  const { maxWidth, maxHeight, quality, maxSizeKB } = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth!) {
          height = (height * maxWidth!) / width;
          width = maxWidth!;
        }
        
        if (height > maxHeight!) {
          width = (width * maxHeight!) / height;
          height = maxHeight!;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              if (compressedFile.size > maxSizeKB! * 1024) {
                compressImage(compressedFile, { ...options, quality: (quality || 0.6) - 0.1 }).then(resolve).catch(reject);
              } else {
                resolve(compressedFile);
              }
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

export const compressMultipleImages = async (
  files: File[],
  options?: CompressionOptions
): Promise<File[]> => {
  const compressed: File[] = [];
  for (const file of files) {
    const result = await compressImage(file, options);
    compressed.push(result);
  }
  return compressed;
};