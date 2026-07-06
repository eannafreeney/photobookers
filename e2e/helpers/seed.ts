import { nanoid } from "nanoid";
import { creators } from "../../src/db/schema";
import { getE2eDb } from "./db";

export type SeedStubCreator = {
  id: string;
  slug: string;
  website: string | null;
};

export async function seedStubCreator(opts: {
  createdByUserId: string;
  website?: string | null;
  displayName?: string;
}): Promise<SeedStubCreator> {
  const slug = `e2e-claim-${nanoid(10)}`;
  const displayName = opts.displayName ?? `E2E Claim Artist ${slug.slice(-6)}`;
  const website = opts.website ?? null;

  const [creator] = await getE2eDb()
    .insert(creators)
    .values({
      slug,
      displayName,
      type: "artist",
      status: "stub",
      website,
      createdByUserId: opts.createdByUserId,
    })
    .returning({
      id: creators.id,
      slug: creators.slug,
      website: creators.website,
    });

  if (!creator) throw new Error("Failed to seed stub creator");

  return creator;
}
