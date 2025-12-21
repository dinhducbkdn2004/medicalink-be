-- CreateTable
CREATE TABLE "specialties" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialty_info_sections" (
    "id" TEXT NOT NULL,
    "specialty_id" VARCHAR(27) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "content" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specialty_info_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_locations" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "address" VARCHAR(255),
    "phone" VARCHAR(32),
    "timezone" VARCHAR(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "work_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "staff_account_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "degree" VARCHAR(100),
    "position" TEXT[],
    "introduction" TEXT,
    "memberships" TEXT[],
    "awards" TEXT[],
    "research" TEXT,
    "training_process" TEXT[],
    "experience" TEXT[],
    "avatar_url" VARCHAR,
    "portrait" VARCHAR,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_specialties" (
    "id" TEXT NOT NULL,
    "doctor_id" VARCHAR(27) NOT NULL,
    "specialty_id" VARCHAR(27) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_work_locations" (
    "id" TEXT NOT NULL,
    "doctor_id" VARCHAR(27) NOT NULL,
    "location_id" VARCHAR(27) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_work_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "doctor_id" VARCHAR(27) NOT NULL,
    "location_id" VARCHAR(27) NOT NULL,
    "service_date" DATE NOT NULL,
    "time_start" TIME(6) NOT NULL,
    "time_end" TIME(6) NOT NULL,
    "capacity" SMALLINT NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "specialties_name_key" ON "specialties"("name");

-- CreateIndex
CREATE UNIQUE INDEX "specialties_slug_key" ON "specialties"("slug");

-- CreateIndex
CREATE INDEX "idx_specialty_info_sections_specialty" ON "specialty_info_sections"("specialty_id");

-- CreateIndex
CREATE INDEX "idx_work_locations_name" ON "work_locations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_staff_account_id_key" ON "doctors"("staff_account_id");

-- CreateIndex
CREATE INDEX "idx_doctor_specialties_specialty" ON "doctor_specialties"("specialty_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_specialties_doctor_id_specialty_id_key" ON "doctor_specialties"("doctor_id", "specialty_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_work_locations_doctor_id_location_id_key" ON "doctor_work_locations"("doctor_id", "location_id");

-- CreateIndex
CREATE INDEX "idx_schedules_service_date" ON "schedules"("service_date");

-- CreateIndex
CREATE INDEX "idx_schedules_doctor_date" ON "schedules"("doctor_id", "service_date");

-- CreateIndex
CREATE INDEX "idx_schedules_location_date" ON "schedules"("location_id", "service_date");

-- CreateIndex
CREATE UNIQUE INDEX "schedules_doctor_id_location_id_service_date_time_start_tim_key" ON "schedules"("doctor_id", "location_id", "service_date", "time_start", "time_end");

-- AddForeignKey
ALTER TABLE "specialty_info_sections" ADD CONSTRAINT "specialty_info_sections_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "specialties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_specialties" ADD CONSTRAINT "doctor_specialties_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_specialties" ADD CONSTRAINT "doctor_specialties_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "specialties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_work_locations" ADD CONSTRAINT "doctor_work_locations_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_work_locations" ADD CONSTRAINT "doctor_work_locations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "work_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "work_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
