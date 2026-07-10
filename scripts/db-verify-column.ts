/**
 * Verify a public schema column exists (and show recent Drizzle migrations).
 *
 * Usage:
 *   ENV=production npx tsx scripts/db-verify-column.ts creators profile_share_email_sent_at
 *   DATABASE_URL=postgresql://... npx tsx scripts/db-verify-column.ts creators profile_share_email_sent_at
 */
import "./env";
import postgres from "postgres";

const table = process.argv[2];
const column = process.argv[3];

if (!table || !column) {
  console.error(
    "Usage: npx tsx scripts/db-verify-column.ts <table> <column>",
  );
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = postgres(connectionString, { ssl: "require", max: 1 });

try {
  const rows = await sql<
    { column_name: string; data_type: string; is_nullable: string }[]
  >`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${table}
      AND column_name = ${column}
  `;

  if (rows.length === 0) {
    console.error(`MISSING: public.${table}.${column} was not found`);
    process.exit(1);
  }

  const found = rows[0]!;
  console.log(
    `OK: public.${table}.${column} exists (${found.data_type}, nullable=${found.is_nullable})`,
  );

  const migrations = await sql<
    { id: number; hash: string; created_at: Date }[]
  >`
    SELECT id, hash, created_at
    FROM drizzle.__drizzle_migrations
    ORDER BY id DESC
    LIMIT 5
  `;

  if (migrations.length === 0) {
    console.log("No rows in drizzle.__drizzle_migrations");
  } else {
    console.log("Recent Drizzle migrations:");
    for (const row of migrations) {
      console.log(
        `  #${row.id} ${row.created_at.toISOString()} ${row.hash.slice(0, 12)}…`,
      );
    }
  }
} catch (error) {
  console.error("Verification failed:", error);
  process.exit(1);
} finally {
  await sql.end();
}
