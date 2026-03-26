ALTER TABLE "creators" ADD COLUMN "email" varchar(255);
--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "welcome_email_sent" boolean DEFAULT false NOT NULL;
