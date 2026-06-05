CREATE TYPE "CancellationPolicyStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "CancellationPolicyVersionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "CancellationDepositOutcome" AS ENUM ('FULL_REFUND', 'MANUAL_REVIEW', 'NO_REFUND', 'PARTIAL_REFUND');

ALTER TABLE "experiences"
  ADD COLUMN "cancellation_policy_id" TEXT;

ALTER TABLE "bookings"
  ADD COLUMN "cancellation_policy_version_id" TEXT,
  ADD COLUMN "cancellation_policy_snapshot" JSONB;

CREATE TABLE "cancellation_policies" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "CancellationPolicyStatus" NOT NULL,
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "cancellation_policies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cancellation_policy_versions" (
  "id" TEXT NOT NULL,
  "policy_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "status" "CancellationPolicyVersionStatus" NOT NULL,
  "summary_en" TEXT NOT NULL DEFAULT '',
  "summary_es" TEXT NOT NULL DEFAULT '',
  "summary_ca" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "activated_at" TIMESTAMPTZ(3),
  "updated_at" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "cancellation_policy_versions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cancellation_policy_tiers" (
  "id" TEXT NOT NULL,
  "version_id" TEXT NOT NULL,
  "from_minutes_before_departure" INTEGER,
  "to_minutes_before_departure" INTEGER,
  "deposit_outcome" "CancellationDepositOutcome" NOT NULL,
  "refund_amount_minor" INTEGER,
  "refund_currency" TEXT,
  "label" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "cancellation_policy_tiers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "experiences_cancellation_policy_id_idx" ON "experiences"("cancellation_policy_id");
CREATE INDEX "bookings_cancellation_policy_version_id_idx" ON "bookings"("cancellation_policy_version_id");
CREATE INDEX "cancellation_policies_status_idx" ON "cancellation_policies"("status");
CREATE INDEX "cancellation_policies_default_idx" ON "cancellation_policies"("is_default");
CREATE UNIQUE INDEX "cancellation_policy_versions_policy_id_version_key" ON "cancellation_policy_versions"("policy_id", "version");
CREATE INDEX "cancellation_policy_versions_policy_status_idx" ON "cancellation_policy_versions"("policy_id", "status");
CREATE INDEX "cancellation_policy_tiers_version_id_idx" ON "cancellation_policy_tiers"("version_id");

ALTER TABLE "experiences"
  ADD CONSTRAINT "experiences_cancellation_policy_id_fkey"
  FOREIGN KEY ("cancellation_policy_id") REFERENCES "cancellation_policies"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "cancellation_policy_versions"
  ADD CONSTRAINT "cancellation_policy_versions_policy_id_fkey"
  FOREIGN KEY ("policy_id") REFERENCES "cancellation_policies"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cancellation_policy_tiers"
  ADD CONSTRAINT "cancellation_policy_tiers_version_id_fkey"
  FOREIGN KEY ("version_id") REFERENCES "cancellation_policy_versions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
