"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCountries = getCountries;
exports.getCountryBySlug = getCountryBySlug;
exports.createCountry = createCountry;
exports.updateCountry = updateCountry;
exports.deleteCountry = deleteCountry;
const database_1 = require("../config/database");
const cloudinary_service_1 = require("../services/cloudinary.service");
const country_schema_1 = require("../validations/country.schema");
function param(req, key) {
    return req.params[key];
}
async function getCountries(_req, res) {
    const countries = await database_1.prisma.country.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: { select: { posts: { where: { published: true } } } },
        },
    });
    res.json(countries);
}
async function getCountryBySlug(req, res) {
    const slug = param(req, 'slug');
    const country = await database_1.prisma.country.findUnique({
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
async function createCountry(req, res) {
    const parsed = country_schema_1.createCountrySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const file = req.file;
    const coverImageId = file?.filename;
    const coverImageUrl = file?.path;
    const country = await database_1.prisma.country.create({
        data: {
            ...parsed.data,
            visitedAt: parsed.data.visitedAt ? new Date(parsed.data.visitedAt) : undefined,
            coverImageId,
            coverImageUrl,
        },
    });
    res.status(201).json(country);
}
async function updateCountry(req, res) {
    const id = param(req, 'id');
    const parsed = country_schema_1.updateCountrySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const existing = await database_1.prisma.country.findUnique({ where: { id } });
    if (!existing) {
        res.status(404).json({ error: 'Country not found' });
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
    const country = await database_1.prisma.country.update({
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
async function deleteCountry(req, res) {
    const id = param(req, 'id');
    const existing = await database_1.prisma.country.findUnique({ where: { id } });
    if (!existing) {
        res.status(404).json({ error: 'Country not found' });
        return;
    }
    if (existing.coverImageId)
        await (0, cloudinary_service_1.deleteAsset)(existing.coverImageId);
    await database_1.prisma.country.delete({ where: { id } });
    res.status(204).send();
}
//# sourceMappingURL=countries.controller.js.map