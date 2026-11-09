import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase-config';

export interface UploadResult {
  url: string;
  path: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

export async function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return reject(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
    if (file.size > MAX_FILE_SIZE) {
      return reject(new Error('File size exceeds 8MB limit.'));
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;

    img.onload = () => {
      let width = img.width;
      let height = img.height;
      const maxDim = 1600;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context.'));
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Canvas to Blob conversion failed.'));
          }
          resolve(blob);
        },
        'image/webp',
        0.82
      );
    };

    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(file: File, folder: string = 'uploads'): Promise<UploadResult> {
  const resizedBlob = await resizeImage(file);
  const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.webp`;
  const path = `${folder}/${filename}`;
  const storageRef = ref(storage, path);

  const snapshot = await uploadBytes(storageRef, resizedBlob, {
    contentType: 'image/webp'
  });

  const url = await getDownloadURL(snapshot.ref);
  return { url, path };
}

export async function deleteImage(path: string): Promise<void> {
  if (!path) return;
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn('Failed to delete image from storage:', error);
  }
}
