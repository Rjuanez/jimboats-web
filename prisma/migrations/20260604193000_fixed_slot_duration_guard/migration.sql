-- Existing fixed slots may predate the domain invariant that requires enabled
-- fixed slots to cover at least the experience duration.
UPDATE "experience_fixed_slots" AS fixed_slot
SET "end_minutes" = fixed_slot."start_minutes" + experience."duration_minutes"
FROM "experiences" AS experience
WHERE fixed_slot."experience_id" = experience."id"
  AND experience."slot_policy_mode" = 'FIXED_SLOTS'
  AND fixed_slot."enabled" = TRUE
  AND fixed_slot."end_minutes" - fixed_slot."start_minutes" < experience."duration_minutes"
  AND fixed_slot."start_minutes" + experience."duration_minutes" <= 1440;
