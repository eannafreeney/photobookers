ALTER TABLE "creator_claims" DROP CONSTRAINT "creator_claims_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "must_reset_password" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "creator_claims" ADD CONSTRAINT "creator_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;