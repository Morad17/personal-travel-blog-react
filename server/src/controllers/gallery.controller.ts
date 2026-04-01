import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { deleteAsset, getVideoThumbnailUrl, getThumbnailUrl } from '../services/cloudinary.service';
import { updateGalleryItemSchema } from '../validations/gallery.schema';

function param(req: Request, key: string): string {
  return req.params[key] as string;
}

export async function getGallery(req: Request, res: Response): Promise<void> {
  const { country, type, page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    ...(country && { country: { slug: country } }),
    ...(type && { resourceType: type }),
  };

  const [items, total] = await Promise.all([
    prisma.galleryItem.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: { country: { select: { name: true, slug: true, flagEmoji: true } } },
    }),
    prisma.galleryItem.count({ where }),
  ]);

  res.json({ items, total, page: parseInt(page), limit: parseInt(limit) });
}

export async function createGalleryItems(req: Request, res: Response): Promise<void> {
  const files = req.files as (Express.Multer.File & { path?: string; filename?: string })[] | undefined;
  if (!files?.length) {
    res.status(400).json({ error: 'No files uploaded' });
    return;
  }

  const { caption, tags, countryId } = req.body as Record<string, string | undefined>;
  const parsedTags = tags
    ? tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const items = await Promise.all(
    files.map((file) => {
      const isVideo = file.mimetype.startsWith('video');
      const publicId = file.filename ?? '';
      const secureUrl = file.path ?? '';
      const thumbnailUrl = isVideo
        ? getVideoThumbnailUrl(publicId)
        : getThumbnailUrl(publicId);

      return prisma.galleryItem.create({
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
    })
  );

  res.status(201).json(items);
}

export async function updateGalleryItem(req: Request, res: Response): Promise<void> {
  const id = param(req, 'id');
  const parsed = updateGalleryItemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const item = await prisma.galleryItem.update({
    where: { id },
    data: parsed.data,
  });
  res.json(item);
}

export async function deleteGalleryItem(req: Request, res: Response): Promise<void> {
  const id = param(req, 'id');
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) {
    res.status(404).json({ error: 'Gallery item not found' });
    return;
  }

  await deleteAsset(item.publicId, item.resourceType === 'video' ? 'video' : 'image');
  await prisma.galleryItem.delete({ where: { id } });
  res.status(204).send();
}
