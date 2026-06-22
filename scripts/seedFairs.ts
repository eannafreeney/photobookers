import "./env";
import { db } from "../src/db/client";
import { bookFairs, users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { slugify } from "../src/utils";

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

const FAIRS_DATA = [
  {
    name: "NY Art Book Fair",
    slug: "ny-art-book-fair-2026",
    description:
      "The world's premier event for artists' books, catalogs, monographs, periodicals, and zines. Held at MoMA PS1 in New York, featuring publishers, booksellers, antiquarians, artists, and independent presses from around the world.",
    city: "New York",
    country: "USA",
    venue: "MoMA PS1",
    website: "https://nyartbookfair.com",
    startDate: new Date("2026-09-18"),
    endDate: new Date("2026-09-20"),
    coverUrl:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
    status: "published" as const,
    approvalStatus: "approved" as const,
    listingTier: "promoted" as const,
    promotedUntil: new Date("2026-09-21"),
    sortOrder: 1,
  },
  {
    name: "Paris Photo",
    slug: "paris-photo-2026",
    description:
      "The world's largest international art fair dedicated to the photography medium. Paris Photo brings together the most important galleries, publishers, and artists from around the world at the Grand Palais Éphémère.",
    city: "Paris",
    country: "France",
    venue: "Grand Palais Éphémère",
    website: "https://www.parisphoto.com",
    startDate: new Date("2026-11-12"),
    endDate: new Date("2026-11-15"),
    coverUrl:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800",
    status: "published" as const,
    approvalStatus: "approved" as const,
    listingTier: "free" as const,
    sortOrder: 2,
  },
  {
    name: "Unseen Amsterdam",
    slug: "unseen-amsterdam-2026",
    description:
      "International photography fair and festival celebrating the best of contemporary photography. Features emerging and established photographers, alongside a program of exhibitions, book signings, and talks.",
    city: "Amsterdam",
    country: "Netherlands",
    venue: "Westergasfabriek",
    website: "https://unseenamsterdam.com",
    startDate: new Date("2026-09-24"),
    endDate: new Date("2026-09-27"),
    coverUrl:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    status: "published" as const,
    approvalStatus: "approved" as const,
    listingTier: "promoted" as const,
    promotedUntil: new Date("2026-09-28"),
    sortOrder: 3,
  },
  {
    name: "Polycopies",
    slug: "polycopies-2027",
    description:
      "Parisian photobook fair focusing on self-published and independent photography books. An intimate gathering of publishers, artists, and collectors in the heart of Paris.",
    city: "Paris",
    country: "France",
    venue: "Le Centquatre-Paris",
    website: "https://www.polycopies.org",
    startDate: new Date("2027-01-15"),
    endDate: new Date("2027-01-17"),
    coverUrl:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800",
    status: "published" as const,
    approvalStatus: "approved" as const,
    listingTier: "free" as const,
    sortOrder: 4,
  },
  {
    name: "Tokyo Art Book Fair",
    slug: "tokyo-art-book-fair-2026",
    description:
      "One of Asia's premier events for art books, zines, and independent publications. Features hundreds of publishers and artists from Japan and around the world at the Museum of Contemporary Art Tokyo.",
    city: "Tokyo",
    country: "Japan",
    venue: "Museum of Contemporary Art Tokyo",
    website: "https://tokyoartbookfair.com",
    startDate: new Date("2026-10-08"),
    endDate: new Date("2026-10-11"),
    coverUrl:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
    status: "published" as const,
    approvalStatus: "approved" as const,
    listingTier: "free" as const,
    sortOrder: 5,
  },
  {
    name: "Offprint London",
    slug: "offprint-london-2026",
    description:
      "A satellite fair of Frieze London dedicated to photo books, art books, magazines, and printed matter. Showcases international galleries, independent publishers, and artists at Tate Modern.",
    city: "London",
    country: "UK",
    venue: "Tate Modern",
    website: "https://www.offprintlondon.com",
    startDate: new Date("2026-10-15"),
    endDate: new Date("2026-10-18"),
    coverUrl:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
    status: "published" as const,
    approvalStatus: "approved" as const,
    listingTier: "free" as const,
    sortOrder: 6,
  },
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
    sortOrder: 7,
  },
  {
    name: "LA Art Book Fair",
    slug: "la-art-book-fair-2027",
    description:
      "The West Coast's largest event for artists' books, zines, and printed matter. Organized by Printed Matter at the Geffen Contemporary at MOCA, featuring 300+ exhibitors from around the world.",
    city: "Los Angeles",
    country: "USA",
    venue: "Geffen Contemporary at MOCA",
    website: "https://laartbookfair.net",
    startDate: new Date("2027-02-12"),
    endDate: new Date("2027-02-14"),
    coverUrl:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
    status: "published" as const,
    approvalStatus: "approved" as const,
    listingTier: "free" as const,
    sortOrder: 8,
  },
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
          .returning();

        console.log(
          `✓ Created fair: ${insertedFair.name} (${insertedFair.slug})`,
        );
      } catch (error: any) {
        if (error.code === "23505") {
          console.log(
            `⊘ Fair already exists: ${fairData.name} (${fairData.slug})`,
          );
        } else {
          console.error(`✗ Failed to create fair ${fairData.name}:`, error);
        }
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
