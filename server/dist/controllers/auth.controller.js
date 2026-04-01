"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const env_1 = require("../config/env");
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }
    const admin = await database_1.prisma.adminUser.findUnique({ where: { email } });
    if (!admin) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }
    const valid = await bcryptjs_1.default.compare(password, admin.passwordHash);
    if (!valid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ adminId: admin.id }, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    });
    res.json({ token, expiresIn: env_1.env.JWT_EXPIRES_IN });
}
//# sourceMappingURL=auth.controller.js.map