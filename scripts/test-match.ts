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

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'va')
    .replace(/[()-–]/g, ' ')
    .replace(/\s+/g, '')
    .trim();
}

function levDist(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0),
  );
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
      else
        matrix[i][j] =
          Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]) +
          1;
    }
  }
  return matrix[a.length][b.length];
}

async function main() {
  const allSpecialtiesInDb = await providerPrisma.specialty.findMany();
  const specName = 'Khoa Ngoại tổng hợp';
  let bestMatch = allSpecialtiesInDb[0];
  let bestDist = Infinity;
  const normSpec = normalize(specName);

  for (const dbSpec of allSpecialtiesInDb) {
    const normDb = normalize(dbSpec.name);
    const rawDist = levDist(normSpec, normDb);
    let dist = rawDist;
    if (normDb.includes(normSpec) || normSpec.includes(normDb)) {
      dist = dist / 2;
    }

    console.log(
      `[TRACE] dbSpec: '${dbSpec.name}', normDb: '${normDb}', rawDist: ${rawDist}, finalDist: ${dist}`,
    );
    if (dist < bestDist) {
      bestDist = dist;
      bestMatch = dbSpec;
      console.log(`   -> NEW BEST: ${bestMatch.name} with ${bestDist}`);
    }
  }
  console.log(
    `FINAL MATCH: ${specName} => ${bestMatch?.name} (dist ${bestDist})`,
  );
}

main()
  .catch(console.error)
  .finally(() => {
    void providerPrisma.$disconnect();
  });
