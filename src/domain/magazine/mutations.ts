import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  creators,
  magazineIssues,
  magazineIssueBooks,
  type MagazineIssueStatus,
} from "@/db/schema";
import { err, ok } from "@/lib/result";

export type CreateDraftIssueBook = {
  bookId: string;
  sortOrder: number;
  blurb?: string | null;
  artistPrompt?: string | null;
  artistQuote?: string | null;
};

export type CreateDraftIssueInput = {
  title: string;
  subtitle?: string | null;
  kicker?: string | null;
  theme?: string | null;
  editorsLetterTitle?: string | null;
  editorsLetter?: string[];
  coverUrl?: string | null;
  bannerUrl?: string | null;
  publishedLabel?: string | null;
  readingMinutes?: number | null;
  generationSeed?: string | null;
  generationModel?: string | null;
  books: CreateDraftIssueBook[];
};

function slugify(value: string): string {
  const base = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-+|-+$/g, "");
  return base || "issue";
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 1;
  // Drafts accumulate, so collisions are expected — suffix until free.
  while (
    await db.query.magazineIssues.findFirst({
      where: eq(magazineIssues.slug, slug),
      columns: { id: true },
    })
  ) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

/** Persist a generated (or manual) issue as a new draft with its book rows. */
export async function createDraftIssue(input: CreateDraftIssueInput) {
  try {
    const slug = await uniqueSlug(slugify(input.title));
    const [issue] = await db
      .insert(magazineIssues)
      .values({
        status: "draft",
        slug,
        kicker: input.kicker ?? null,
        title: input.title,
        subtitle: input.subtitle ?? null,
        theme: input.theme ?? null,
        editorsLetterTitle: input.editorsLetterTitle ?? null,
        editorsLetter: input.editorsLetter ?? null,
        coverUrl: input.coverUrl ?? null,
        bannerUrl: input.bannerUrl ?? null,
        publishedLabel: input.publishedLabel ?? null,
        readingMinutes: input.readingMinutes ?? null,
        generationSeed: input.generationSeed ?? null,
        generationModel: input.generationModel ?? null,
      })
      .returning({ id: magazineIssues.id, slug: magazineIssues.slug });

    if (input.books.length > 0) {
      await db.insert(magazineIssueBooks).values(
        input.books.map((b) => ({
          issueId: issue.id,
          bookId: b.bookId,
          sortOrder: b.sortOrder,
          blurb: b.blurb ?? null,
          artistPrompt: b.artistPrompt ?? null,
          artistQuote: b.artistQuote ?? null,
        })),
      );
    }

    return ok({ id: issue.id, slug: issue.slug });
  } catch (error) {
    console.error("Failed to create draft issue", error);
    return err({ reason: "Failed to create draft issue", error });
  }
}

/** Delete an issue and its book rows (cascade). */
export async function deleteIssue(id: string) {
  try {
    await db.delete(magazineIssues).where(eq(magazineIssues.id, id));
    return ok(true as const);
  } catch (error) {
    console.error("Failed to delete issue", error);
    return err({ reason: "Failed to delete issue", error });
  }
}

/** Set an issue's lifecycle status (e.g. draft -> approved). */
export async function setIssueStatus(id: string, status: MagazineIssueStatus) {
  try {
    await db
      .update(magazineIssues)
      .set({ status })
      .where(eq(magazineIssues.id, id));
    return ok(true as const);
  } catch (error) {
    console.error("Failed to set issue status", error);
    return err({ reason: "Failed to set issue status", error });
  }
}

/**
 * Manually add one book to the end of an issue's running order. Guards against
 * adding the same book twice; the new row starts with no blurb / artist prompt
 * (the admin fills those in, or regenerates the blurb via AI afterwards).
 */
export async function addIssueBook(issueId: string, bookId: string) {
  try {
    const existing = await db.query.magazineIssueBooks.findFirst({
      where: and(
        eq(magazineIssueBooks.issueId, issueId),
        eq(magazineIssueBooks.bookId, bookId),
      ),
      columns: { id: true },
    });
    if (existing) return err({ reason: "That book is already in this issue" });

    const [row] = await db
      .select({
        max: sql<number | null>`max(${magazineIssueBooks.sortOrder})`,
      })
      .from(magazineIssueBooks)
      .where(eq(magazineIssueBooks.issueId, issueId));
    const nextSort = (row?.max ?? -1) + 1;

    await db.insert(magazineIssueBooks).values({
      issueId,
      bookId,
      sortOrder: nextSort,
    });
    return ok(true as const);
  } catch (error) {
    console.error("Failed to add book to issue", error);
    return err({ reason: "Failed to add book to issue", error });
  }
}

/** Remove one book from an issue (pruning a generated draft). */
export async function removeIssueBook(issueId: string, bookId: string) {
  try {
    await db
      .delete(magazineIssueBooks)
      .where(
        and(
          eq(magazineIssueBooks.issueId, issueId),
          eq(magazineIssueBooks.bookId, bookId),
        ),
      );
    return ok(true as const);
  } catch (error) {
    console.error("Failed to remove book from issue", error);
    return err({ reason: "Failed to remove book from issue", error });
  }
}

/**
 * Nudge one book up or down within an issue's running order. Loads the current
 * order, swaps the book with its neighbour, then renumbers every row so
 * sortOrder stays dense (0..n-1) regardless of any pre-existing gaps or ties.
 * A move past either edge is a no-op.
 */
export async function moveIssueBook(
  issueId: string,
  bookId: string,
  direction: "up" | "down",
) {
  try {
    const rows = await db.query.magazineIssueBooks.findMany({
      where: eq(magazineIssueBooks.issueId, issueId),
      orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.createdAt)],
      columns: { id: true, bookId: true },
    });

    const index = rows.findIndex((r) => r.bookId === bookId);
    if (index === -1) return err({ reason: "Book is not in this issue" });

    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= rows.length) return ok(true as const);

    const reordered = [...rows];
    [reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index],
    ];

    await db.transaction(async (tx) => {
      for (let i = 0; i < reordered.length; i += 1) {
        await tx
          .update(magazineIssueBooks)
          .set({ sortOrder: i })
          .where(eq(magazineIssueBooks.id, reordered[i].id));
      }
    });
    return ok(true as const);
  } catch (error) {
    console.error("Failed to reorder issue book", error);
    return err({ reason: "Failed to reorder book", error });
  }
}

/** The next unused issue number (max + 1, or 1). */
export async function nextIssueNumber(): Promise<number> {
  const [row] = await db
    .select({ max: sql<number | null>`max(${magazineIssues.issueNumber})` })
    .from(magazineIssues);
  return (row?.max ?? 0) + 1;
}

/** Set (or change) an issue's number. Fails if the number is taken. */
export async function setIssueNumber(id: string, issueNumber: number) {
  try {
    const existing = await db.query.magazineIssues.findFirst({
      where: and(
        eq(magazineIssues.issueNumber, issueNumber),
        sql`${magazineIssues.id} <> ${id}`,
      ),
      columns: { id: true },
    });
    if (existing) {
      return err({ reason: `Issue number ${issueNumber} is already taken` });
    }
    await db
      .update(magazineIssues)
      .set({ issueNumber })
      .where(eq(magazineIssues.id, id));
    return ok(true as const);
  } catch (error) {
    console.error("Failed to set issue number", error);
    return err({ reason: "Failed to set issue number", error });
  }
}

/**
 * Toggle an issue between published and draft. Publishing assigns the next
 * free issue number if it doesn't have one yet; unpublishing keeps the number.
 * Returns the new published state.
 */
export async function togglePublish(id: string) {
  try {
    const issue = await db.query.magazineIssues.findFirst({
      where: eq(magazineIssues.id, id),
      columns: { status: true, issueNumber: true },
    });
    if (!issue) return err({ reason: "Issue not found" });

    if (issue.status === "published") {
      await db
        .update(magazineIssues)
        .set({ status: "draft" })
        .where(eq(magazineIssues.id, id));
      return ok(false as const);
    }

    const issueNumber = issue.issueNumber ?? (await nextIssueNumber());
    await db
      .update(magazineIssues)
      .set({ status: "published", issueNumber })
      .where(eq(magazineIssues.id, id));
    return ok(true as const);
  } catch (error) {
    console.error("Failed to toggle publish", error);
    return err({ reason: "Failed to toggle publish", error });
  }
}

/** Update editable issue details (title, subtitle, editor's letter). */
export async function updateIssueDetails(
  id: string,
  fields: {
    title?: string;
    subtitle?: string | null;
    editorsLetterTitle?: string | null;
    editorsLetter?: string[];
  },
) {
  try {
    await db
      .update(magazineIssues)
      .set(fields)
      .where(eq(magazineIssues.id, id));
    return ok(true as const);
  } catch (error) {
    console.error("Failed to update issue details", error);
    return err({ reason: "Failed to update issue details", error });
  }
}

/** Update the generated blurb for one book within an issue. */
export async function updateIssueBookBlurb(
  issueId: string,
  bookId: string,
  blurb: string | null,
) {
  try {
    await db
      .update(magazineIssueBooks)
      .set({ blurb })
      .where(
        and(
          eq(magazineIssueBooks.issueId, issueId),
          eq(magazineIssueBooks.bookId, bookId),
        ),
      );
    return ok(true as const);
  } catch (error) {
    console.error("Failed to update book blurb", error);
    return err({ reason: "Failed to update book blurb", error });
  }
}

/** Set (or clear) the featured image for one book within an issue. Passing
 *  `null` reverts to the book's cover / first image on render. */
export async function updateIssueBookImage(
  issueId: string,
  bookId: string,
  selectedImageUrl: string | null,
) {
  try {
    const [row] = await db
      .update(magazineIssueBooks)
      .set({ selectedImageUrl })
      .where(
        and(
          eq(magazineIssueBooks.issueId, issueId),
          eq(magazineIssueBooks.bookId, bookId),
        ),
      )
      .returning({ bookId: magazineIssueBooks.bookId });
    if (!row) return err({ reason: "Book is not in this issue" });
    return ok(true as const);
  } catch (error) {
    console.error("Failed to update book image", error);
    return err({ reason: "Failed to update image", error });
  }
}

/** Save (or overwrite) the artist's answer/quote to publish alongside a book. */
export async function updateIssueBookArtistQuote(
  issueId: string,
  bookId: string,
  artistQuote: string | null,
) {
  try {
    await db
      .update(magazineIssueBooks)
      .set({ artistQuote })
      .where(
        and(
          eq(magazineIssueBooks.issueId, issueId),
          eq(magazineIssueBooks.bookId, bookId),
        ),
      );
    return ok(true as const);
  } catch (error) {
    console.error("Failed to update artist quote", error);
    return err({ reason: "Failed to update artist quote", error });
  }
}

/** Save (or overwrite) the editorial question posed to the artist for a book. */
export async function updateIssueBookArtistPrompt(
  issueId: string,
  bookId: string,
  artistPrompt: string | null,
) {
  try {
    await db
      .update(magazineIssueBooks)
      .set({ artistPrompt })
      .where(
        and(
          eq(magazineIssueBooks.issueId, issueId),
          eq(magazineIssueBooks.bookId, bookId),
        ),
      );
    return ok(true as const);
  } catch (error) {
    console.error("Failed to update artist prompt", error);
    return err({ reason: "Failed to update artist prompt", error });
  }
}

/**
 * Replace one book in an issue with another, keeping its slot
 * (sortOrder). Writes the fresh blurb / artist prompt and clears any stale
 * artist quote from the previous book.
 */
export async function swapIssueBook(
  issueId: string,
  oldBookId: string,
  newBookId: string,
  fields: { blurb: string | null; artistPrompt: string | null },
) {
  try {
    const [row] = await db
      .update(magazineIssueBooks)
      .set({
        bookId: newBookId,
        blurb: fields.blurb,
        artistPrompt: fields.artistPrompt,
        artistQuote: null,
        // The old image belonged to the previous book — drop the override.
        selectedImageUrl: null,
      })
      .where(
        and(
          eq(magazineIssueBooks.issueId, issueId),
          eq(magazineIssueBooks.bookId, oldBookId),
        ),
      )
      .returning({ bookId: magazineIssueBooks.bookId });
    if (!row) return err({ reason: "Book is not in this issue" });
    return ok(true as const);
  } catch (error) {
    console.error("Failed to swap issue book", error);
    return err({ reason: "Failed to swap book", error });
  }
}

/** Save (or overwrite) a creator's contact email — used when emailing an
 *  artist their magazine prompt and no address is on file yet. */
export async function saveCreatorEmail(creatorId: string, email: string) {
  try {
    await db
      .update(creators)
      .set({ email })
      .where(eq(creators.id, creatorId));
    return ok(true as const);
  } catch (error) {
    console.error("Failed to save creator email", error);
    return err({ reason: "Failed to save creator email", error });
  }
}

/** Stamp the moment an artist was emailed their prompt for one issue book. */
export async function stampArtistEmailSent(issueId: string, bookId: string) {
  try {
    const [row] = await db
      .update(magazineIssueBooks)
      .set({ artistEmailSentAt: new Date() })
      .where(
        and(
          eq(magazineIssueBooks.issueId, issueId),
          eq(magazineIssueBooks.bookId, bookId),
        ),
      )
      .returning({ artistEmailSentAt: magazineIssueBooks.artistEmailSentAt });
    if (!row) return err({ reason: "Book is not in this issue" });
    return ok(row.artistEmailSentAt as Date);
  } catch (error) {
    console.error("Failed to stamp artist email", error);
    return err({ reason: "Failed to record sent email", error });
  }
}

