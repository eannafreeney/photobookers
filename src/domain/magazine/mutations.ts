import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  magazineIssues,
  magazineIssueBooks,
  type MagazineMovementData,
} from "@/db/schema";
import { err, ok } from "@/lib/result";

export type CreateDraftIssueBook = {
  bookId: string;
  movementId: string | null;
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
  movements?: MagazineMovementData[];
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
        movements: input.movements ?? null,
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
          movementId: b.movementId,
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
