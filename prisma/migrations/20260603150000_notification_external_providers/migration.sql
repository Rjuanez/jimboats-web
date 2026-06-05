ALTER TABLE "notification_templates"
  ADD COLUMN "provider_template_id" TEXT;

ALTER TABLE "notification_deliveries"
  ADD COLUMN "provider_template_id" TEXT,
  ADD COLUMN "provider_variables_json" JSONB NOT NULL DEFAULT '{}'::jsonb;
