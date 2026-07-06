import { and, asc, eq, ilike, isNotNull, or, sql } from "drizzle-orm";
import { db } from "../../../db/client.js";
import { bookStores } from "../../../db/schema.js";
import { getPagination } from "../../../lib/pagination.js";
import { err, ok } from "../../../lib/result.js";
const publishedCondition = and(
  eq(bookStores.status, "published"),
  eq(bookStores.approvalStatus, "approved")
);
const storeOrderBy = [
  sql`${bookStores.sortOrder} ASC NULLS LAST`,
  asc(bookStores.name)
];
const buildStoreFilterConditions = ({
  query,
  city,
  country,
  mapOnly = false
}) => {
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
        ilike(bookStores.address, searchTerm)
      )
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
const getPublishedStores = async ({
  page = 1,
  limit = 30,
  query,
  city,
  country
} = {}) => {
  try {
    const whereCondition = buildStoreFilterConditions({
      query,
      city,
      country
    });
    const [{ value: totalCount = 0 }] = await db.select({ value: sql`count(*)` }).from(bookStores).where(whereCondition);
    const {
      page: currentPage,
      limit: pageLimit,
      offset,
      totalPages
    } = getPagination(page, totalCount, limit);
    const stores = await db.query.bookStores.findMany({
      where: whereCondition,
      orderBy: storeOrderBy,
      limit: pageLimit,
      offset
    });
    return ok({ stores, totalPages, page: currentPage });
  } catch (error) {
    console.error("Failed to get published stores", error);
    return err({ reason: "Failed to get published stores", cause: error });
  }
};
const getPublishedStoresForMap = async ({
  query,
  city,
  country
} = {}) => {
  try {
    const whereCondition = buildStoreFilterConditions({
      query,
      city,
      country,
      mapOnly: true
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
        longitude: true
      }
    });
    const markers = stores.filter(
      (store) => store.latitude != null && store.longitude != null
    ).map((store) => ({
      slug: store.slug,
      name: store.name,
      city: store.city,
      country: store.country,
      latitude: store.latitude,
      longitude: store.longitude
    }));
    return ok(markers);
  } catch (error) {
    console.error("Failed to get published stores for map", error);
    return err({
      reason: "Failed to get published stores for map",
      cause: error
    });
  }
};
const getStoreBySlug = async (slug) => {
  try {
    const store = await db.query.bookStores.findFirst({
      where: eq(bookStores.slug, slug)
    });
    if (!store) return err({ reason: "Store not found" });
    return ok(store);
  } catch (error) {
    console.error("Failed to get store by slug", error);
    return err({ reason: "Failed to get store by slug", cause: error });
  }
};
const getPublishedStoreCountries = async () => {
  try {
    const rows = await db.selectDistinct({ country: bookStores.country }).from(bookStores).where(publishedCondition).orderBy(asc(bookStores.country));
    return ok(rows.map((row) => row.country).filter(Boolean));
  } catch (error) {
    console.error("Failed to get published store countries", error);
    return err({
      reason: "Failed to get published store countries",
      cause: error
    });
  }
};
export {
  getPublishedStoreCountries,
  getPublishedStores,
  getPublishedStoresForMap,
  getStoreBySlug
};
