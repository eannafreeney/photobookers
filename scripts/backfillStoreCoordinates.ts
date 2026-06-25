import "./env";
import { db } from "../src/db/client";
import { bookStores } from "../src/db/schema";
import { eq } from "drizzle-orm";

const STORE_COORDINATES: Record<
  string,
  { latitude: number; longitude: number }
> = {
  "dashwood-books": { latitude: 40.7241, longitude: -73.9937 },
  "photobookmuseum-cologne": { latitude: 50.9413, longitude: 6.9583 },
  "librairie-7l-paris": { latitude: 48.859, longitude: 2.325 },
  "photographers-gallery-bookshop": { latitude: 51.5154, longitude: -0.139 },
  "yvon-lambert-bookshop": { latitude: 48.863, longitude: 2.361 },
};

async function backfillStoreCoordinates() {
  let updated = 0;

  for (const [slug, coords] of Object.entries(STORE_COORDINATES)) {
    const [store] = await db
      .update(bookStores)
      .set(coords)
      .where(eq(bookStores.slug, slug))
      .returning({ slug: bookStores.slug });

    if (store) {
      updated++;
      console.log(`Updated coordinates: ${slug}`);
    }
  }

  console.log(`Done. Updated ${updated} stores.`);
}

backfillStoreCoordinates()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
