import { and, asc, eq, ilike, isNotNull, or, sql } from "drizzle-orm";
import { db } from "../../../db/client";
import { bookStores } from "../../../db/schema";
import { getPagination } from "../../../lib/pagination";
import { err, ok } from "../../../lib/result";

const publishedCondition = and(
  eq(bookStores.status, "published"),
  eq(bookStores.approvalStatus, "approved"),
);

const storeOrderBy = [
  sql`${bookStores.sortOrder} ASC NULLS LAST`,
  asc(bookStores.name),
];

export type StoreSearchParams = {
  query?: string;
  city?: string;
  country?: string;
  page?: number;
  limit?: number;
};

export type StoreMapMarker = {
  slug: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
};

const buildStoreFilterConditions = ({
  query,
  city,
  country,
  mapOnly = false,
}: StoreSearchParams & { mapOnly?: boolean }) => {
  const conditions = [publishedCondition];

  if (mapOnly) {
    conditions.push(isNotNull(bookStores.latitude));
    conditions.push(isNotNull(bookStores.longitude));
  }

  if (query?.trim()) {
    const searchTerm = `%${query.trim()}%`;
    conditions.push(
      or(
        ilike(bookStores.name, searchTerm),
        ilike(bookStores.description, searchTerm),
        ilike(bookStores.address, searchTerm),
      )!,
    );
  }

  if (city?.trim()) {
    conditions.push(ilike(bookStores.city, `%${city.trim()}%`));
  }

  if (country?.trim()) {
    conditions.push(eq(bookStores.country, country.trim()));
  }

  return and(...conditions);
};

export const getPublishedStores = async ({
  page = 1,
  limit = 30,
  query,
  city,
  country,
}: StoreSearchParams = {}) => {
  try {
    const whereCondition = buildStoreFilterConditions({
      query,
      city,
      country,
    });

    const [{ value: totalCount = 0 }] = await db
      .select({ value: sql<number>`count(*)` })
      .from(bookStores)
      .where(whereCondition);

    const {
      page: currentPage,
      limit: pageLimit,
      offset,
      totalPages,
    } = getPagination(page, totalCount, limit);

    const stores = await db.query.bookStores.findMany({
      where: whereCondition,
      orderBy: storeOrderBy,
      limit: pageLimit,
      offset,
    });

    return ok({ stores, totalPages, page: currentPage });
  } catch (error) {
    console.error("Failed to get published stores", error);
    return err({ reason: "Failed to get published stores", cause: error });
  }
};

export const getPublishedStoresForMap = async ({
  query,
  city,
  country,
}: Omit<StoreSearchParams, "page" | "limit"> = {}) => {
  try {
    const whereCondition = buildStoreFilterConditions({
      query,
      city,
      country,
      mapOnly: true,
    });

    const stores = await db.query.bookStores.findMany({
      where: whereCondition,
      orderBy: storeOrderBy,
      columns: {
        slug: true,
        name: true,
        city: true,
        country: true,
        latitude: true,
        longitude: true,
      },
    });

    const markers: StoreMapMarker[] = stores
      .filter(
        (store): store is typeof store & { latitude: number; longitude: number } =>
          store.latitude != null && store.longitude != null,
      )
      .map((store) => ({
        slug: store.slug,
        name: store.name,
        city: store.city,
        country: store.country,
        latitude: store.latitude,
        longitude: store.longitude,
      }));

    return ok(markers);
  } catch (error) {
    console.error("Failed to get published stores for map", error);
    return err({
      reason: "Failed to get published stores for map",
      cause: error,
    });
  }
};

export const getStoreBySlug = async (slug: string) => {
  try {
    const store = await db.query.bookStores.findFirst({
      where: eq(bookStores.slug, slug),
    });

    if (!store) return err({ reason: "Store not found" });

    return ok(store);
  } catch (error) {
    console.error("Failed to get store by slug", error);
    return err({ reason: "Failed to get store by slug", cause: error });
  }
};

export const getPublishedStoreCountries = async () => {
  try {
    const rows = await db
      .selectDistinct({ country: bookStores.country })
      .from(bookStores)
      .where(publishedCondition)
      .orderBy(asc(bookStores.country));

    return ok(rows.map((row) => row.country).filter(Boolean));
  } catch (error) {
    console.error("Failed to get published store countries", error);
    return err({
      reason: "Failed to get published store countries",
      cause: error,
    });
  }
};
