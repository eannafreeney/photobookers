import { eq, or } from "drizzle-orm";
import { db } from "../../../db/client";
import {
  Book,
  bookImages,
  books,
  Creator,
  creators,
  NewBook,
  UpdateBook,
} from "../../../db/schema";
import { processTags } from "../../../services/books";
import { generateUniqueBookSlug } from "../../../utils";
import z from "zod";
import { bookFormSchema } from "./schema";

export const approveBookById = async (bookId: string) => {
  try {
    const [updatedBook] = await db
      .update(books)
      .set({ approvalStatus: "approved" })
      .where(eq(books.id, bookId))
      .returning();
    return updatedBook;
  } catch (error) {
    console.error("Failed to approve book", error);
    return null;
  }
};

export const rejectBookById = async (bookId: string) => {
  try {
    const [updatedBook] = await db
      .update(books)
      .set({ approvalStatus: "rejected" })
      .where(eq(books.id, bookId))
      .returning();
    return updatedBook;
  } catch (error) {
    console.error("Failed to reject book", error);
    return null;
  }
};

export const createBook = async (input: NewBook) => {
  try {
    const [newBook] = await db.insert(books).values(input).returning();
    return newBook;
  } catch (error) {
    console.error("Failed to create book", error);
    return null;
  }
};

export const updateBook = async (input: UpdateBook, bookId: string) => {
  try {
    const [updatedBook] = await db
      .update(books)
      .set(input)
      .where(eq(books.id, bookId))
      .returning();

    return updatedBook;
  } catch (error) {
    console.error("Failed to update book", error);
    return null;
  }
};

export const deleteBookById = async (bookId: string) => {
  try {
    const [book] = await db.select().from(books).where(eq(books.id, bookId));

    if (!book) return null;

    // Delete related book_images first (FK constraint)
    await db.delete(bookImages).where(eq(bookImages.bookId, bookId));

    const [deletedBook] = await db
      .delete(books)
      .where(eq(books.id, bookId))
      .returning();

    // Clean up orphaned stub publisher
    if (book.publisherId) {
      await cleanupOrphanedStubCreator(book.publisherId);
    }

    // Clean up orphaned stub artist
    if (book.artistId) {
      await cleanupOrphanedStubCreator(book.artistId);
    }

    return deletedBook;
  } catch (error) {
    console.error("Failed to delete book", error);
    return null;
  }
};

async function cleanupOrphanedStubCreator(creatorId: string) {
  const [creator] = await db
    .select()
    .from(creators)
    .where(eq(creators.id, creatorId));

  // Only delete if it's a stub
  if (creator?.status !== "stub") return;

  // Check if creator has any other books
  const otherBooks = await db
    .select({ id: books.id })
    .from(books)
    .where(or(eq(books.artistId, creatorId), eq(books.publisherId, creatorId)))
    .limit(1);

  // If no other books, delete the stub
  if (otherBooks.length === 0) {
    await db.delete(creators).where(eq(creators.id, creatorId));
  }
}

export const prepareBookData = async (
  formData: z.infer<typeof bookFormSchema>,
  bookCreator: Creator,
  userId: string,
  bookPublisher?: Creator | null,
): Promise<NewBook> => {
  // when artists can select a publisher, we need to set the approval status to pending
  const existingPublisherSelected = formData.publisher_id ? true : false;

  return {
    title: formData.title,
    description: formData.description || null,
    releaseDate: formData.release_date ? new Date(formData.release_date) : null,
    slug: await generateUniqueBookSlug(
      formData.title,
      bookCreator?.displayName,
    ),
    artistId: bookCreator?.id ?? null,
    publisherId: bookPublisher?.id ?? null,
    createdByUserId: userId,
    tags: processTags(formData.tags),
    purchaseLink: formData.purchase_link ?? null,
    // approvalStatus: existingPublisherSelected ? "pending" : "approved",
    approvalStatus: "approved",
    publicationStatus: "draft",
    availabilityStatus: formData.availability_status,
  };
};

export const prepareBookUpdateData = (
  formData: z.infer<typeof bookFormSchema>,
): UpdateBook => {
  return {
    title: formData.title,
    description: formData.description || null,
    releaseDate: formData.release_date ? new Date(formData.release_date) : null,
    purchaseLink: formData.purchase_link ?? null,
    tags: processTags(formData.tags),
    availabilityStatus: formData.availability_status,
  };
};

export const updateBookPublicationStatus = async (
  bookId: string,
  publicationStatus: "published" | "draft",
): Promise<
  { success: true; book: Book } | { success: false; error: string }
> => {
  try {
    const [updatedBook] = await db
      .update(books)
      .set({ publicationStatus })
      .where(eq(books.id, bookId))
      .returning();
    return { success: true, book: updatedBook };
  } catch (error: unknown) {
    console.error("Failed to update book publication status", error);

    // Check for cover constraint violation
    if (
      (error as any).cause?.constraint_name === "cover_required_for_publish"
    ) {
      return { success: false, error: "Add a cover image before publishing" };
    }

    return { success: false, error: "Failed to update book mode" };
  }
};
