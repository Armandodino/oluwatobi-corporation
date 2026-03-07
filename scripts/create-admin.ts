import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@oluwatobi-ci.com' },
    update: {
      id: 'max',
      password: 'Oluwatobi@@',
      updatedAt: new Date(),
    },
    create: {
      id: 'max',
      email: 'admin@oluwatobi-ci.com',
      name: 'Administrateur',
      password: 'Oluwatobi@@',
      role: 'admin',
    },
  });

  console.log('✅ Admin user created/updated:', admin);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
