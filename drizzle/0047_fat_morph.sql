CREATE TABLE "creator_milestone_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"milestone" varchar(64) NOT NULL,
	"book_id" uuid,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_milestone_emails_creator_milestone" UNIQUE("creator_id","milestone")
);
--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "analytics_digest_sent_for_month" varchar(7);--> statement-breakpoint
ALTER TABLE "creator_milestone_emails" ADD CONSTRAINT "creator_milestone_emails_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_milestone_emails" ADD CONSTRAINT "creator_milestone_emails_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;