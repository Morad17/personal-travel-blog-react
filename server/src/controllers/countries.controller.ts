import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { deleteAsset } from '../services/cloudinary.service';
import { createCountrySchema, updateCountrySchema } from '../validations/country.schema';

function param(req: Request, key: string): string {
  return req.params[key] as string;
}

export async function getCountries(_req: Request, res: Response): Promise<void> {
  const countries = await prisma.country.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { posts: { where: { published: true } } } },
    },
  });
  res.json(countries);
}

export async function getCountryBySlug(req: Request, res: Response): Promise<void> {
  const slug = param(req, 'slug');
  const country = await prisma.country.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { published: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!country) {
    res.status(404).json({ error: 'Country not found' });
    return;
  }
  res.json(country);
}

export async function createCountry(req: Request, res: Response): Promise<void> {
  const parsed = createCountrySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const file = req.file as (Express.Multer.File & { path?: string; filename?: string }) | undefined;
  const coverImageId = file?.filename;
  const coverImageUrl = file?.path;

  const country = await prisma.country.create({
    data: {
      ...parsed.data,
      visitedAt: parsed.data.visitedAt ? new Date(parsed.data.visitedAt) : undefined,
      coverImageId,
      coverImageUrl,
    },
  });
  res.status(201).json(country);
}

export async function updateCountry(req: Request, res: Response): Promise<void> {
  const id = param(req, 'id');
  const parsed = updateCountrySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.country.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Country not found' });
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

  const country = await prisma.country.update({
    where: { id },
    data: {
      ...parsed.data,
      visitedAt: parsed.data.visitedAt ? new Date(parsed.data.visitedAt) : undefined,
      coverImageId,
      coverImageUrl,
    },
  });
  res.json(country);
}

export async function deleteCountry(req: Request, res: Response): Promise<void> {
  const id = param(req, 'id');
  const existing = await prisma.country.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Country not found' });
    return;
  }
  if (existing.coverImageId) await deleteAsset(existing.coverImageId);
  await prisma.country.delete({ where: { id } });
  res.status(204).send();
}
