ALTER TABLE "creators" ADD COLUMN IF NOT EXISTS "verified_at" timestamp;

UPDATE "creators"
SET "verified_at" = COALESCE("updated_at", "created_at", NOW())
WHERE "status" = 'verified' AND "verified_at" IS NULL;
