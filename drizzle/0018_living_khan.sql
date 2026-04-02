ALTER TABLE "creators" ADD COLUMN "interview_email_sent" timestamp;--> statement-breakpoint
ALTER TABLE "creator_interviews" DROP COLUMN "email_sent";