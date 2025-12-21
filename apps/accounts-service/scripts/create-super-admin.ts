import * as bcrypt from 'bcrypt';
import { PrismaClient, StaffRole } from '../prisma/generated/client';
import { config } from 'dotenv';
import { Logger } from '@nestjs/common';

// Load environment variables
config({ path: '../../.env' });

async function createSuperAdmin() {
  const logger = new Logger('CreateSuperAdmin');
  logger.log('Creating super admin account');

  // Check environment variables before creating app
  const requiredEnvVars = [
    'ACCOUNTS_DATABASE_URL',
    'SUPER_ADMIN_EMAIL',
    'SUPER_ADMIN_PASSWORD',
  ];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    logger.error('Missing required environment variables');
    logger.error(missingVars.join(', '));
    process.exit(1);
  }

  // Initialize Prisma Client directly (no NestJS context)
  const prisma = new PrismaClient({
    datasourceUrl: process.env.ACCOUNTS_DATABASE_URL,
  });

  try {
    // Get credentials from environment variables
    const email = process.env.SUPER_ADMIN_EMAIL!;
    const password = process.env.SUPER_ADMIN_PASSWORD!;
    const fullName = process.env.SUPER_ADMIN_FULL_NAME || 'Super Admin';

    logger.log(`Target email: ${email}`);

    // Check if super admin already exists (not soft-deleted)
    const existingAdmin = await prisma.staffAccount.findFirst({
      where: { email, deletedAt: null },
    });
    if (existingAdmin) {
      logger.warn('Super admin with this email already exists');

      // Update role to SUPER_ADMIN if needed
      if (existingAdmin.role !== StaffRole.SUPER_ADMIN) {
        logger.log('Updating role to SUPER_ADMIN');
        await prisma.staffAccount.update({
          where: { id: existingAdmin.id },
          data: { role: StaffRole.SUPER_ADMIN },
        });
        logger.log('Role updated');
      } else {
        logger.log('User already has SUPER_ADMIN role');
      }

      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create super admin account
    logger.log('Creating account');
    const superAdmin = await prisma.staffAccount.create({
      data: {
        fullName,
        email,
        passwordHash,
        role: StaffRole.SUPER_ADMIN,
        phone: null,
        isMale: null,
        dateOfBirth: null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    logger.log(`Created: ${superAdmin.id} (${superAdmin.email})`);
  } catch (error) {
    const e: any = error;
    if (e.code === 'P1012') {
      logger.error('Missing DATABASE_URL environment variable');
    } else if (e.code === 'P1001') {
      logger.error('Cannot connect to database');
    } else if (e.code === 'ECONNREFUSED') {
      logger.error('Connection refused');
    } else {
      logger.error(e?.message ?? String(e));
    }

    process.exit(1);
  } finally {
    // Clean up
    await prisma.$disconnect();
  }
}

// Run the script
createSuperAdmin()
  .then(() => {
    const logger = new Logger('CreateSuperAdmin');
    logger.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    const logger = new Logger('CreateSuperAdmin');
    logger.error((error as Error).message);
    process.exit(1);
  });
