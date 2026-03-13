ALTER TABLE "creator_claims" DROP CONSTRAINT IF EXISTS "creator_claims_creator_created_by_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "creator_claims" DROP COLUMN IF EXISTS "creator_created_by_user_id";--> statement-breakpoint
ALTER TABLE "creator_claims" DROP COLUMN IF EXISTS "token";--> statement-breakpoint
ALTER TABLE "creator_claims" DROP COLUMN IF EXISTS "verification_method";--> statement-breakpoint
ALTER TABLE "creator_claims" DROP COLUMN IF EXISTS "verification_code";--> statement-breakpoint
ALTER TABLE "creator_claims" DROP COLUMN IF EXISTS "code_expires_at";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."verification_method";