CREATE TABLE "creator_stub_outreach_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"kind" varchar(32) NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_stub_outreach_emails_creator_kind" UNIQUE("creator_id","kind")
);
--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "stub_outreach_opt_out_at" timestamp;--> statement-breakpoint
ALTER TABLE "creator_stub_outreach_emails" ADD CONSTRAINT "creator_stub_outreach_emails_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;
