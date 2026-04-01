"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendContactEmail = sendContactEmail;
const resend_1 = require("resend");
const env_1 = require("../config/env");
const resend = new resend_1.Resend(env_1.env.RESEND_API_KEY);
async function sendContactEmail(params) {
    const { name, email, subject, message } = params;
    return resend.emails.send({
        from: 'Travel Blog <onboarding@resend.dev>',
        to: env_1.env.CONTACT_EMAIL,
        subject: `[Travel Blog Contact] ${subject}`,
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F59E0B;">New Contact Message</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr style="border-color: #1E1E2E;" />
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `,
        replyTo: email,
    });
}
//# sourceMappingURL=email.service.js.map