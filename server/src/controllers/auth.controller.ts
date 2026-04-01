import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ adminId: admin.id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`,
  });

  res.json({ token, expiresIn: env.JWT_EXPIRES_IN });
}
