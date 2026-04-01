"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactSchema = void 0;
const zod_1 = require("zod");
exports.contactSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    subject: zod_1.z.string().min(1, 'Subject is required'),
    message: zod_1.z.string().min(10, 'Message must be at least 10 characters'),
});
//# sourceMappingURL=contact.schema.js.map