import "./env";
import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { bookStores, users } from "../src/db/schema";
import { slugify } from "../src/utils";
import { BOOKSTORE_INPUT, type BookstoreInput } from "./bookstoreList";

const NOMINATIM_DELAY_MS = 1100;

const US_STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

type GeocodeResult = {
  latitude: number;
  longitude: number;
  address: string;
};

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

function buildSlug(name: string, city: string) {
  return slugify(`${name} ${city}`);
}

function buildLocationLabel(store: BookstoreInput): string {
  if (store.region && store.country === "United States") {
    return `${store.city}, ${store.region}`;
  }
  return `${store.city}, ${store.country}`;
}

function buildGeocodeQueries(store: BookstoreInput): string[] {
  const { name, city, country, region } = store;
  const queries = new Set<string>();

  if (region && country === "United States") {
    const stateName = US_STATE_NAMES[region] ?? region;
    queries.add(`${name}, ${city}, ${stateName}, USA`);
    queries.add(`${name}, ${city}, ${region}, USA`);
    queries.add(`${name}, ${city}, United States`);
    queries.add(`${city}, ${stateName}, USA`);
  }

  queries.add(`${name}, ${city}, ${country}`);
  queries.add(`${name}, ${city}`);

  if (country === "United Kingdom") {
    queries.add(`${name}, ${city}, UK`);
  }
  if (country === "Netherlands") {
    queries.add(`${name}, ${city}, Netherlands`);
  }

  queries.add(`${city}, ${country}`);

  return [...queries];
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeQuery(query: string): Promise<GeocodeResult | null> {
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
  })}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Photobookers/1.0 (bookstore import)",
    },
  });

  if (!response.ok) return null;

  const results = (await response.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  const match = results[0];
  if (!match) return null;

  return {
    latitude: Number(match.lat),
    longitude: Number(match.lon),
    address: match.display_name,
  };
}

async function geocodeStore(store: BookstoreInput): Promise<GeocodeResult | null> {
  for (const query of buildGeocodeQueries(store)) {
    const result = await geocodeQuery(query);
    await sleep(NOMINATIM_DELAY_MS);
    if (result) return result;
  }
  return null;
}

async function importBookstores() {
  const adminUserId = await getAdminUserId();
  let inserted = 0;
  let skipped = 0;
  let geocodeFailed = 0;

  for (const store of BOOKSTORE_INPUT) {
    const slug = buildSlug(store.name, store.city);
    const location = buildLocationLabel(store);

    const existing = await db.query.bookStores.findFirst({
      where: eq(bookStores.slug, slug),
      columns: { id: true, name: true },
    });

    if (existing) {
      skipped++;
      console.log(`Skipped (exists): ${existing.name} [${slug}]`);
      continue;
    }

    const geocoded = await geocodeStore(store);

    if (!geocoded) {
      geocodeFailed++;
      console.log(`Skipped (no geocode): ${store.name}, ${location}`);
      continue;
    }

    try {
      await db.insert(bookStores).values({
        slug,
        name: store.name,
        description: null,
        address: geocoded.address,
        city: store.city,
        country: store.country,
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
        website: null,
        coverUrl: null,
        bannerUrl: null,
        status: "published",
        approvalStatus: "approved",
        createdByUserId: adminUserId,
      });
      inserted++;
      console.log(`Inserted: ${store.name} [${slug}]`);
    } catch (error: unknown) {
      const pgError = error as { code?: string };
      if (pgError.code === "23505") {
        skipped++;
        console.log(`Skipped (duplicate): ${store.name} [${slug}]`);
        continue;
      }
      throw error;
    }
  }

  console.log(
    `Done. Inserted ${inserted}, skipped ${skipped}, geocode failed ${geocodeFailed}.`,
  );
}

importBookstores()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
