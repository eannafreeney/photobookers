import { and, eq, ilike, inArray, notInArray, or } from "drizzle-orm";
import { client, db } from "../../db/client.js";
import {
  books,
  creators,
  magazineIssueBooks,
  magazineIssues
} from "../../db/schema.js";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS
} from "../../constants/queries.js";
import { err, ok } from "../../lib/result.js";
function findIssueBySlug(slug) {
  return db.query.magazineIssues.findFirst({
    where: and(eq(magazineIssues.slug, slug)),
    with: {
      books: {
        orderBy: (table, { asc }) => [asc(table.sortOrder)],
        with: {
          book: {
            columns: BOOK_CARD_COLUMNS,
            with: {
              artist: { columns: CREATOR_CARD_COLUMNS },
              images: {
                columns: { imageUrl: true },
                orderBy: (table, { asc }) => [asc(table.sortOrder)]
              }
            }
          }
        }
      }
    }
  });
}
function findIssueById(id) {
  return db.query.magazineIssues.findFirst({
    where: eq(magazineIssues.id, id),
    with: {
      books: {
        orderBy: (table, { asc }) => [asc(table.sortOrder)],
        with: {
          book: {
            columns: BOOK_CARD_COLUMNS,
            with: {
              artist: { columns: CREATOR_CARD_COLUMNS },
              images: {
                columns: { imageUrl: true },
                orderBy: (table, { asc }) => [asc(table.sortOrder)]
              }
            }
          }
        }
      }
    }
  });
}
function toIssueView(issue) {
  const placements = issue.books.map(
    (entry, index) => ({
      bookId: entry.bookId,
      sortOrder: entry.sortOrder,
      number: index + 1,
      blurb: entry.blurb,
      artistPrompt: entry.artistPrompt,
      artistQuote: entry.artistQuote,
      artistEmailSentAt: entry.artistEmailSentAt ?? null,
      selectedImageUrl: entry.selectedImageUrl ?? null,
      book: entry.book ?? null
    })
  );
  return {
    id: issue.id,
    status: issue.status,
    issueNumber: issue.issueNumber,
    slug: issue.slug,
    kicker: issue.kicker,
    title: issue.title,
    subtitle: issue.subtitle,
    theme: issue.theme,
    editorsLetterTitle: issue.editorsLetterTitle,
    editorsLetter: issue.editorsLetter ?? [],
    coverUrl: issue.coverUrl,
    bannerUrl: issue.bannerUrl,
    publishedLabel: issue.publishedLabel,
    readingMinutes: issue.readingMinutes,
    placements
  };
}
async function getPublishedIssueBySlug(slug) {
  try {
    const issue = await findIssueBySlug(slug);
    if (!issue || issue.status !== "published") return ok(null);
    return ok(toIssueView(issue));
  } catch (error) {
    console.error("Failed to load magazine issue", error);
    return err({ reason: "Failed to load magazine issue", error });
  }
}
async function getIssueByIdForAdmin(id) {
  try {
    const issue = await findIssueById(id);
    if (!issue) return ok(null);
    return ok(toIssueView(issue));
  } catch (error) {
    console.error("Failed to load magazine issue", error);
    return err({ reason: "Failed to load magazine issue", error });
  }
}
async function getBookCardById(bookId) {
  const book = await db.query.books.findFirst({
    where: (table, { eq: eqOp }) => eqOp(table.id, bookId),
    columns: BOOK_CARD_COLUMNS,
    with: { artist: { columns: CREATOR_CARD_COLUMNS } }
  });
  return book ?? null;
}
async function searchBooksForIssue(issueId, query, limit = 12) {
  const q = query.trim();
  if (!q) return [];
  const placed = await db.query.magazineIssueBooks.findMany({
    where: eq(magazineIssueBooks.issueId, issueId),
    columns: { bookId: true }
  });
  const placedIds = placed.map((p) => p.bookId);
  const creatorRows = await db.select({ id: creators.id }).from(creators).where(ilike(creators.displayName, `%${q}%`));
  const creatorIds = creatorRows.map((r) => r.id);
  const match = creatorIds.length > 0 ? or(
    ilike(books.title, `%${q}%`),
    inArray(books.artistId, creatorIds),
    inArray(books.publisherId, creatorIds)
  ) : ilike(books.title, `%${q}%`);
  const where = and(
    placedIds.length > 0 ? notInArray(books.id, placedIds) : void 0,
    match
  );
  const rows = await db.query.books.findMany({
    where,
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    limit,
    columns: BOOK_CARD_COLUMNS,
    with: { artist: { columns: CREATOR_CARD_COLUMNS } }
  });
  return rows;
}
async function listAllIssuesForAdmin() {
  try {
    const rows = await client`
      SELECT
        i.id,
        i.status,
        i.issue_number AS "issueNumber",
        i.slug,
        i.title,
        i.theme,
        (SELECT count(*)::int FROM magazine_issue_books m WHERE m.issue_id = i.id) AS "bookCount",
        i.created_at AS "createdAt"
      FROM magazine_issues i
      ORDER BY
        CASE i.status WHEN 'published' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
        i.issue_number DESC NULLS LAST,
        i.created_at DESC`;
    return ok(rows);
  } catch (error) {
    console.error("Failed to list issues", error);
    return err({ reason: "Failed to list issues", error });
  }
}
async function listAllThemeLabels() {
  try {
    const rows = await db.query.magazineIssues.findMany({
      columns: { title: true, theme: true }
    });
    return rows.map((r) => r.theme ? `${r.title} \u2014 ${r.theme}` : r.title);
  } catch (error) {
    console.error("Failed to list magazine themes", error);
    return [];
  }
}
async function listPublishedIssues() {
  try {
    const rows = await db.query.magazineIssues.findMany({
      where: eq(magazineIssues.status, "published"),
      orderBy: (table, { desc }) => [desc(table.issueNumber)],
      columns: {
        slug: true,
        issueNumber: true,
        kicker: true,
        title: true,
        subtitle: true,
        coverUrl: true,
        publishedLabel: true
      }
    });
    return ok(rows);
  } catch (error) {
    console.error("Failed to list magazine issues", error);
    return err({ reason: "Failed to list magazine issues", error });
  }
}
export {
  getBookCardById,
  getIssueByIdForAdmin,
  getPublishedIssueBySlug,
  listAllIssuesForAdmin,
  listAllThemeLabels,
  listPublishedIssues,
  searchBooksForIssue
};
