import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  readTime: z.coerce.number().int().positive().optional(),
  published: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  tags: z.union([z.string(), z.array(z.string())]).transform((val) =>
    typeof val === 'string' ? val.split(',').map((t) => t.trim()).filter(Boolean) : val
  ).optional(),
  countryId: z.string().min(1),
});

export const updatePostSchema = createPostSchema.partial();

export const createMediaSchema = z.object({
  caption: z.string().optional(),
  order: z.coerce.number().int().optional(),
});
