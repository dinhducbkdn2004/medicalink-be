-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'DOCTOR');

-- CreateEnum
CREATE TYPE "PermissionEffect" AS ENUM ('ALLOW', 'DENY');

-- CreateTable
CREATE TABLE "staff_accounts" (
    "id" TEXT NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "StaffRole" NOT NULL DEFAULT 'ADMIN',
    "phone" VARCHAR(32),
    "is_male" BOOLEAN,
    "date_of_birth" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "staff_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "resource" VARCHAR(100) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "user_id" VARCHAR(27) NOT NULL,
    "permission_id" VARCHAR(27) NOT NULL,
    "effect" "PermissionEffect" NOT NULL DEFAULT 'ALLOW',
    "tenant_id" VARCHAR(27),
    "conditions" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "tenant_id" VARCHAR(27),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_groups" (
    "id" TEXT NOT NULL,
    "user_id" VARCHAR(27) NOT NULL,
    "group_id" VARCHAR(27) NOT NULL,
    "tenant_id" VARCHAR(27),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_permissions" (
    "id" TEXT NOT NULL,
    "group_id" VARCHAR(27) NOT NULL,
    "permission_id" VARCHAR(27) NOT NULL,
    "effect" "PermissionEffect" NOT NULL DEFAULT 'ALLOW',
    "conditions" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "group_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_versions" (
    "id" TEXT NOT NULL,
    "user_id" VARCHAR(27) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "auth_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_accounts_email_key" ON "staff_accounts"("email");

-- CreateIndex
CREATE INDEX "idx_permissions_resource" ON "permissions"("resource");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "permissions"("resource", "action");

-- CreateIndex
CREATE INDEX "idx_user_permissions_user" ON "user_permissions"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_permissions_tenant" ON "user_permissions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_user_id_permission_id_tenant_id_key" ON "user_permissions"("user_id", "permission_id", "tenant_id");

-- CreateIndex
CREATE INDEX "idx_groups_tenant" ON "groups"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "groups_name_tenant_id_key" ON "groups"("name", "tenant_id");

-- CreateIndex
CREATE INDEX "idx_user_groups_user" ON "user_groups"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_groups_group" ON "user_groups"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_groups_user_id_group_id_tenant_id_key" ON "user_groups"("user_id", "group_id", "tenant_id");

-- CreateIndex
CREATE INDEX "idx_group_permissions_group" ON "group_permissions"("group_id");

-- CreateIndex
CREATE INDEX "idx_group_permissions_permission" ON "group_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_permissions_group_id_permission_id_key" ON "group_permissions"("group_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_versions_user_id_key" ON "auth_versions"("user_id");

-- CreateIndex
CREATE INDEX "idx_auth_versions_user" ON "auth_versions"("user_id");

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "staff_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "staff_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_permissions" ADD CONSTRAINT "group_permissions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_permissions" ADD CONSTRAINT "group_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_versions" ADD CONSTRAINT "auth_versions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "staff_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
