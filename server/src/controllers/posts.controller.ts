import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { deleteAsset } from '../services/cloudinary.service';
import { createPostSchema, updatePostSchema } from '../validations/post.schema';

function estimateReadTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function param(req: Request, key: string): string {
  return req.params[key] as string;
}

export async function getPosts(req: Request, res: Response): Promise<void> {
  const { country, tag, page = '1', limit = '9' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    published: true,
    ...(country && { country: { slug: country } }),
    ...(tag && { tags: { has: tag } }),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: { country: true },
    }),
    prisma.post.count({ where }),
  ]);

  res.json({ posts, total, page: parseInt(page), limit: parseInt(limit) });
}

export async function getFeaturedPosts(_req: Request, res: Response): Promise<void> {
  const posts = await prisma.post.findMany({
    where: { published: true, featured: true },
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { country: true },
  });
  res.json(posts);
}

export async function getPostBySlug(req: Request, res: Response): Promise<void> {
  const slug = param(req, 'slug');
  const post = await prisma.post.findUnique({
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

export async function createPost(req: Request, res: Response): Promise<void> {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const file = req.file as (Express.Multer.File & { path?: string; filename?: string }) | undefined;
  const coverImageId = file?.filename;
  const coverImageUrl = file?.path;

  const post = await prisma.post.create({
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

export async function updatePost(req: Request, res: Response): Promise<void> {
  const id = param(req, 'id');
  const parsed = updatePostSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  const file = req.file as (Express.Multer.File & { path?: string; filename?: string }) | undefined;
  let coverImageId = existing.coverImageId ?? undefined;
  let coverImageUrl = existing.coverImageUrl ?? undefined;

  if (file) {
    if (existing.coverImageId) await deleteAsset(existing.coverImageId);
    coverImageId = file.filename;
    coverImageUrl = file.path;
  }

  const post = await prisma.post.update({
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

export async function deletePost(req: Request, res: Response): Promise<void> {
  const id = param(req, 'id');
  const existing = await prisma.post.findUnique({
    where: { id },
    include: { mediaItems: true },
  });
  if (!existing) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  if (existing.coverImageId) await deleteAsset(existing.coverImageId);
  await Promise.all(
    existing.mediaItems.map((m) =>
      deleteAsset(m.publicId, m.resourceType === 'video' ? 'video' : 'image')
    )
  );

  await prisma.post.delete({ where: { id } });
  res.status(204).send();
}

export async function addPostMedia(req: Request, res: Response): Promise<void> {
  const id = param(req, 'id');
  const files = req.files as (Express.Multer.File & { path?: string; filename?: string })[] | undefined;

  if (!files?.length) {
    res.status(400).json({ error: 'No files uploaded' });
    return;
  }

  const mediaItems = await Promise.all(
    files.map((file, index) =>
      prisma.postMedia.create({
        data: {
          publicId: file.filename ?? '',
          secureUrl: file.path ?? '',
          resourceType: file.mimetype.startsWith('video') ? 'video' : 'image',
          order: index,
          postId: id,
        },
      })
    )
  );
  res.status(201).json(mediaItems);
}

export async function deletePostMedia(req: Request, res: Response): Promise<void> {
  const mediaId = param(req, 'mediaId');
  const media = await prisma.postMedia.findUnique({ where: { id: mediaId } });
  if (!media) {
    res.status(404).json({ error: 'Media not found' });
    return;
  }

  await deleteAsset(media.publicId, media.resourceType === 'video' ? 'video' : 'image');
  await prisma.postMedia.delete({ where: { id: mediaId } });
  res.status(204).send();
}
