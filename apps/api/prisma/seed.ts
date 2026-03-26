import { PrismaClient, AdminRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 12);

  await prisma.admin.upsert({
    where: { email: 'admin@mspi.tn' },
    update: {},
    create: {
      email: 'admin@mspi.tn',
      passwordHash,
      name: 'Super Admin',
      role: AdminRole.SUPER_ADMIN,
      active: true,
    },
  });

  console.log('Seed complete: super_admin created (admin@mspi.tn)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
