import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { sendContactEmail } from '../services/email.service';
import { contactSchema } from '../validations/contact.schema';

function param(req: Request, key: string): string {
  return req.params[key] as string;
}

export async function submitContact(req: Request, res: Response): Promise<void> {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { name, email, subject, message } = parsed.data;

  await prisma.contactMessage.create({ data: { name, email, subject, message } });
  await sendContactEmail({ name, email, subject, message });

  res.status(202).json({ message: 'Message received' });
}

export async function getMessages(_req: Request, res: Response): Promise<void> {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(messages);
}

export async function markRead(req: Request, res: Response): Promise<void> {
  const id = param(req, 'id');
  const message = await prisma.contactMessage.update({
    where: { id },
    data: { read: true },
  });
  res.json(message);
}
