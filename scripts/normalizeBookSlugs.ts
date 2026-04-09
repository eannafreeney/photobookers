import { db } from "../src/db/client";
import { books } from "../src/db/schema";
import { asc, eq } from "drizzle-orm";

import "./env";
const dryRun = process.argv.includes("--dry-run");

const normalizeSlug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Mark}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

function nextAvailable(base: string, occupied: Set<string>) {
  if (!occupied.has(base)) return base;
  let i = 1;
  while (occupied.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

async function main() {
  const all = await db.query.books.findMany({
    columns: { id: true, slug: true, createdAt: true },
    orderBy: [asc(books.createdAt), asc(books.id)], // stable resolution order
  });

  const occupied = new Set(all.map((b) => b.slug));
  const updates: Array<{ id: string; from: string; to: string }> = [];

  for (const row of all) {
    const canonicalBase = normalizeSlug(row.slug);
    if (!canonicalBase || canonicalBase === row.slug) continue;

    // Free current slug first so row can potentially keep same string after normalization
    occupied.delete(row.slug);

    const target = nextAvailable(canonicalBase, occupied);
    occupied.add(target);

    updates.push({ id: row.id, from: row.slug, to: target });
  }

  console.log(`Would update ${updates.length} rows`);
  for (const u of updates) console.log(`${u.from} -> ${u.to}`);

  if (dryRun || updates.length === 0) return;

  await db.transaction(async (tx) => {
    for (const u of updates) {
      await tx.update(books).set({ slug: u.to }).where(eq(books.id, u.id));
    }
  });

  console.log(`Updated ${updates.length} rows`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
