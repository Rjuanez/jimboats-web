ALTER TABLE "notification_template_translations"
  ADD COLUMN "html_body" TEXT;

ALTER TABLE "notification_deliveries"
  ADD COLUMN "rendered_html_body" TEXT;
