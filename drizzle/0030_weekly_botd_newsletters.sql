DO $$ BEGIN
 CREATE TYPE "public"."newsletter_campaign_status" AS ENUM('draft', 'approved', 'sent', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "newsletter_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_start" timestamp NOT NULL,
	"week_end" timestamp NOT NULL,
	"status" "newsletter_campaign_status" DEFAULT 'draft' NOT NULL,
	"template_key" varchar(128) DEFAULT 'weekly_botd_v1' NOT NULL,
	"template_version" integer DEFAULT 1 NOT NULL,
	"subject" text NOT NULL,
	"intro_text" text NOT NULL,
	"outro_text" text NOT NULL,
	"cta_text" text NOT NULL,
	"generated_content" jsonb,
	"mailerlite_campaign_id" text,
	"mailerlite_last_synced_at" timestamp,
	"approved_by_user_id" uuid,
	"approved_at" timestamp,
	"sent_at" timestamp,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "newsletter_campaigns" ADD CONSTRAINT "newsletter_campaigns_approved_by_user_id_users_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_campaigns_week_start_unique" ON "newsletter_campaigns" USING btree ("week_start");
