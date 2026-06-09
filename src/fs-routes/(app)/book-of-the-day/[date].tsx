import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator";
import { getUser } from "../../../utils";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import InfoPage from "../../../pages/InfoPage";
import BookCard from "../../../components/app/BookCard";
import RelatedBooks from "../../../features/app/components/RelatedBooks";
import NewsletterCard from "../../../features/app/components/NewsletterCard";
import { getBookOfTheDayForDate } from "../../../features/app/BOTDServices";
import { botdPath } from "../../../features/app/spotlightUrls";
import { canonicalUrl, pageTitle, truncateDescription } from "../../../lib/seo";
import { parseDateString, toDateString } from "../../../lib/utils";
import { z } from "zod";

const dateParamSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .transform(parseDateString)
    .refine((d) => !Number.isNaN(d.getTime()), "Invalid date"),
});

export const GET = createRoute(paramValidator(dateParamSchema), async (c) => {
  const user = await getUser(c);
  const date = c.req.valid("param").date;
  const currentPath = c.req.path;

  const [error, bookOfTheDay] = await getBookOfTheDayForDate(date);
  if (error) {
    return c.html(
      <InfoPage errorMessage="Book of the day not found" user={user} />,
      404,
    );
  }

  const { book } = bookOfTheDay;
  const editorial = bookOfTheDay.instagramCaption?.trim() || null;

  const path = botdPath(date);
  const title = pageTitle(`Book of the Day — ${book.title}`);
  const description = truncateDescription(
    editorial ??
      `${book.title}${book.artist ? ` by ${book.artist.displayName}` : ""}. Photobookers Book of the Day for ${toDateString(date)}.`,
  );

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, path)}
      user={user}
      currentPath={currentPath}
      shareOg={{
        title,
        description,
        image: book.coverUrl ?? undefined,
        url: canonicalUrl(c.req.url, path),
      }}
    >
      <Page>
        <p class="text-sm text-on-surface-strong font-medium">
          Book of the Day · {toDateString(date)}
        </p>
        <h1 class="text-3xl font-bold mt-2">{book.title}</h1>
        {book.artist ? (
          <p class="text-lg text-on-surface mt-1">
            by {book.artist.displayName}
          </p>
        ) : null}
        {editorial ? (
          <p class="mt-6 text-on-surface whitespace-pre-line">{editorial}</p>
        ) : null}
        <div class="mt-8">
          <BookCard book={book} user={user} />
        </div>
        <div class="mt-10">
          <RelatedBooks book={book} user={user} />
        </div>
        <div class="mt-10">
          <NewsletterCard />
        </div>
        <p class="mt-8 text-sm">
          <a href="/book-of-the-day" class="underline">
            ← All Books of the Day
          </a>
        </p>
      </Page>
    </AppLayout>,
  );
});
