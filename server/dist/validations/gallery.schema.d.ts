import { z } from 'zod';
export declare const createGalleryItemSchema: z.ZodObject<{
    caption: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>, z.ZodTransform<string[], string | string[]>>>;
    countryId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateGalleryItemSchema: z.ZodObject<{
    caption: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    tags: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>, z.ZodTransform<string[], string | string[]>>>>;
    countryId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
//# sourceMappingURL=gallery.schema.d.ts.map