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
  const docs = await providerPrisma.doctor.findMany({
    take: 10,
    include: { doctorSpecialties: { include: { specialty: true } } },
  });
  for (const doc of docs) {
    console.log(`Doctor: ${doc.id}`);
    const specNames = doc.doctorSpecialties
      .map((ds) => ds.specialty.name)
      .join(', ');
    console.log(`  Specialties: ${specNames || 'None'}`);
  }
}
main()
  .catch(console.error)
  .finally(() => {
    void providerPrisma.$disconnect();
  });
