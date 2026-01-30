// apps/api/src/db/client.ts
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const client = postgres(connectionString, {
  max: 1, // good for serverless, safe for local too
});

export const db = drizzle(client, { schema });
