import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../../../db/client";
import {
  bookStores,
  type NewBookStore,
  type UpdateBookStore,
} from "../../../../db/schema";
import { getPagination } from "../../../../lib/pagination";
import { err, ok } from "../../../../lib/result";

export const getAllStoresAdmin = async (
  currentPage: number = 1,
  searchQuery?: string,
  status?: "draft" | "published" | undefined,
) => {
  try {
    const searchCondition =
      searchQuery && searchQuery.trim() !== ""
        ? or(
            ilike(bookStores.name, `%${searchQuery}%`),
            ilike(bookStores.city, `%${searchQuery}%`),
            ilike(bookStores.country, `%${searchQuery}%`),
            ilike(bookStores.address, `%${searchQuery}%`),
          )
        : undefined;

    const statusCondition = status ? eq(bookStores.status, status) : undefined;

    const whereCondition =
      searchCondition && statusCondition
        ? and(searchCondition, statusCondition)
        : (searchCondition ?? statusCondition ?? undefined);

    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(bookStores)
      .where(whereCondition);

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      30,
    );

    const stores = await db.query.bookStores.findMany({
      where: whereCondition,
      orderBy: [desc(bookStores.createdAt)],
      limit,
      offset,
      with: {
        createdBy: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return ok({ stores, totalPages, page });
  } catch (error) {
    console.error("Failed to get all stores", error);
    return err({ reason: "Failed to get all stores", cause: error });
  }
};

export const getStoreByIdAdmin = async (storeId: string) => {
  try {
    const store = await db.query.bookStores.findFirst({
      where: eq(bookStores.id, storeId),
      with: {
        createdBy: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!store) return err({ reason: "Store not found" });

    return ok(store);
  } catch (error) {
    console.error("Failed to get store by ID", error);
    return err({ reason: "Failed to get store by ID", cause: error });
  }
};

export const createStoreAdmin = async (
  storeData: Omit<NewBookStore, "createdByUserId" | "approvalStatus">,
  userId: string,
) => {
  try {
    const [newStore] = await db
      .insert(bookStores)
      .values({
        ...storeData,
        createdByUserId: userId,
        approvalStatus: "approved",
      })
      .returning();

    if (!newStore) return err({ reason: "Failed to create store" });

    return ok(newStore);
  } catch (error) {
    console.error("Failed to create store", error);
    return err({ reason: "Failed to create store", cause: error });
  }
};

export const updateStoreAdmin = async (
  storeId: string,
  updates: UpdateBookStore,
) => {
  try {
    const [updatedStore] = await db
      .update(bookStores)
      .set(updates)
      .where(eq(bookStores.id, storeId))
      .returning();

    if (!updatedStore) return err({ reason: "Store not found" });

    return ok(updatedStore);
  } catch (error) {
    console.error("Failed to update store", error);
    return err({ reason: "Failed to update store", cause: error });
  }
};

export const deleteStoreByIdAdmin = async (storeId: string) => {
  try {
    const [deletedStore] = await db
      .delete(bookStores)
      .where(eq(bookStores.id, storeId))
      .returning();

    if (!deletedStore) return err({ reason: "Store not found" });

    return ok(deletedStore);
  } catch (error) {
    console.error("Failed to delete store", error);
    return err({ reason: "Failed to delete store", cause: error });
  }
};

export const approveStore = async (storeId: string) => {
  try {
    const [updatedStore] = await db
      .update(bookStores)
      .set({ approvalStatus: "approved" })
      .where(eq(bookStores.id, storeId))
      .returning();

    if (!updatedStore) return err({ reason: "Store not found" });

    return ok(updatedStore);
  } catch (error) {
    console.error("Failed to approve store", error);
    return err({ reason: "Failed to approve store", cause: error });
  }
};

export const rejectStore = async (storeId: string) => {
  try {
    const [updatedStore] = await db
      .update(bookStores)
      .set({ approvalStatus: "rejected" })
      .where(eq(bookStores.id, storeId))
      .returning();

    if (!updatedStore) return err({ reason: "Store not found" });

    return ok(updatedStore);
  } catch (error) {
    console.error("Failed to reject store", error);
    return err({ reason: "Failed to reject store", cause: error });
  }
};
