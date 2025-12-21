-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'WS');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "RecipientType" AS ENUM ('PATIENT', 'STAFF');

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(120) NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "subject" VARCHAR(200),
    "body" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" VARCHAR(27) NOT NULL,
    "recipient_as" "RecipientType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" TEXT NOT NULL,
    "template_key" VARCHAR(120) NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "recipient_id" VARCHAR(27) NOT NULL,
    "recipient_as" "RecipientType" NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'QUEUED',
    "error_message" TEXT,
    "sent_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_key_key" ON "notification_templates"("key");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_recipient_as_channel_key" ON "notification_preferences"("user_id", "recipient_as", "channel");

-- CreateIndex
CREATE INDEX "idx_notification_deliveries_recipient_created" ON "notification_deliveries"("recipient_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_notification_deliveries_status_created" ON "notification_deliveries"("status", "created_at");

-- CreateIndex
CREATE INDEX "idx_notification_deliveries_template" ON "notification_deliveries"("template_key");
