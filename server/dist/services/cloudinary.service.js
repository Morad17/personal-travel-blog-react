"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadGallery = exports.uploadMedia = exports.uploadImage = void 0;
exports.deleteAsset = deleteAsset;
exports.getThumbnailUrl = getThumbnailUrl;
exports.getFullUrl = getFullUrl;
exports.getVideoThumbnailUrl = getVideoThumbnailUrl;
const cloudinary_1 = require("../config/cloudinary");
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
function createStorage(folder, resourceType = 'auto') {
    return new multer_storage_cloudinary_1.CloudinaryStorage({
        cloudinary: cloudinary_1.cloudinary,
        params: {
            folder: `travel-blog/${folder}`,
            resource_type: resourceType,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'avi'],
        },
    });
}
exports.uploadImage = (0, multer_1.default)({ storage: createStorage('images', 'image') });
exports.uploadMedia = (0, multer_1.default)({ storage: createStorage('media', 'auto') });
exports.uploadGallery = (0, multer_1.default)({ storage: createStorage('gallery', 'auto') });
async function deleteAsset(publicId, resourceType = 'image') {
    return cloudinary_1.cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
function getThumbnailUrl(publicId) {
    return cloudinary_1.cloudinary.url(publicId, {
        width: 600,
        crop: 'fill',
        quality: 'auto',
        fetch_format: 'auto',
    });
}
function getFullUrl(publicId) {
    return cloudinary_1.cloudinary.url(publicId, {
        quality: 'auto',
        fetch_format: 'auto',
    });
}
function getVideoThumbnailUrl(publicId) {
    return cloudinary_1.cloudinary.url(publicId, {
        resource_type: 'video',
        start_offset: '0',
        width: 600,
        crop: 'fill',
        quality: 'auto',
        format: 'jpg',
    });
}
//# sourceMappingURL=cloudinary.service.js.map