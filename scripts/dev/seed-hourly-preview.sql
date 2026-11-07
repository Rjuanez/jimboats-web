-- ONLY for the isolated jimboats_hourly_preview database. No booking data deleted.
DO $$ BEGIN
  IF current_database() <> 'jimboats_hourly_preview' THEN
    RAISE EXCEPTION 'This seed is restricted to the isolated hourly preview database';
  END IF;
END $$;
INSERT INTO experiences (
 id, internal_name, type, status, display_order, base_price_amount_minor, base_price_currency,
 deposit_amount_minor, deposit_currency, duration_minutes, capacity, departure_port, included_items,
 internal_notes, buffer_minutes, minimum_advance_minutes, maximum_advance_months, allows_manual_scheduling,
 primary_media_status, slot_policy_mode, slot_policy_timezone, slot_operating_start_minutes, slot_operating_end_minutes,
 slot_granularity_minutes, created_at, updated_at
)
SELECT id, name, 'private-charter', 'PUBLISHED'::"ExperienceStatus", position, (:'starting_prices'::jsonb ->> id)::int, 'EUR', 5000, 'EUR', 120,
 6, 'Port Olímpic', 'Local simulation', 'Local booking test',
 30, 60, 6, true, 'MISSING'::"ExperienceMediaStatus", 'ANY_AVAILABLE'::"SlotPolicyMode", 'Europe/Madrid',
 360, 1380, 30, now(), now()
FROM (VALUES ('daytrip','Private boat trip',1), ('ex-sunset','Sunset',2), ('sunrise','Sunrise',3), ('romantic','Romantic',4)) AS seed(id,name,position)
ON CONFLICT (id) DO NOTHING;
UPDATE experiences SET capacity = 6, base_price_amount_minor = (:'starting_prices'::jsonb ->> id)::int
WHERE id IN ('daytrip','ex-sunset','sunrise','romantic');
INSERT INTO localized_experience_contents (
 id, experience_id, locale, status, slug, title, public_page_enabled, h1, summary, main_content,
 seo_title, seo_description, geo_summary, image_alt_text, indexing_policy, created_at, updated_at
)
SELECT 'hourly-' || id, id, 'en', 'PUBLISHED'::"LocalizedContentStatus", id, internal_name,
 true, internal_name, 'Local hourly booking test', 'Local hourly booking test',
 internal_name, 'Local hourly booking test', 'Local test', internal_name, 'NOINDEX'::"IndexingPolicy", now(), now()
FROM experiences WHERE id IN ('daytrip','ex-sunset','sunrise','romantic')
ON CONFLICT (id) DO NOTHING;

-- Booking catalog translations needed by the operational reader (marketing remains static).
INSERT INTO localized_experience_contents (
 id, experience_id, locale, status, slug, title, public_page_enabled, h1, summary, main_content,
 seo_title, seo_description, geo_summary, image_alt_text, indexing_policy, created_at, updated_at
)
SELECT 'hourly-' || e.id || '-' || l.locale, e.id, l.locale, 'PUBLISHED'::"LocalizedContentStatus", e.id,
 e.internal_name, true, e.internal_name, 'Reserva local', 'Reserva local',
 e.internal_name, 'Reserva local', 'Reserva local', e.internal_name, 'NOINDEX'::"IndexingPolicy", now(), now()
FROM experiences e CROSS JOIN (VALUES ('es'), ('ca')) AS l(locale)
WHERE e.id IN ('daytrip','ex-sunset','sunrise','romantic')
ON CONFLICT DO NOTHING;

INSERT INTO extras (id, name, status, price_amount_minor, price_currency, default_notice_minutes, created_at, updated_at)
VALUES ('paddle-surf', 'Paddle surf', 'ACTIVE', 2000, 'EUR', 0, now(), now()) ON CONFLICT DO NOTHING;
INSERT INTO experience_extra_rules (id, experience_id, extra_id, enabled, limit_per_booking, notice_minutes, capacity_reduction, created_at, updated_at)
SELECT 'local-paddle-' || id, id, 'paddle-surf', true, 1, 0, 0, now(), now()
FROM experiences WHERE id IN ('daytrip','ex-sunset','sunrise','romantic') ON CONFLICT DO NOTHING;

-- Local notification templates, never imported from customers or production.
INSERT INTO notification_templates (id, notification_type, event_type, channel, status, allowed_variables_json, required_variables_json, version, updated_at)
SELECT 'local-' || event, kind, event, 'EMAIL', 'ACTIVE', '["booking.reference"]'::jsonb, '["booking.reference"]'::jsonb, 1, now()
FROM (VALUES ('BookingCreated','BOOKING_CREATED'), ('BookingDepositPaid','BOOKING_CONFIRMED_DEPOSIT_PAID'), ('BookingCancelled','BOOKING_CANCELLED')) AS e(event,kind)
ON CONFLICT DO NOTHING;
INSERT INTO notification_template_translations (id, template_id, locale, status, subject, body, variables_used_json, updated_at)
SELECT t.id || '-' || l.locale, t.id, l.locale, 'PUBLISHED', '[LOCAL] ' || t.event_type,
 'Prueba local de JimBoats. Reserva {{booking.reference}}. Evento: ' || t.event_type, '["booking.reference"]'::jsonb, now()
FROM notification_templates t CROSS JOIN (VALUES ('es'), ('en'), ('ca')) l(locale)
WHERE t.id LIKE 'local-%' ON CONFLICT DO NOTHING;
INSERT INTO notification_rules (id, event_type, notification_type, channel, recipient_type, template_id, enabled, send_mode, requires_consent, locale_strategy, missing_translation_behavior, status, updated_at)
SELECT t.id, t.event_type, t.notification_type, 'EMAIL', 'BUYER', t.id, true, 'AUTOMATIC', true, 'BOOKING_PREFERRED_LOCALE', 'DO_NOT_SEND', 'ACTIVE', now()
FROM notification_templates t WHERE t.id LIKE 'local-%' ON CONFLICT DO NOTHING;
