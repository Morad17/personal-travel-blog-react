"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitContact = submitContact;
exports.getMessages = getMessages;
exports.markRead = markRead;
const database_1 = require("../config/database");
const email_service_1 = require("../services/email.service");
const contact_schema_1 = require("../validations/contact.schema");
function param(req, key) {
    return req.params[key];
}
async function submitContact(req, res) {
    const parsed = contact_schema_1.contactSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { name, email, subject, message } = parsed.data;
    await database_1.prisma.contactMessage.create({ data: { name, email, subject, message } });
    await (0, email_service_1.sendContactEmail)({ name, email, subject, message });
    res.status(202).json({ message: 'Message received' });
}
async function getMessages(_req, res) {
    const messages = await database_1.prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
    });
    res.json(messages);
}
async function markRead(req, res) {
    const id = param(req, 'id');
    const message = await database_1.prisma.contactMessage.update({
        where: { id },
        data: { read: true },
    });
    res.json(message);
}
//# sourceMappingURL=contact.controller.js.map