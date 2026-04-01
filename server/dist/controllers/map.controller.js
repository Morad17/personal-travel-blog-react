"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVisitedCountries = getVisitedCountries;
const database_1 = require("../config/database");
async function getVisitedCountries(_req, res) {
    const countries = await database_1.prisma.country.findMany({
        select: {
            isoCode: true,
            name: true,
            slug: true,
            flagEmoji: true,
            coverImageUrl: true,
            visitedAt: true,
            _count: { select: { posts: { where: { published: true } } } },
        },
        orderBy: { name: 'asc' },
    });
    const result = countries.map((c) => ({
        isoCode: c.isoCode,
        name: c.name,
        slug: c.slug,
        flagEmoji: c.flagEmoji,
        coverImageUrl: c.coverImageUrl,
        visitedAt: c.visitedAt,
        postCount: c._count.posts,
    }));
    res.json(result);
}
//# sourceMappingURL=map.controller.js.map