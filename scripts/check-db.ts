import { PrismaClient as ProviderClient } from '../apps/provider-directory-service/prisma/generated/client';
import * as dotenv from 'dotenv';
dotenv.config();

const providerPrisma = new ProviderClient({
  datasources: {
    db: {
      url: process.env.PROVIDER_DATABASE_URL,
    },
  },
});

async function main() {
  const specs = await providerPrisma.specialty.findMany();
  console.log(`There are ${specs.length} specialties in the DB.`);
  for (const s of specs.slice(0, 5)) {
    console.log(`- ${s.name} (${s.id})`);
  }
}
main()
  .catch(console.error)
  .finally(() => {
    void providerPrisma.$disconnect();
  });
