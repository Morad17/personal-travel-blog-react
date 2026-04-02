import { z } from 'zod';

export const createCountrySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  isoCode: z.string().length(2).toUpperCase(),
  flagEmoji: z.string().min(1),
  visitedAt: z.string().optional(),
  featured: z.coerce.boolean().optional(),
});

export const updateCountrySchema = createCountrySchema.partial();
