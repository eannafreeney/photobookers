ALTER TABLE "creator_claims" DROP CONSTRAINT "creator_claims_creator_created_by_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "creator_claims" DROP COLUMN "creator_created_by_user_id";--> statement-breakpoint
ALTER TABLE "creator_claims" DROP COLUMN "token";--> statement-breakpoint
ALTER TABLE "creator_claims" DROP COLUMN "verification_method";--> statement-breakpoint
ALTER TABLE "creator_claims" DROP COLUMN "verification_code";--> statement-breakpoint
ALTER TABLE "creator_claims" DROP COLUMN "code_expires_at";--> statement-breakpoint
DROP TYPE "public"."verification_method";