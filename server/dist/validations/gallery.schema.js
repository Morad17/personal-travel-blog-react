"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGalleryItemSchema = exports.createGalleryItemSchema = void 0;
const zod_1 = require("zod");
exports.createGalleryItemSchema = zod_1.z.object({
    caption: zod_1.z.string().optional(),
    tags: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).transform((val) => typeof val === 'string' ? val.split(',').map((t) => t.trim()).filter(Boolean) : val).optional(),
    countryId: zod_1.z.string().optional(),
});
exports.updateGalleryItemSchema = exports.createGalleryItemSchema.partial();
//# sourceMappingURL=gallery.schema.js.map