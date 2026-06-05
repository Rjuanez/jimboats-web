-- Keep the first enabled fixed slot in each overlapping group and disable
-- later overlaps so persisted data can satisfy the domain slot policy.
WITH overlapping_slots AS (
  SELECT fixed_slot."id"
  FROM "experience_fixed_slots" AS fixed_slot
  JOIN "experiences" AS experience
    ON experience."id" = fixed_slot."experience_id"
  WHERE experience."slot_policy_mode" = 'FIXED_SLOTS'
    AND fixed_slot."enabled" = TRUE
    AND EXISTS (
      SELECT 1
      FROM "experience_fixed_slots" AS previous_slot
      WHERE previous_slot."experience_id" = fixed_slot."experience_id"
        AND previous_slot."enabled" = TRUE
        AND previous_slot."position" < fixed_slot."position"
        AND previous_slot."start_minutes" < fixed_slot."end_minutes"
        AND fixed_slot."start_minutes" < previous_slot."end_minutes"
    )
)
UPDATE "experience_fixed_slots" AS fixed_slot
SET "enabled" = FALSE
FROM overlapping_slots
WHERE fixed_slot."id" = overlapping_slots."id";
