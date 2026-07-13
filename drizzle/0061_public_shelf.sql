ALTER TABLE "users" ADD COLUMN "shelf_slug" varchar(255);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "shelf_public" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_shelf_slug_unique" UNIQUE("shelf_slug");
