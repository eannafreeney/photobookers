ALTER TABLE "users" ADD COLUMN "verification_feedback_email_sent_at" timestamp;
--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "verification_feedback_email_sent_at" timestamp;
