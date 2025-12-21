-- AlterEnum
ALTER TYPE "AssetEntityType" ADD VALUE 'SPECIALTY';

-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "thumbnail_url" VARCHAR(255);
