import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update existing admin email
  const admin = await prisma.user.update({
    where: { id: 'admin-001' },
    data: {
      email: 'admin@oluwatobi-ci.com',
    },
  });

  console.log('Admin user updated:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
