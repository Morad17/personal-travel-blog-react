import { Resend } from 'resend';
import { env } from '../config/env';

const resend = new Resend(env.RESEND_API_KEY);

interface ContactEmailParams {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactEmail(params: ContactEmailParams) {
  const { name, email, subject, message } = params;

  return resend.emails.send({
    from: 'Travel Blog <onboarding@resend.dev>',
    to: env.CONTACT_EMAIL,
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
