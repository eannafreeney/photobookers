import { and, eq } from "drizzle-orm";
import { client, db } from "@/db/client";
import { magazineIssues, type MagazineIssueStatus } from "@/db/schema";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS,
  type BookCardResult,
} from "@/constants/queries";
import { err, ok } from "@/lib/result";

export type MagazineIssuePlacement = {
  bookId: string;
  sortOrder: number;
  /** Global 1-based position across the whole issue. */
  number: number;
  blurb: string | null;
  artistPrompt: string | null;
  artistQuote: string | null;
  /** When the artist was emailed their prompt, or `null` if not yet sent. */
  artistEmailSentAt: Date | null;
  book: BookCardResult | null;
};

export type MagazineIssueView = {
  id: string;
  status: MagazineIssueStatus;
  issueNumber: number | null;
  slug: string;
  kicker: string | null;
  title: string;
  subtitle: string | null;
  theme: string | null;
  editorsLetterTitle: string | null;
  editorsLetter: string[];
  coverUrl: string | null;
  bannerUrl: string | null;
  publishedLabel: string | null;
  readingMinutes: number | null;
  placements: MagazineIssuePlacement[];
};

export type MagazineIssueListItem = {
  slug: string;
  issueNumber: number | null;
  kicker: string | null;
  title: string;
  subtitle: string | null;
  coverUrl: string | null;
  publishedLabel: string | null;
};

type IssueWithBooks = NonNullable<Awaited<ReturnType<typeof findIssueBySlug>>>;

function findIssueBySlug(slug: string) {
  return db.query.magazineIssues.findFirst({
    where: and(eq(magazineIssues.slug, slug)),
    with: {
      books: {
        orderBy: (table, { asc }) => [asc(table.sortOrder)],
        with: {
          book: {
            columns: BOOK_CARD_COLUMNS,
            with: { artist: { columns: CREATOR_CARD_COLUMNS } },
          },
        },
      },
    },
  });
}

function findIssueById(id: string) {
  return db.query.magazineIssues.findFirst({
    where: eq(magazineIssues.id, id),
    with: {
      books: {
        orderBy: (table, { asc }) => [asc(table.sortOrder)],
        with: {
          book: {
            columns: BOOK_CARD_COLUMNS,
            with: { artist: { columns: CREATOR_CARD_COLUMNS } },
          },
        },
      },
    },
  });
}

function toIssueView(issue: IssueWithBooks): MagazineIssueView {
  const placements: MagazineIssuePlacement[] = issue.books.map(
    (entry, index) => ({
      bookId: entry.bookId,
      sortOrder: entry.sortOrder,
      number: index + 1,
      blurb: entry.blurb,
      artistPrompt: entry.artistPrompt,
      artistQuote: entry.artistQuote,
      artistEmailSentAt: entry.artistEmailSentAt ?? null,
      book: (entry.book ?? null) as BookCardResult | null,
    }),
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
    placements,
  };
}

/** Load a published issue by slug, or `null` if not found / not published. */
export async function getPublishedIssueBySlug(slug: string) {
  try {
    const issue = await findIssueBySlug(slug);
    if (!issue || issue.status !== "published") return ok(null);
    return ok(toIssueView(issue));
  } catch (error) {
    console.error("Failed to load magazine issue", error);
    return err({ reason: "Failed to load magazine issue", error });
  }
}

/** Load any issue (any status) by id for the admin editor. */
export async function getIssueByIdForAdmin(id: string) {
  try {
    const issue = await findIssueById(id);
    if (!issue) return ok(null);
    return ok(toIssueView(issue));
  } catch (error) {
    console.error("Failed to load magazine issue", error);
    return err({ reason: "Failed to load magazine issue", error });
  }
}

/** Load one book's card data (cover, artist) — used to render a swapped-in row. */
export async function getBookCardById(
  bookId: string,
): Promise<BookCardResult | null> {
  const book = await db.query.books.findFirst({
    where: (table, { eq: eqOp }) => eqOp(table.id, bookId),
    columns: BOOK_CARD_COLUMNS,
    with: { artist: { columns: CREATOR_CARD_COLUMNS } },
  });
  return (book ?? null) as BookCardResult | null;
}

export type AdminIssueListItem = {
  id: string;
  status: MagazineIssueStatus;
  issueNumber: number | null;
  slug: string;
  title: string;
  theme: string | null;
  bookCount: number;
  createdAt: string | null;
};

/** All issues for the admin list, published first then newest drafts. */
export async function listAllIssuesForAdmin() {
  try {
    const rows = await client<AdminIssueListItem[]>`
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

/** Titles/themes of every existing issue, so generation can avoid repeats. */
export async function listAllThemeLabels(): Promise<string[]> {
  try {
    const rows = await db.query.magazineIssues.findMany({
      columns: { title: true, theme: true },
    });
    return rows.map((r) => (r.theme ? `${r.title} — ${r.theme}` : r.title));
  } catch (error) {
    console.error("Failed to list magazine themes", error);
    return [];
  }
}

/** List published issues, newest number first, for the magazine index. */
export async function listPublishedIssues() {
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
        publishedLabel: true,
      },
    });
    return ok(rows as MagazineIssueListItem[]);
  } catch (error) {
    console.error("Failed to list magazine issues", error);
    return err({ reason: "Failed to list magazine issues", error });
  }
}
