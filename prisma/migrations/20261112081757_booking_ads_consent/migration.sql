-- CreateTable
CREATE TABLE "ads_measurement_consents" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "oppref" VARCHAR(500),
    "granted_at" TIMESTAMPTZ(3) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),

    CONSTRAINT "ads_measurement_consents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ads_measurement_consents_expires_at_idx" ON "ads_measurement_consents"("expires_at");

