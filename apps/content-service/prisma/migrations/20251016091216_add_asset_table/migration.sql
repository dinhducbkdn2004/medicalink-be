/*
  Warnings:

  - You are about to drop the column `doctor_id` on the `answers` table. All the data in the column will be lost.
  - Added the required column `author_id` to the `answers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AssetEntityType" AS ENUM ('BLOG', 'QUESTION', 'REVIEW', 'DOCTOR');

-- DropIndex
DROP INDEX "public"."idx_answers_doctor_created";

-- AlterTable
ALTER TABLE "answers" DROP COLUMN "doctor_id",
ADD COLUMN     "author_id" VARCHAR(27) NOT NULL;

-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "specialty_ids" VARCHAR(27)[];

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "specialty_id" VARCHAR(27);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "entityType" "AssetEntityType" NOT NULL,
    "entity_id" VARCHAR(27) NOT NULL,
    "public_id" VARCHAR(160) NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_public_id_key" ON "assets"("public_id");

-- CreateIndex
CREATE INDEX "idx_assets_entity" ON "assets"("entityType", "entity_id");

-- CreateIndex
CREATE INDEX "idx_answers_author_created" ON "answers"("author_id", "created_at");
