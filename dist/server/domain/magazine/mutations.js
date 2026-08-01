import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  creators,
  magazineIssues,
  magazineIssueBooks
} from "../../db/schema.js";
import { err, ok } from "../../lib/result.js";
function slugify(value) {
  const base = value.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 80).replace(/^-+|-+$/g, "");
  return base || "issue";
}
async function uniqueSlug(base) {
  let slug = base;
  let n = 1;
  while (await db.query.magazineIssues.findFirst({
    where: eq(magazineIssues.slug, slug),
    columns: { id: true }
  })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}
async function createDraftIssue(input) {
  try {
    const slug = await uniqueSlug(slugify(input.title));
    const [issue] = await db.insert(magazineIssues).values({
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
      generationModel: input.generationModel ?? null
    }).returning({ id: magazineIssues.id, slug: magazineIssues.slug });
    if (input.books.length > 0) {
      await db.insert(magazineIssueBooks).values(
        input.books.map((b) => ({
          issueId: issue.id,
          bookId: b.bookId,
          sortOrder: b.sortOrder,
          blurb: b.blurb ?? null,
          artistPrompt: b.artistPrompt ?? null,
          artistQuote: b.artistQuote ?? null
        }))
      );
    }
    return ok({ id: issue.id, slug: issue.slug });
  } catch (error) {
    console.error("Failed to create draft issue", error);
    return err({ reason: "Failed to create draft issue", error });
  }
}
async function deleteIssue(id) {
  try {
    await db.delete(magazineIssues).where(eq(magazineIssues.id, id));
    return ok(true);
  } catch (error) {
    console.error("Failed to delete issue", error);
    return err({ reason: "Failed to delete issue", error });
  }
}
async function setIssueStatus(id, status) {
  try {
    await db.update(magazineIssues).set({ status }).where(eq(magazineIssues.id, id));
    return ok(true);
  } catch (error) {
    console.error("Failed to set issue status", error);
    return err({ reason: "Failed to set issue status", error });
  }
}
async function addIssueBook(issueId, bookId) {
  try {
    const existing = await db.query.magazineIssueBooks.findFirst({
      where: and(
        eq(magazineIssueBooks.issueId, issueId),
        eq(magazineIssueBooks.bookId, bookId)
      ),
      columns: { id: true }
    });
    if (existing) return err({ reason: "That book is already in this issue" });
    const [row] = await db.select({
      max: sql`max(${magazineIssueBooks.sortOrder})`
    }).from(magazineIssueBooks).where(eq(magazineIssueBooks.issueId, issueId));
    const nextSort = (row?.max ?? -1) + 1;
    await db.insert(magazineIssueBooks).values({
      issueId,
      bookId,
      sortOrder: nextSort
    });
    return ok(true);
  } catch (error) {
    console.error("Failed to add book to issue", error);
    return err({ reason: "Failed to add book to issue", error });
  }
}
async function removeIssueBook(issueId, bookId) {
  try {
    await db.delete(magazineIssueBooks).where(
      and(
        eq(magazineIssueBooks.issueId, issueId),
        eq(magazineIssueBooks.bookId, bookId)
      )
    );
    return ok(true);
  } catch (error) {
    console.error("Failed to remove book from issue", error);
    return err({ reason: "Failed to remove book from issue", error });
  }
}
async function moveIssueBook(issueId, bookId, direction) {
  try {
    const rows = await db.query.magazineIssueBooks.findMany({
      where: eq(magazineIssueBooks.issueId, issueId),
      orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.createdAt)],
      columns: { id: true, bookId: true }
    });
    const index = rows.findIndex((r) => r.bookId === bookId);
    if (index === -1) return err({ reason: "Book is not in this issue" });
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= rows.length) return ok(true);
    const reordered = [...rows];
    [reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index]
    ];
    await db.transaction(async (tx) => {
      for (let i = 0; i < reordered.length; i += 1) {
        await tx.update(magazineIssueBooks).set({ sortOrder: i }).where(eq(magazineIssueBooks.id, reordered[i].id));
      }
    });
    return ok(true);
  } catch (error) {
    console.error("Failed to reorder issue book", error);
    return err({ reason: "Failed to reorder book", error });
  }
}
async function nextIssueNumber() {
  const [row] = await db.select({ max: sql`max(${magazineIssues.issueNumber})` }).from(magazineIssues);
  return (row?.max ?? 0) + 1;
}
async function setIssueNumber(id, issueNumber) {
  try {
    const existing = await db.query.magazineIssues.findFirst({
      where: and(
        eq(magazineIssues.issueNumber, issueNumber),
        sql`${magazineIssues.id} <> ${id}`
      ),
      columns: { id: true }
    });
    if (existing) {
      return err({ reason: `Issue number ${issueNumber} is already taken` });
    }
    await db.update(magazineIssues).set({ issueNumber }).where(eq(magazineIssues.id, id));
    return ok(true);
  } catch (error) {
    console.error("Failed to set issue number", error);
    return err({ reason: "Failed to set issue number", error });
  }
}
async function togglePublish(id) {
  try {
    const issue = await db.query.magazineIssues.findFirst({
      where: eq(magazineIssues.id, id),
      columns: { status: true, issueNumber: true }
    });
    if (!issue) return err({ reason: "Issue not found" });
    if (issue.status === "published") {
      await db.update(magazineIssues).set({ status: "draft" }).where(eq(magazineIssues.id, id));
      return ok(false);
    }
    const issueNumber = issue.issueNumber ?? await nextIssueNumber();
    await db.update(magazineIssues).set({ status: "published", issueNumber }).where(eq(magazineIssues.id, id));
    return ok(true);
  } catch (error) {
    console.error("Failed to toggle publish", error);
    return err({ reason: "Failed to toggle publish", error });
  }
}
async function updateIssueDetails(id, fields) {
  try {
    await db.update(magazineIssues).set(fields).where(eq(magazineIssues.id, id));
    return ok(true);
  } catch (error) {
    console.error("Failed to update issue details", error);
    return err({ reason: "Failed to update issue details", error });
  }
}
async function updateIssueBookBlurb(issueId, bookId, blurb) {
  try {
    await db.update(magazineIssueBooks).set({ blurb }).where(
      and(
        eq(magazineIssueBooks.issueId, issueId),
        eq(magazineIssueBooks.bookId, bookId)
      )
    );
    return ok(true);
  } catch (error) {
    console.error("Failed to update book blurb", error);
    return err({ reason: "Failed to update book blurb", error });
  }
}
async function updateIssueBookImage(issueId, bookId, selectedImageUrl) {
  try {
    const [row] = await db.update(magazineIssueBooks).set({ selectedImageUrl }).where(
      and(
        eq(magazineIssueBooks.issueId, issueId),
        eq(magazineIssueBooks.bookId, bookId)
      )
    ).returning({ bookId: magazineIssueBooks.bookId });
    if (!row) return err({ reason: "Book is not in this issue" });
    return ok(true);
  } catch (error) {
    console.error("Failed to update book image", error);
    return err({ reason: "Failed to update image", error });
  }
}
async function updateIssueBookArtistQuote(issueId, bookId, artistQuote) {
  try {
    await db.update(magazineIssueBooks).set({ artistQuote }).where(
      and(
        eq(magazineIssueBooks.issueId, issueId),
        eq(magazineIssueBooks.bookId, bookId)
      )
    );
    return ok(true);
  } catch (error) {
    console.error("Failed to update artist quote", error);
    return err({ reason: "Failed to update artist quote", error });
  }
}
async function updateIssueBookArtistPrompt(issueId, bookId, artistPrompt) {
  try {
    await db.update(magazineIssueBooks).set({ artistPrompt }).where(
      and(
        eq(magazineIssueBooks.issueId, issueId),
        eq(magazineIssueBooks.bookId, bookId)
      )
    );
    return ok(true);
  } catch (error) {
    console.error("Failed to update artist prompt", error);
    return err({ reason: "Failed to update artist prompt", error });
  }
}
async function swapIssueBook(issueId, oldBookId, newBookId, fields) {
  try {
    const [row] = await db.update(magazineIssueBooks).set({
      bookId: newBookId,
      blurb: fields.blurb,
      artistPrompt: fields.artistPrompt,
      artistQuote: null,
      // The old image belonged to the previous book — drop the override.
      selectedImageUrl: null
    }).where(
      and(
        eq(magazineIssueBooks.issueId, issueId),
        eq(magazineIssueBooks.bookId, oldBookId)
      )
    ).returning({ bookId: magazineIssueBooks.bookId });
    if (!row) return err({ reason: "Book is not in this issue" });
    return ok(true);
  } catch (error) {
    console.error("Failed to swap issue book", error);
    return err({ reason: "Failed to swap book", error });
  }
}
async function saveCreatorEmail(creatorId, email) {
  try {
    await db.update(creators).set({ email }).where(eq(creators.id, creatorId));
    return ok(true);
  } catch (error) {
    console.error("Failed to save creator email", error);
    return err({ reason: "Failed to save creator email", error });
  }
}
async function stampArtistEmailSent(issueId, bookId) {
  try {
    const [row] = await db.update(magazineIssueBooks).set({ artistEmailSentAt: /* @__PURE__ */ new Date() }).where(
      and(
        eq(magazineIssueBooks.issueId, issueId),
        eq(magazineIssueBooks.bookId, bookId)
      )
    ).returning({ artistEmailSentAt: magazineIssueBooks.artistEmailSentAt });
    if (!row) return err({ reason: "Book is not in this issue" });
    return ok(row.artistEmailSentAt);
  } catch (error) {
    console.error("Failed to stamp artist email", error);
    return err({ reason: "Failed to record sent email", error });
  }
}
export {
  addIssueBook,
  createDraftIssue,
  deleteIssue,
  moveIssueBook,
  nextIssueNumber,
  removeIssueBook,
  saveCreatorEmail,
  setIssueNumber,
  setIssueStatus,
  stampArtistEmailSent,
  swapIssueBook,
  togglePublish,
  updateIssueBookArtistPrompt,
  updateIssueBookArtistQuote,
  updateIssueBookBlurb,
  updateIssueBookImage,
  updateIssueDetails
};
