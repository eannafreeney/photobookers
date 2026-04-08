import "./env";
import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "../src/db/client";
import { creators, users } from "../src/db/schema";

const args = new Set(process.argv.slice(2));
const isDryRun = !args.has("--write");
const forceOverwrite = args.has("--force");

type CreatorWithOwner = {
  id: string;
  displayName: string;
  email: string | null;
  ownerUserId: string;
  ownerEmail: string;
};

async function getTargetCreators(): Promise<CreatorWithOwner[]> {
  const rows = await db
    .select({
      id: creators.id,
      displayName: creators.displayName,
      email: creators.email,
      ownerUserId: creators.ownerUserId,
      ownerEmail: users.email,
    })
    .from(creators)
    .innerJoin(users, eq(creators.ownerUserId, users.id))
    .where(and(isNotNull(creators.ownerUserId), isNotNull(users.email)));

  return rows
    .filter(
      (row): row is CreatorWithOwner => !!row.ownerUserId && !!row.ownerEmail,
    )
    .filter((row) => {
      if (forceOverwrite) return true;
      return !row.email || row.email.trim().length === 0;
    });
}

async function main() {
  const targets = await getTargetCreators();

  if (targets.length === 0) {
    console.log(
      "No creators require updates. Use --force to overwrite existing creator emails.",
    );
    return;
  }

  console.log(
    `Found ${targets.length} creators to ${isDryRun ? "preview" : "update"}.`,
  );

  let updated = 0;
  for (const creator of targets) {
    if (isDryRun) {
      console.log(
        `[dry-run] ${creator.displayName} (${creator.id}) -> ${creator.ownerEmail}`,
      );
      continue;
    }

    await db
      .update(creators)
      .set({ email: creator.ownerEmail })
      .where(eq(creators.id, creator.id));

    updated++;
    console.log(
      `[updated] ${creator.displayName} (${creator.id}) -> ${creator.ownerEmail}`,
    );
  }

  console.log(
    isDryRun
      ? "Dry run complete. Re-run with --write to persist changes."
      : `Done. Updated ${updated} creators.`,
  );
}

main().catch((error) => {
  console.error("Failed to backfill creator emails:", error);
  process.exit(1);
});
