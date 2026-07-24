import "./env";
import { db } from "../src/db/client";
import { bookFairs, users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { FAIRS_FROM_PHOTOBOOK_JOURNAL } from "./data/fairsFromPhotoBookJournal";
import { FAIRS_FROM_LENSCULTURE } from "./data/fairsFromLensCulture";

async function getAdminUserId(): Promise<string> {
  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.isAdmin, true))
    .limit(1);
  if (!admin) {
    throw new Error("No admin user found. Create an admin user first.");
  }
  return admin.id;
}

/** Additional fairs not covered by PhotoBook Journal / LensCulture lists. */
const EXTRA_FAIRS = [
  {
    name: "PhotoEspaña",
    slug: "photoespana-2026",
    description:
      "International Festival of Photography and Visual Arts. One of the most important photography events globally, featuring exhibitions, photobook fairs, portfolio reviews, and conferences across Madrid.",
    city: "Madrid",
    country: "Spain",
    venue: "Various venues",
    website: "https://www.phe.es",
    startDate: new Date("2026-06-03"),
    endDate: new Date("2026-08-30"),
    coverUrl:
      "https://images.unsplash.com/photo-1562155847-c05f7cb2d2a2?w=800",
    status: "published" as const,
    approvalStatus: "approved" as const,
    listingTier: "free" as const,
    sortOrder: 71,
  },
];

// LensCulture last so overlapping slugs pick up updated dates/copy from that guide.
const FAIRS_DATA = [
  ...FAIRS_FROM_PHOTOBOOK_JOURNAL,
  ...EXTRA_FAIRS,
  ...FAIRS_FROM_LENSCULTURE,
];

async function seedFairs() {
  console.log("Starting fairs seed...");

  try {
    const adminUserId = await getAdminUserId();
    console.log(`Using admin user ID: ${adminUserId}`);

    for (const fairData of FAIRS_DATA) {
      console.log(`\nSeeding fair: ${fairData.name}`);

      const fairWithUser = {
        ...fairData,
        createdByUserId: adminUserId,
      };

      try {
        const [insertedFair] = await db
          .insert(bookFairs)
          .values(fairWithUser)
          .onConflictDoUpdate({
            target: bookFairs.slug,
            // Don't clobber publish/approval state if an admin already reviewed the fair.
            set: {
              name: fairData.name,
              description: fairData.description,
              city: fairData.city,
              country: fairData.country,
              venue: fairData.venue,
              website: fairData.website,
              startDate: fairData.startDate,
              endDate: fairData.endDate,
              coverUrl: fairData.coverUrl,
              listingTier: fairData.listingTier,
              promotedUntil: fairData.promotedUntil ?? null,
              sortOrder: fairData.sortOrder,
              updatedAt: new Date(),
            },
          })
          .returning();

        console.log(
          `✓ Upserted fair: ${insertedFair.name} (${insertedFair.slug})`,
        );
      } catch (error) {
        console.error(`✗ Failed to upsert fair ${fairData.name}:`, error);
      }
    }

    console.log("\n✓ Fairs seed completed!");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seedFairs()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
