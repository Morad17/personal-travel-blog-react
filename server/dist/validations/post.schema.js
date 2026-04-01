"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMediaSchema = exports.updatePostSchema = exports.createPostSchema = void 0;
const zod_1 = require("zod");
exports.createPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1).regex(/^[a-z0-9-]+$/),
    excerpt: zod_1.z.string().min(1),
    content: zod_1.z.string().min(1),
    readTime: zod_1.z.coerce.number().int().positive().optional(),
    published: zod_1.z.coerce.boolean().optional(),
    featured: zod_1.z.coerce.boolean().optional(),
    tags: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).transform((val) => typeof val === 'string' ? val.split(',').map((t) => t.trim()).filter(Boolean) : val).optional(),
    countryId: zod_1.z.string().min(1),
});
exports.updatePostSchema = exports.createPostSchema.partial();
exports.createMediaSchema = zod_1.z.object({
    caption: zod_1.z.string().optional(),
    order: zod_1.z.coerce.number().int().optional(),
});
//# sourceMappingURL=post.schema.js.map