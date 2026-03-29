import { PrismaClient as ProviderClient } from '../apps/provider-directory-service/prisma/generated/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const providerPrisma = new ProviderClient({
  datasources: {
    db: {
      url: process.env.PROVIDER_DATABASE_URL,
    },
  },
});

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'va')
    .replace(/[()-–]/g, ' ')
    .replace(/\s+/g, '')
    .trim();
}

// Simple Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
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
  console.log('--- Cleaning Up & Re-mapping Specialties ---');

  // 1. Fetch newly scraped data to know which ones are the source of truth
  const rawDataPath = path.join(
    __dirname,
    '../../crawl-data/data/specialties-data.json',
  );
  const rawData = fs.readFileSync(rawDataPath, 'utf-8');
  const scrapedSpecialties = JSON.parse(rawData);
  const validNames: string[] = scrapedSpecialties.map(
    (s: any) => s.name as string,
  );

  // 2. Load all current specialties in DB
  const allDbSpecialties = await providerPrisma.specialty.findMany();

  const validDbSpecIds = new Set<string>();

  // Try to find the valid DB records that correspond to the 46 scraped names
  for (const scrapedName of validNames) {
    const match = allDbSpecialties.find(
      (dbSpec) =>
        dbSpec.name === scrapedName ||
        normalizeName(dbSpec.name) === normalizeName(scrapedName),
    );
    if (match) {
      validDbSpecIds.add(match.id);
    }
  }

  // 3. For any DB specialty not in validDbSpecIds, remap its doctors and then delete it
  const validDbList = Array.from(validDbSpecIds).map(
    (id) => allDbSpecialties.find((s) => s.id === id)!,
  );

  for (const dbSpec of allDbSpecialties) {
    if (!validDbSpecIds.has(dbSpec.id)) {
      console.log(
        `[OBSOLETE] Found old specialty: "${dbSpec.name}". Determining replacement...`,
      );

      // Find best replacement from valid list
      let bestMatch = validDbList[0];
      let bestDist = Infinity;

      const normOld = normalizeName(dbSpec.name);
      for (const validSpec of validDbList) {
        const normNew = normalizeName(validSpec.name);
        // special hardcode rules if necessary:
        let dist = levenshteinDistance(normOld, normNew);
        if (normOld.includes(normNew) || normNew.includes(normOld)) {
          dist = dist / 2; // heavily favor inclusion
        }
        if (dist < bestDist) {
          bestDist = dist;
          bestMatch = validSpec;
        }
      }

      console.log(
        `  -> Mapping "${dbSpec.name}" to "${bestMatch.name}" (Dist: ${bestDist})`,
      );

      // 4. Update doctor specialties
      const docSpecs = await providerPrisma.doctorSpecialty.findMany({
        where: { specialtyId: dbSpec.id },
      });

      for (const ds of docSpecs) {
        // Try to upsert new relationship
        try {
          await providerPrisma.doctorSpecialty.upsert({
            where: {
              doctorId_specialtyId: {
                doctorId: ds.doctorId,
                specialtyId: bestMatch.id,
              },
            },
            create: {
              doctorId: ds.doctorId,
              specialtyId: bestMatch.id,
            },
            update: {},
          });
          // Delete the old
          await providerPrisma.doctorSpecialty.delete({
            where: { id: ds.id },
          });
        } catch (e) {
          console.error('Error remapping specialty for doctor:', e);
        }
      }

      // 5. Finally, delete the old specialty
      try {
        await providerPrisma.specialty.delete({
          where: { id: dbSpec.id },
        });
        console.log(`  -> Deleted old specialty: ${dbSpec.name}`);
      } catch (e) {
        console.log(
          `  -> Could not delete ${dbSpec.name} (probably in use elsewhere):`,
          e.message,
        );
      }
    }
  }

  console.log('--- Process Completed ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void providerPrisma.$disconnect();
  });
