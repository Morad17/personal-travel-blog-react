import { UploadApiResponse } from 'cloudinary';
import multer from 'multer';
type ResourceType = 'image' | 'video' | 'raw' | 'auto';
export declare const uploadImage: multer.Multer;
export declare const uploadMedia: multer.Multer;
export declare const uploadGallery: multer.Multer;
export declare function deleteAsset(publicId: string, resourceType?: ResourceType): Promise<any>;
export declare function getThumbnailUrl(publicId: string): string;
export declare function getFullUrl(publicId: string): string;
export declare function getVideoThumbnailUrl(publicId: string): string;
export type { UploadApiResponse };
//# sourceMappingURL=cloudinary.service.d.ts.map