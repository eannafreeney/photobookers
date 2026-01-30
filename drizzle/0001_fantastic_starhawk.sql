ALTER TABLE "creators" ADD COLUMN "facebook" text;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "twitter" text;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "instagram" text;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN "facebook";--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN "twitter";--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN "instagram";