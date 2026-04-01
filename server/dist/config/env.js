"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('5000'),
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL is required'),
    DIRECT_URL: zod_1.z.string().min(1, 'DIRECT_URL is required'),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
    CLOUDINARY_API_KEY: zod_1.z.string().min(1, 'CLOUDINARY_API_KEY is required'),
    CLOUDINARY_API_SECRET: zod_1.z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
    RESEND_API_KEY: zod_1.z.string().min(1, 'RESEND_API_KEY is required'),
    CONTACT_EMAIL: zod_1.z.string().email('CONTACT_EMAIL must be a valid email'),
    CLIENT_URL: zod_1.z.string().default('http://localhost:5173'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('Invalid environment variables:');
    parsed.error.issues.forEach((issue) => {
        console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map