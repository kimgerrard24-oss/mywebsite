import { prisma } from './db';

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users:', users);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
  });
