import "./env";
import fs from "node:fs/promises";
import { stringify } from "csv/sync";
import { and, eq, isNotNull, notExists } from "drizzle-orm";
import { client, db } from "../src/db/client";
import { creators, users } from "../src/db/schema";

//   ENV=production npx tsx scripts/exportAudienceCsv.ts
//
// Writes Resend-import CSVs (email, first_name, last_name) to tmp/.
// Re-run and re-import into the same Resend segments to refresh the lists.
// Leave the unsubscribed column off the CSV so Resend keeps opt-outs.

type Segment = "fans" | "artists" | "publishers";
type CsvRow = { email: string; first_name: string; last_name: string };

function addRow(
  into: Map<string, CsvRow>,
  email: string | null | undefined,
  firstName: string | null | undefined,
  lastName: string | null | undefined,
) {
  const key = email?.trim().toLowerCase();
  if (!key) return;
  if (into.has(key)) return;
  into.set(key, {
    email: key,
    first_name: firstName?.trim() ?? "",
    last_name: lastName?.trim() ?? "",
  });
}

async function getFanRows(): Promise<CsvRow[]> {
  const rows = await db
    .select({
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(users)
    .where(
      and(
        eq(users.isAdmin, false),
        eq(users.mustResetPassword, false),
        isNotNull(users.acceptsTerms),
        notExists(
          db
            .select({ id: creators.id })
            .from(creators)
            .where(
              and(
                eq(creators.ownerUserId, users.id),
                eq(creators.status, "verified"),
              ),
            ),
        ),
      ),
    );

  const byEmail = new Map<string, CsvRow>();
  for (const row of rows) addRow(byEmail, row.email, row.firstName, row.lastName);
  return [...byEmail.values()].sort((a, b) => a.email.localeCompare(b.email));
}

async function getCreatorRows(type: "artist" | "publisher"): Promise<CsvRow[]> {
  const rows = await db
    .select({
      ownerEmail: users.email,
      ownerFirstName: users.firstName,
      ownerLastName: users.lastName,
      creatorEmail: creators.email,
      displayName: creators.displayName,
    })
    .from(creators)
    .leftJoin(users, eq(creators.ownerUserId, users.id))
    .where(eq(creators.type, type));

  const byEmail = new Map<string, CsvRow>();
  for (const row of rows) {
    addRow(byEmail, row.ownerEmail, row.ownerFirstName, row.ownerLastName);
    addRow(byEmail, row.creatorEmail, row.displayName, "");
  }
  return [...byEmail.values()].sort((a, b) => a.email.localeCompare(b.email));
}

async function writeCsv(segment: Segment, rows: CsvRow[]) {
  const path = `tmp/audience-${segment}.csv`;
  await fs.mkdir("tmp", { recursive: true });
  await fs.writeFile(
    path,
    stringify(rows, {
      header: true,
      columns: ["email", "first_name", "last_name"],
    }),
    "utf8",
  );
  console.log(`${segment}: ${rows.length} → ${path}`);
}

async function run() {
  const fans = await getFanRows();
  const artists = await getCreatorRows("artist");
  const publishers = await getCreatorRows("publisher");

  await writeCsv("fans", fans);
  await writeCsv("artists", artists);
  await writeCsv("publishers", publishers);

  const all = [
    ...fans.map((r) => ({ ...r, segment: "fans" })),
    ...artists.map((r) => ({ ...r, segment: "artists" })),
    ...publishers.map((r) => ({ ...r, segment: "publishers" })),
  ];
  await fs.writeFile(
    "tmp/audience-all.csv",
    stringify(all, {
      header: true,
      columns: ["email", "first_name", "last_name", "segment"],
    }),
    "utf8",
  );
  console.log(`all: ${all.length} rows → tmp/audience-all.csv`);
}

run()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => client.end());
