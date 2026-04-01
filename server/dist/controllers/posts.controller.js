"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPosts = getPosts;
exports.getFeaturedPosts = getFeaturedPosts;
exports.getPostBySlug = getPostBySlug;
exports.createPost = createPost;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
exports.addPostMedia = addPostMedia;
exports.deletePostMedia = deletePostMedia;
const database_1 = require("../config/database");
const cloudinary_service_1 = require("../services/cloudinary.service");
const post_schema_1 = require("../validations/post.schema");
function estimateReadTime(content) {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
}
async function getPosts(req, res) {
    const { country, tag, page = '1', limit = '9' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {
        published: true,
        ...(country && { country: { slug: country } }),
        ...(tag && { tags: { has: tag } }),
    };
    const [posts, total] = await Promise.all([
        database_1.prisma.post.findMany({
            where,
            skip,
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            include: { country: true },
        }),
        database_1.prisma.post.count({ where }),
    ]);
    res.json({ posts, total, page: parseInt(page), limit: parseInt(limit) });
}
async function getFeaturedPosts(_req, res) {
    const posts = await database_1.prisma.post.findMany({
        where: { published: true, featured: true },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { country: true },
    });
    res.json(posts);
}
async function getPostBySlug(req, res) {
    const { slug } = req.params;
    const post = await database_1.prisma.post.findUnique({
        where: { slug },
        include: {
            country: true,
            mediaItems: { orderBy: { order: 'asc' } },
        },
    });
    if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
    }
    res.json(post);
}
async function createPost(req, res) {
    const parsed = post_schema_1.createPostSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const file = req.file;
    const coverImageId = file?.filename;
    const coverImageUrl = file?.path;
    const post = await database_1.prisma.post.create({
        data: {
            ...parsed.data,
            tags: parsed.data.tags ?? [],
            readTime: parsed.data.readTime ?? estimateReadTime(parsed.data.content),
            coverImageId,
            coverImageUrl,
        },
        include: { country: true },
    });
    res.status(201).json(post);
}
async function updatePost(req, res) {
    const { id } = req.params;
    const parsed = post_schema_1.updatePostSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const existing = await database_1.prisma.post.findUnique({ where: { id } });
    if (!existing) {
        res.status(404).json({ error: 'Post not found' });
        return;
    }
    const file = req.file;
    let coverImageId = existing.coverImageId ?? undefined;
    let coverImageUrl = existing.coverImageUrl ?? undefined;
    if (file) {
        if (existing.coverImageId)
            await (0, cloudinary_service_1.deleteAsset)(existing.coverImageId);
        coverImageId = file.filename;
        coverImageUrl = file.path;
    }
    const post = await database_1.prisma.post.update({
        where: { id },
        data: {
            ...parsed.data,
            readTime: parsed.data.content
                ? estimateReadTime(parsed.data.content)
                : existing.readTime,
            coverImageId,
            coverImageUrl,
        },
        include: { country: true },
    });
    res.json(post);
}
async function deletePost(req, res) {
    const { id } = req.params;
    const existing = await database_1.prisma.post.findUnique({
        where: { id },
        include: { mediaItems: true },
    });
    if (!existing) {
        res.status(404).json({ error: 'Post not found' });
        return;
    }
    if (existing.coverImageId)
        await (0, cloudinary_service_1.deleteAsset)(existing.coverImageId);
    await Promise.all(existing.mediaItems.map((m) => (0, cloudinary_service_1.deleteAsset)(m.publicId, m.resourceType === 'video' ? 'video' : 'image')));
    await database_1.prisma.post.delete({ where: { id } });
    res.status(204).send();
}
async function addPostMedia(req, res) {
    const { id } = req.params;
    const files = req.files;
    if (!files?.length) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
    }
    const mediaItems = await Promise.all(files.map((file, index) => database_1.prisma.postMedia.create({
        data: {
            publicId: file.filename,
            secureUrl: file.path ?? '',
            resourceType: file.mimetype.startsWith('video') ? 'video' : 'image',
            order: index,
            postId: id,
        },
    })));
    res.status(201).json(mediaItems);
}
async function deletePostMedia(req, res) {
    const { mediaId } = req.params;
    const media = await database_1.prisma.postMedia.findUnique({ where: { id: mediaId } });
    if (!media) {
        res.status(404).json({ error: 'Media not found' });
        return;
    }
    await (0, cloudinary_service_1.deleteAsset)(media.publicId, media.resourceType === 'video' ? 'video' : 'image');
    await database_1.prisma.postMedia.delete({ where: { id: mediaId } });
    res.status(204).send();
}
//# sourceMappingURL=posts.controller.js.map