import { z } from 'zod';
export declare const createCountrySchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    isoCode: z.ZodString;
    flagEmoji: z.ZodString;
    visitedAt: z.ZodOptional<z.ZodString>;
    featured: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export declare const updateCountrySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    isoCode: z.ZodOptional<z.ZodString>;
    flagEmoji: z.ZodOptional<z.ZodString>;
    visitedAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    featured: z.ZodOptional<z.ZodOptional<z.ZodCoercedBoolean<unknown>>>;
}, z.core.$strip>;
//# sourceMappingURL=country.schema.d.ts.map