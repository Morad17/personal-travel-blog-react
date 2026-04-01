import { z } from 'zod';
export declare const createPostSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodString;
    excerpt: z.ZodString;
    content: z.ZodString;
    readTime: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    published: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    featured: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    tags: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>, z.ZodTransform<string[], string | string[]>>>;
    countryId: z.ZodString;
}, z.core.$strip>;
export declare const updatePostSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    excerpt: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    readTime: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    published: z.ZodOptional<z.ZodOptional<z.ZodCoercedBoolean<unknown>>>;
    featured: z.ZodOptional<z.ZodOptional<z.ZodCoercedBoolean<unknown>>>;
    tags: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>, z.ZodTransform<string[], string | string[]>>>>;
    countryId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createMediaSchema: z.ZodObject<{
    caption: z.ZodOptional<z.ZodString>;
    order: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
//# sourceMappingURL=post.schema.d.ts.map