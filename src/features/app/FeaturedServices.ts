import { db } from "../../db/client";
import { featuredBooksOfTheWeek } from "../../db/schema";
import { eq } from "drizzle-orm";
import { BOOK_CARD_COLUMNS } from "../../constants/queries";
import { CREATOR_CARD_COLUMNS } from "../../constants/queries";

function toWeekStart(d: Date): Date {
  const date = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const day = date.getUTCDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  date.setUTCDate(date.getUTCDate() - daysToMonday);
  return date;
}

export async function getThisWeeksFeaturedBooks() {
  const weekStart = toWeekStart(new Date());
  return db.query.featuredBooksOfTheWeek.findMany({
    where: eq(featuredBooksOfTheWeek.weekStart, weekStart),
    orderBy: [featuredBooksOfTheWeek.position],
    with: {
      book: {
        columns: BOOK_CARD_COLUMNS,
        with: {
          artist: { columns: CREATOR_CARD_COLUMNS },
          publisher: { columns: CREATOR_CARD_COLUMNS },
          images: {
            columns: { id: true, imageUrl: true },
            orderBy: (bookImages, { asc }) => [asc(bookImages.sortOrder)],
          },
        },
      },
    },
  });
}
