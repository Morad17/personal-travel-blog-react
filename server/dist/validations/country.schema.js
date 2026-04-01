"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCountrySchema = exports.createCountrySchema = void 0;
const zod_1 = require("zod");
exports.createCountrySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1).regex(/^[a-z0-9-]+$/),
    isoCode: zod_1.z.string().length(2).toUpperCase(),
    flagEmoji: zod_1.z.string().min(1),
    visitedAt: zod_1.z.string().datetime().optional(),
    featured: zod_1.z.coerce.boolean().optional(),
});
exports.updateCountrySchema = exports.createCountrySchema.partial();
//# sourceMappingURL=country.schema.js.map