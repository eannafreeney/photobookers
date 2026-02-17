import { db } from "./client";
import { sql } from "drizzle-orm";

async function reset() {
  console.log("Resetting database...");

  // Truncate all tables (order matters for foreign keys)
  await db.execute(
    sql`TRUNCATE TABLE book_images, follows, books, creators, users RESTART IDENTITY CASCADE`,
  );

  console.log("Database reset complete!");
  process.exit(0);
}

reset();
