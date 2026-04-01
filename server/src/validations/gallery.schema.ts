import { z } from 'zod';

export const createGalleryItemSchema = z.object({
  caption: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).transform((val) =>
    typeof val === 'string' ? val.split(',').map((t) => t.trim()).filter(Boolean) : val
  ).optional(),
  countryId: z.string().optional(),
});

export const updateGalleryItemSchema = createGalleryItemSchema.partial();
