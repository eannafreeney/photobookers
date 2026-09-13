import { and, eq, isNull, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "../../db/client";
import { books, type Creator } from "../../db/schema";
import { err, ok } from "../../lib/result";
import { toPressClips, type PressClipBook } from "./pressClips";

const pressBookColumns = {
  title: true,
  slug: true,
  coverUrl: true,
  releaseDate: true,
  pressLinks: true,
} as const;

const pressBookWith = {
  artist: { columns: { displayName: true } },
  publisher: { columns: { displayName: true } },
};

function publishedPressBooksWhere(...extra: SQL[]) {
  return and(
    eq(books.publicationStatus, "published"),
    eq(books.approvalStatus, "approved"),
    or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
    sql`jsonb_array_length(${books.pressLinks}) > 0`,
    ...extra,
  );
}

async function queryPressClipBooks(where: SQL | undefined) {
  const rows = await db.query.books.findMany({
    columns: pressBookColumns,
    where,
    with: pressBookWith,
  });
  return toPressClips(rows as PressClipBook[]);
}

export async function listPressClips() {
  try {
    return ok(await queryPressClipBooks(publishedPressBooksWhere()));
  } catch (error) {
    console.error("Failed to list press clips", error);
    return err({ reason: "Failed to list press clips", error });
  }
}

export async function listPressClipsForCreator(
  creator: Pick<Creator, "id" | "type">,
) {
  try {
    const roleColumn =
      creator.type === "publisher" ? books.publisherId : books.artistId;
    return ok(
      await queryPressClipBooks(
        publishedPressBooksWhere(eq(roleColumn, creator.id)),
      ),
    );
  } catch (error) {
    console.error("Failed to list creator press clips", error);
    return err({ reason: "Failed to list creator press clips", error });
  }
}
