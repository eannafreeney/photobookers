import { createRoute } from "hono-fsr";
import { z } from "zod";
import { paramValidator } from "../../../lib/validator";
import { getIsMobile } from "../../../lib/device";
import { getUser } from "../../../utils";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import InfoPage from "../../../pages/InfoPage";
import BookOfTheDayDetail from "../../../features/app/components/BookOfTheDayDetail";
import { getBookOfTheDayForDate } from "../../../features/app/BOTDServices";
import { getBookBySlug } from "../../../features/app/services";
import { botdPath } from "../../../features/app/spotlightUrls";
import {
  bookDescription,
  bookPageTitle,
  canonicalUrl,
  pageTitle,
  truncateDescription,
} from "../../../lib/seo";
import { parseDateString } from "../../../lib/utils";
import Button from "../../../components/app/Button";

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
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");

  const [botdError, bookOfTheDay] = await getBookOfTheDayForDate(date);
  if (botdError) {
    return c.html(
      <InfoPage errorMessage="Book of the day not found" user={user} />,
      404,
    );
  }

  const [bookError, bookResult] = await getBookBySlug(
    bookOfTheDay.book.slug,
    "published",
  );
  if (bookError || !bookResult) {
    return c.html(<InfoPage errorMessage="Book not found" user={user} />, 404);
  }

  const { book } = bookResult;
  const editorial = bookOfTheDay.instagramCaption?.trim() || null;

  const path = botdPath(date);
  const title = pageTitle(`Book of the Day — ${book.title}`);
  const description = truncateDescription(editorial ?? bookDescription(book));

  const galleryImages = [
    book.coverUrl,
    ...(book.images?.map((image) => image.imageUrl) ?? []),
  ].filter((url): url is string => url !== null);

  if (!user) {
    c.header("Vary", "Cookie");
    c.header(
      "Cache-Control",
      "private, max-age=120, stale-while-revalidate=600",
    );
  } else {
    c.header("Cache-Control", "private, no-store");
  }

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, path)}
      user={user}
      currentPath={currentPath}
      adminEditHref={`/dashboard/admin/books/${book.id}`}
      shareOg={{
        title: bookPageTitle(book.title, book.artist?.displayName),
        description,
        image: book.coverUrl ?? undefined,
        url: canonicalUrl(c.req.url, path),
      }}
    >
      <Page>
        <BookOfTheDayDetail
          book={book}
          galleryImages={galleryImages}
          isMobile={isMobile}
          currentPath={currentPath}
          user={user}
          date={date}
          editorial={editorial}
        />
        <a href="/book-of-the-day" class="mx-auto">
          <Button variant="outline" color="primary" width="auto">
            ← All Books of the Day
          </Button>
        </a>
      </Page>
    </AppLayout>,
  );
});
