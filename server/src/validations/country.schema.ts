import { z } from 'zod';

const visitSchema = z.object({
  date: z.string().min(1),
  cities: z.array(z.string().min(1)).min(1),
});

export const createCountrySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  isoCode: z.string().length(2).toUpperCase(),
  flagEmoji: z.string().min(1),
  featured: z.coerce.boolean().optional(),
  // visits arrive as a JSON string in multipart FormData
  visits: z.preprocess(
    (v) => (typeof v === 'string' ? JSON.parse(v) : v),
    z.array(visitSchema).optional().default([]),
  ),
});

export const updateCountrySchema = createCountrySchema.partial();
