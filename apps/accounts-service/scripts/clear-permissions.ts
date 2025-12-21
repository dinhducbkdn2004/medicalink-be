import { PrismaClient } from '../prisma/generated/client';
import { config } from 'dotenv';
import { resolve } from 'path';
import { Logger } from '@nestjs/common';

config({ path: resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient({
  datasourceUrl: process.env.ACCOUNTS_DATABASE_URL,
  log: ['error', 'warn'],
  errorFormat: 'pretty',
});

async function clearPermissions() {
  Logger.log('Starting to clear permission data...');

  try {
    await prisma.$connect();
    Logger.log('Database connected successfully.');

    // Deleting records in an order that respects foreign key constraints.
    Logger.log('Deleting UserPermission records...');
    await prisma.userPermission.deleteMany({});

    Logger.log('Deleting GroupPermission records...');
    await prisma.groupPermission.deleteMany({});

    Logger.log('Deleting UserGroup records...');
    await prisma.userGroup.deleteMany({});

    Logger.log('Deleting Permission records...');
    await prisma.permission.deleteMany({});

    Logger.log('Deleting Group records...');
    await prisma.group.deleteMany({});

    Logger.log('Deleting AuthVersion records...');
    await prisma.authVersion.deleteMany({});

    Logger.log('All permission data has been cleared successfully!');
  } catch (error) {
    Logger.error('Error clearing permission data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    Logger.log('Database connection closed.');
  }
}

// Run if called directly
if (require.main === module) {
  void clearPermissions();
}
