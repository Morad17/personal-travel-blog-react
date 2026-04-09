import { Request, Response } from 'express';
import { prisma } from '../config/database';

export async function getVisitedCountries(_req: Request, res: Response): Promise<void> {
  const countries = await prisma.country.findMany({
    select: {
      isoCode: true,
      name: true,
      slug: true,
      flagEmoji: true,
      coverImageUrl: true,
      visits: { orderBy: { date: 'asc' }, take: 1 },
      _count: { select: { posts: { where: { published: true } } } },
    },
    where: { visits: { some: {} } },
    orderBy: { name: 'asc' },
  });

  const result = countries.map((c) => ({
    isoCode: c.isoCode,
    name: c.name,
    slug: c.slug,
    flagEmoji: c.flagEmoji,
    coverImageUrl: c.coverImageUrl,
    visitedAt: c.visits[0]?.date ?? null,
    postCount: c._count.posts,
  }));

  res.json(result);
}
