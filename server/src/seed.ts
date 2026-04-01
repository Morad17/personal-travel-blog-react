/**
 * Seed script — creates an admin user so you can log in.
 * Run: npx ts-node src/seed.ts
 *
 * Also creates one sample country so the app has data.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@travel.blog';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'changeme123';

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.adminUser.create({ data: { email, passwordHash } });
    console.log(`✓ Admin created: ${email} / ${password}`);
  } else {
    console.log(`ℹ Admin already exists: ${email}`);
  }

  // Sample country
  const country = await prisma.country.upsert({
    where: { isoCode: 'MA' },
    update: {},
    create: {
      name: 'Morocco',
      slug: 'morocco',
      isoCode: 'MA',
      flagEmoji: '🇲🇦',
      visitedAt: new Date('2024-03-01'),
      featured: true,
    },
  });
  console.log(`✓ Sample country: ${country.name}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
