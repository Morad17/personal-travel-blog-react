"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGallery = getGallery;
exports.createGalleryItems = createGalleryItems;
exports.updateGalleryItem = updateGalleryItem;
exports.deleteGalleryItem = deleteGalleryItem;
const database_1 = require("../config/database");
const cloudinary_service_1 = require("../services/cloudinary.service");
const gallery_schema_1 = require("../validations/gallery.schema");
async function getGallery(req, res) {
    const { country, type, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {
        ...(country && { country: { slug: country } }),
        ...(type && { resourceType: type }),
    };
    const [items, total] = await Promise.all([
        database_1.prisma.galleryItem.findMany({
            where,
            skip,
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            include: { country: { select: { name: true, slug: true, flagEmoji: true } } },
        }),
        database_1.prisma.galleryItem.count({ where }),
    ]);
    res.json({ items, total, page: parseInt(page), limit: parseInt(limit) });
}
async function createGalleryItems(req, res) {
    const files = req.files;
    if (!files?.length) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
    }
    const { caption, tags, countryId } = req.body;
    const parsedTags = tags
        ? (typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : tags)
        : [];
    const items = await Promise.all(files.map((file) => {
        const isVideo = file.mimetype.startsWith('video');
        const publicId = file.filename;
        const secureUrl = file.path ?? '';
        const thumbnailUrl = isVideo
            ? (0, cloudinary_service_1.getVideoThumbnailUrl)(publicId)
            : (0, cloudinary_service_1.getThumbnailUrl)(publicId);
        return database_1.prisma.galleryItem.create({
            data: {
                publicId,
                secureUrl,
                thumbnailUrl,
                resourceType: isVideo ? 'video' : 'image',
                caption: caption || undefined,
                tags: parsedTags,
                countryId: countryId || undefined,
            },
        });
    }));
    res.status(201).json(items);
}
async function updateGalleryItem(req, res) {
    const { id } = req.params;
    const parsed = gallery_schema_1.updateGalleryItemSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const item = await database_1.prisma.galleryItem.update({
        where: { id },
        data: parsed.data,
    });
    res.json(item);
}
async function deleteGalleryItem(req, res) {
    const { id } = req.params;
    const item = await database_1.prisma.galleryItem.findUnique({ where: { id } });
    if (!item) {
        res.status(404).json({ error: 'Gallery item not found' });
        return;
    }
    await (0, cloudinary_service_1.deleteAsset)(item.publicId, item.resourceType === 'video' ? 'video' : 'image');
    await database_1.prisma.galleryItem.delete({ where: { id } });
    res.status(204).send();
}
//# sourceMappingURL=gallery.controller.js.map