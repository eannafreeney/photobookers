ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "submitted_by_user_id" uuid REFERENCES "users"("id");
