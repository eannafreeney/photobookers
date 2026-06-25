import "./env";
import { db } from "../src/db/client";
import { bookStores, users } from "../src/db/schema";
import { eq } from "drizzle-orm";

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

const STORES_DATA = [
  {
    name: "Dashwood Books",
    slug: "dashwood-books",
    description:
      "Independent photobook shop in Nolita specializing in contemporary photography publications.",
    address: "33 Bond St, New York, NY 10012",
    city: "New York",
    country: "United States",
    website: "https://www.dashwoodbooks.com",
    latitude: 40.7241,
    longitude: -73.9937,
    status: "published" as const,
    approvalStatus: "approved" as const,
    sortOrder: 1,
  },
  {
    name: "PhotoBookMuseum",
    slug: "photobookmuseum-cologne",
    description:
      "Museum and bookshop dedicated to the photobook as an artistic medium.",
    address: "Im Mediapark 7, 50670 Köln",
    city: "Cologne",
    country: "Germany",
    website: "https://www.photobookmuseum.com",
    latitude: 50.9413,
    longitude: 6.9583,
    status: "published" as const,
    approvalStatus: "approved" as const,
    sortOrder: 2,
  },
  {
    name: "Librairie 7L",
    slug: "librairie-7l-paris",
    description:
      "Parisian bookshop focused on photography, fashion, and visual culture.",
    address: "7 Rue de Lille, 75007 Paris",
    city: "Paris",
    country: "France",
    website: "https://www.librairie7l.com",
    latitude: 48.859,
    longitude: 2.325,
    status: "published" as const,
    approvalStatus: "approved" as const,
    sortOrder: 3,
  },
  {
    name: "The Photographers' Gallery Bookshop",
    slug: "photographers-gallery-bookshop",
    description:
      "Bookshop at The Photographers' Gallery with a curated selection of photobooks.",
    address: "16-18 Ramillies St, London W1F 7LW",
    city: "London",
    country: "United Kingdom",
    website: "https://thephotographersgallery.org.uk",
    latitude: 51.5154,
    longitude: -0.139,
    status: "published" as const,
    approvalStatus: "approved" as const,
    sortOrder: 4,
  },
  {
    name: "Yvon Lambert Bookshop",
    slug: "yvon-lambert-bookshop",
    description:
      "Bookshop associated with the gallery, with a strong photobook selection.",
    address: "108 Rue Vieille du Temple, 75003 Paris",
    city: "Paris",
    country: "France",
    website: "https://www.yvon-lambert.com",
    latitude: 48.863,
    longitude: 2.361,
    status: "published" as const,
    approvalStatus: "approved" as const,
    sortOrder: 5,
  },
];

async function seedStores() {
  const adminUserId = await getAdminUserId();
  let inserted = 0;
  let skipped = 0;

  for (const storeData of STORES_DATA) {
    try {
      await db.insert(bookStores).values({
        ...storeData,
        coverUrl: null,
        bannerUrl: null,
        createdByUserId: adminUserId,
      });
      inserted++;
      console.log(`Inserted: ${storeData.name}`);
    } catch (error: unknown) {
      const pgError = error as { code?: string };
      if (pgError.code === "23505") {
        skipped++;
        console.log(`Skipped (duplicate): ${storeData.name}`);
        continue;
      }
      throw error;
    }
  }

  console.log(`Done. Inserted ${inserted}, skipped ${skipped}.`);
}

seedStores()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
