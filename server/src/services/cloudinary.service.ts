import { cloudinary } from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

type ResourceType = 'image' | 'video' | 'raw' | 'auto';

function createStorage(folder: string, resourceType: ResourceType = 'auto') {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `travel-blog/${folder}`,
      resource_type: resourceType,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'avi'],
    } as object,
  });
}

export const uploadImage = multer({ storage: createStorage('images', 'image') });
export const uploadMedia = multer({ storage: createStorage('media', 'auto') });
export const uploadGallery = multer({ storage: createStorage('gallery', 'auto') });

export async function deleteAsset(publicId: string, resourceType: ResourceType = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export function getThumbnailUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    width: 600,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
  });
}

export function getFullUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    quality: 'auto',
    fetch_format: 'auto',
  });
}

export function getVideoThumbnailUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    start_offset: '0',
    width: 600,
    crop: 'fill',
    quality: 'auto',
    format: 'jpg',
  });
}

export type { UploadApiResponse };
